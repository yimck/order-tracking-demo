import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
    const { deliveryId } = await req.json();
    // When the user clicks "Book Delivery", this sends an event to invoke the trackDelivery Inngest function
    await inngest.send({
        name: "delivery/delivery.requested",
        data: { deliveryId },
    });
}