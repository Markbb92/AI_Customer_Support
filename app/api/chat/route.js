import { SystemPrompt } from "@/app/SystemPrompt"
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory"
import { AIMessage, HumanMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import { Pinecone } from '@pinecone-database/pinecone'
import { NextResponse } from "next/server"
import OpenAI from "openai"

// const chat = new ChatOpenAI({
//   model: "gpt-3.5-turbo-1106",
// })

const chatMessageHistory = new ChatMessageHistory()


const openai = new OpenAI({
    apiKey:process.env.open_ai_key
}
)


export async function POST(req) {
    const data = await req.json()

    // Check if it's an initial message
    if (data[0].role === "system" && data[0].content === "Initial message") {
        const initialMessage = {
            role: "assistant",
            content: "Hello! I'm the AI customer support bot. How can I assist you today?"
        };
        return NextResponse.json({data: [initialMessage]}, {status: 200});
    }

    chatMessageHistory.addMessage({"role":data[0]["role"],"content":data[0]["content"]})
    // const {messages} = await req.json()
    // console.log(messages)

    // const embedding = await openai.embeddings.create({
    //   model: "text-embedding-3-small",
    //   input: SystemPrompt,
    //   encoding_format: "float",
    // });
    const messages = await chatMessageHistory.getMessages()
   try{
    const completion = await openai.chat.completions.create({
      messages: [...messages],
      model: "gpt-4",
  })

  const response = completion.choices[0]['message']['content']
 chatMessageHistory.addMessage({"role":'assistant',"content":response})


  const storedMessages = await chatMessageHistory.getMessages()
  return NextResponse.json({data:storedMessages},{status:200})
   }
   catch(error){
    return NextResponse.json({error:error},{status:400})
   }


    // console.log(completion.choices[0]);
    }
