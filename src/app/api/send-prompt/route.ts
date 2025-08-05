import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
    const { userId, deliveries, prompt } = await req.json();
    // When the user sends their prompt in the chatbot, this sends an event to invoke the communicateWithChatbot Inngest function
    await inngest.send({
        name: "ai/ai.requested",
        data: { userId, deliveries, prompt },
    });
}