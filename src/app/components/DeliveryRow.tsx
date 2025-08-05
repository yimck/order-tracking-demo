import { useInngestSubscription } from "@inngest/realtime/hooks";
import { Delivery } from "../page";

export function DeliveryRow({ delivery }: { delivery: Delivery }) {
    const { latestData } = useInngestSubscription({refreshToken: () => Promise.resolve(delivery.token)});

    return (
        <tr>
            <td className="py-3">{delivery.deliveryDate}</td>
            <td>{delivery.deliveryId}</td>
            <td>{delivery.recipientName}</td>
            <td>{delivery.destinationAddress}</td>
            <td>{delivery.vehicleType}</td>
            <td className={
                latestData?.data.status === "Processing"
                ? "text-yellow-500"
                : latestData?.data.status === "Picked Up"
                ? "text-blue-500"
                : latestData?.data.status === "In Transit"
                ? "text-blue-500"
                : latestData?.data.status === "Fulfilled"
                ? "text-green-500"
                : latestData?.data.status === "Delayed In Transit"
                ? "text-red-500"
                : "text-black-600"
            }>{latestData?.data.status ? latestData.data.status : "Pending"}</td>
        </tr>
    );
}