import { inngest } from "../client";
import { channel, topic } from "@inngest/realtime";
import OpenAI from "openai";
import { Delivery } from "@/app/page";

type ChatbotResponse = {
    response: string;
    prompt: string;
}

// Create a channel for each user
export const userChannel = channel((userId: string) => `user:${userId}`).addTopic(topic("ai").type<ChatbotResponse>());

const client = new OpenAI();

// Inngest Function: Processes the user prompt and publishes the LLM response
export const communicateWithChatbot = inngest.createFunction(
    { id: "communicate-with-chatbot" },
    { event: "ai/ai.requested" },
    async ({ event, publish, step }) => {
        const { userId, deliveries, prompt } = event.data;
        let contextPrompt = "";

        // Build a contextual prompt using the most recent delivery history
        if (deliveries.length > 0) {
            const deliveriesSummary = deliveries.map((delivery: Delivery) => {
                return `- ${delivery.deliveryId} for ${delivery.recipientName}, ${delivery.vehicleType} vehicle to ${delivery.destinationAddress} on ${delivery.deliveryDate} `
            }).join("\n");
            contextPrompt = `Here is my history of deliveries I booked so far. If the following question is about deliveries, respond accordingly. Otherwise, act like it's our first interaction.\n${deliveriesSummary}\n\nNow answer this: \n${prompt}`;
        } else {
            contextPrompt = `I have booked zero deliveries so far. If the following question is about deliveries, respond accordingly. Otherwise, act like it's our first interaction.\n\nNow answer this: \n${prompt}`;
        }

        await publish(
            userChannel(userId).ai({
                response: "START OF RESPONSE",
                prompt: prompt,
            })
        );

        await step.run("Stream AI Response", async () => {
            const responseStream = await client.chat.completions.create({
                model: "gpt-4.1",
                messages: [{ role: "user", content: contextPrompt }],
                stream: true,
            });

            for await (const chunk of responseStream) {
                const wordToken = chunk.choices?.[0]?.delta?.content;
                if (wordToken) {
                    await publish(
                        userChannel(userId).ai({
                            response: wordToken,
                            prompt: prompt,
                        })
                    );
                }
            }
        });

        await publish(
            userChannel(userId).ai({
                response: "END OF RESPONSE",
                prompt: prompt,
            })
        );
    }
);