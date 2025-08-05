"use server";

import { inngest } from "@/inngest/client";
import { deliveryChannel } from "@/inngest/functions/delivery-tracking";
import { userChannel } from "@/inngest/functions/chatbot";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type DeliveryToken = Realtime.Token<typeof deliveryChannel, ["status"]>;
export type UserToken = Realtime.Token<typeof userChannel, ["ai"]>;

export async function fetchRealtimeSubscriptionToken(deliveryId: string): Promise<DeliveryToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: deliveryChannel(deliveryId),
        topics: ["status"],
    });

    return token;
}

export async function fetchRealtimeSubscriptionUserToken(userId: string): Promise<UserToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: userChannel(userId),
        topics: ["ai"],
    });

    return token;
}