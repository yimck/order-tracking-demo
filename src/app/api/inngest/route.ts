import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { trackDelivery } from "@/inngest/functions/delivery-tracking";
import { communicateWithChatbot } from "@/inngest/functions/chatbot";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [trackDelivery, communicateWithChatbot],
})