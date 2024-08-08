import OpenAI from "openai";
import { SystemPrompt } from "@/app/SystemPrompt";
import { NextResponse } from "next/server";
const openai = new OpenAI({
    apiKey:process.env.open_ai_key
}
);


export async function POST(req) {
    const data = await req.json()
    console.log('data',data)
   
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role:'system',
                content: SystemPrompt
            },
            ...data
        ],
        model: "gpt-4",
    });
    return NextResponse.json({data:completion.choices[0]},{status:200})
    // console.log(completion.choices[0]);
    }
