import OpenAI from "openai"
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { SystemPrompt } from "@/app/SystemPrompt"
import { NextResponse } from "next/server"
import { Pinecone } from '@pinecone-database/pinecone'
import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query,setDoc,updateDoc,where ,limit, writeBatch} from "firebase/firestore";
import {db} from '@/firebase'




const openai = new OpenAI({  apiKey: process.env.open_ai_key});






 export async function GET(req){
    try{
    const user_id = req.headers.get('user_id');
    const chatHistoryCollectionRef = collection(db,"chat-history")
    //firebase is extremely annoying here and does not let me query with a where clause and order by clause at the same time
    //in the client -> need to map in reverse order. messages.reverse().map()
    const chatHistoryFromUser = query(chatHistoryCollectionRef,where("user_id","==",user_id),orderBy("timestamp","asc"))
    //pass this as context to the chain
    const chatHistorySnapshot = await getDocs(chatHistoryFromUser)
    const chatHistory = chatHistorySnapshot.docs.map((doc)=>doc.data())  
   
    return NextResponse.json({chatHistory},{status:200})
    }
    catch(error){
        return NextResponse.json({error:error.message},{status:400})
    }
   
   
}








//when user sends a message
//get the last 5 messages from the chat history as context
//pass the context to the chain
//get the response from the chain
//add the response to the chat history
//return the response
 export async function POST(req) {
    try{
    const user_id = req.headers.get('user_id');
    const data = await req.json();
    const user_prompt = data['message']
    const chat_history= await getContextFromChatHistory(req)
    const organized_chat_history = organize_chat_history(chat_history)
    console.log(organized_chat_history)
   
   
    const prompt = getPrompt(organized_chat_history,user_prompt)




    const completion = await openai.chat.completions.create({
        messages: [{'role':'system','content':prompt}],
        model: "gpt-4o-mini"
    })
// )
    const response = completion.choices[0].message.content


    //add to database
    await addDoc(collection(db,'chat-history'),{
        user_id:user_id,
        message:user_prompt,
        role:'user',
        timestamp:Date.now()
    })
    await addDoc(collection(db,'chat-history'),{
        user_id:user_id,
        message:response,
        role:'assistant',
        timestamp:Date.now()
    }
    )


    return NextResponse.json('success;y added message',{status:200})
}
catch(error){
    return NextResponse.json({error:error.message},{status:400})
}
 }


 const organize_chat_history = (chat_history)=>{
    let organized_chat_history = chat_history.map(msg => `${msg['role']}: ${msg['message']}`).join('\n')
    return organized_chat_history
 }


 export async function DELETE(req){
    try{
        const user_id = req.headers.get('user_id');
        const chatHistoryCollectionRef = collection(db,"chat-history")
        const chatHistoryFromUser = query(chatHistoryCollectionRef,where("user_id","==",user_id))
        const chatHistorySnapshot = await getDocs(chatHistoryFromUser)
        const batch = writeBatch(db);
        chatHistorySnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
        await batch.commit();
        return NextResponse.json('successfully deleted chat history',{status:200})
    }
    catch(error){
        return NextResponse.json({error:error.message},{status:400})
    }
 }


 //gets the last 5 messages from the chat history and returns them


 async function getContextFromChatHistory(req){
    try{
    const user_id = req.headers.get('user_id');
    const chatHistoryCollectionRef = collection(db,"chat-history")
    const chatHistoryFromUser = query(chatHistoryCollectionRef,where("user_id","==",user_id),limit(5))
    const chatHistorySnapshot = await getDocs(chatHistoryFromUser)
    const chatHistory = chatHistorySnapshot.docs.map((doc)=>doc.data())
    return chatHistory
}
catch(error){
    return NextResponse.json({error:error.message},{status:400})
}
}


 const getPrompt = (chat_history,user_prompt)=>{
    let SystemPrompt = `
    System Prompt:
   
    You are a customer support bot for Headstarter AI, a platform that provides AI-powered interviews for software engineering jobs. Your primary role is to assist users with inquiries related to the platform's features, troubleshooting issues, and providing information on the interview process.
   
    Key Responsibilities:
   
    Answer General Questions: Provide clear and concise answers to common questions about the platform, such as how to create an account, schedule interviews, and prepare for AI interviews.
   
    Technical Support: Assist users in troubleshooting technical issues they may encounter on the site, guiding them through potential solutions.
   
    User Guidance: Offer step-by-step instructions for navigating the platform, utilizing its features, and understanding the AI interview process.
   
    Feedback Collection: Encourage users to provide feedback on their experiences with the platform and report any bugs or issues.
   
    Maintain a Friendly Tone: Communicate in a friendly, approachable manner, ensuring users feel supported and valued.
   
    Example User Queries:
   
    "How do I create an account on Headstarter AI?"
    "What should I expect during an AI-powered interview?"
    "I'm having trouble accessing my interview results—what should I do?
   
    CHAT HISTORY: ${chat_history}
    USER PROMPT: ${user_prompt}
   
   
   
   
    `
    return SystemPrompt
  }

