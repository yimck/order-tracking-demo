import { inngest } from "../client";
import { channel, topic } from "@inngest/realtime";

type DeliveryStatus = {
    status: string;
    timestamp: number;
}

// Create a channel for each delivery
export const deliveryChannel = channel((deliveryId: string) => `order:${deliveryId}`).addTopic(topic("status").type<DeliveryStatus>());

const STATUSES = ["Processing", "Picked Up", "In Transit", "Delayed In Transit", "Fulfilled"];

// Inngest Function: Publishes delivery status updates
export const trackDelivery = inngest.createFunction(
    { id: "track-delivery" },
    { event: "delivery/delivery.requested" },
    async ({ event, publish, step }) => {
        for (let i = 0; i < STATUSES.length; i++) {
            const status = STATUSES[i];

            await publish(
                deliveryChannel(event.data.deliveryId).status({
                    status: status,
                    timestamp: Date.now(),
                })
            );

            // Simulating natural timing between delivery phases. For this demo a time between delivery phases is between 5s to 15s
            await step.sleep("simulate-timeline", Math.floor(Math.random() * (15000 - 5000)) + 5000);
        }
    }
);