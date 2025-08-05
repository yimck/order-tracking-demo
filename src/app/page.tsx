"use client";

import { useState } from "react";
import { DeliveryRow } from "./components/DeliveryRow";
import { fetchRealtimeSubscriptionToken, DeliveryToken, fetchRealtimeSubscriptionUserToken } from "./actions/get-subscribe-token";
import { useInngestSubscription } from "@inngest/realtime/hooks";

export type Delivery = {
  deliveryDate: string;
  deliveryId: string;
  recipientName: string;
  destinationAddress: string;
  vehicleType: string;
  token: DeliveryToken;
}

export default function Home() {
  const [form, setForm] = useState({
    recipientName: "",
    destinationAddress: "",
    vehicleType: "",
  });
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [prompt, setPrompt] = useState("");

  const [userId] = useState("123");   // Simulating logged-in user for demo purposes
  const { data } = useInngestSubscription({
    refreshToken: () => fetchRealtimeSubscriptionUserToken(userId),
  });

  // Callback: Handles booking/requesting a delivery
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const deliveryDate = new Date(Date.now()).toLocaleString();
    const deliveryId = crypto.randomUUID();
    
    await fetch("/api/book-delivery", {
      method: "POST",
      body: JSON.stringify({ deliveryId }),
    });
    
    const token = await fetchRealtimeSubscriptionToken(deliveryId);
    
    setDeliveries((prev) => [...prev, { ...form, deliveryDate, deliveryId, token }]);
    
    setForm({
      recipientName: "",
      destinationAddress: "",
      vehicleType: "",
    });
  }

  // Callback: Handles sending prompt to OpenAI's API
  const handleSendPrompt = async () => {
    await fetch("/api/send-prompt", {
      method: "POST",
      body: JSON.stringify({ userId, deliveries, prompt })
    });

    setPrompt("");
  }

  return (
    <>
      <div className="h-screen flex gap-6">
        <div className="w-2/5 flex flex-col">
          <h1 className="my-8 tracking-tight font-mono text-3xl text-center">Request Delivery</h1>

          <form className="m-4 mb-40 space-y-9" onSubmit={handleSubmit}>
            <div>
              <input
                className="w-full border p-2 rounded text-sm"
                placeholder="Recipient Name"
                value={form.recipientName}
                onChange={(e) => setForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                required
              />
            </div>

            <div>
              <input
                className="w-full border p-2 rounded text-sm"
                placeholder="Destination Address"
                value={form.destinationAddress}
                onChange={(e) => setForm((prev) => ({ ...prev, destinationAddress: e.target.value }))}
                required
              />
            </div>

            <div>
              <select
                className="border p-2 rounded text-sm"
                value={form.vehicleType}
                onChange={(e) => setForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
                required
              >
                <option value="">Select Vehicle Size</option>
                <option value="Regular">Regular</option>
                <option value="Van">Van</option>
                <option value="Pickup">Pickup</option>
                <option value="Flatbed">Flatbed</option>
              </select>
            </div>

            <div className="flex justify-end ">
              <button className="border border-gray-800 px-4 py-1 rounded bg-black text-white text-sm" type="submit">Book Delivery</button>
            </div>
          </form>

          <div className="flex flex-col flex-1 border mx-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto text-sm m-4">
              {data.map((message, i) => (
                message.data.response === "START OF RESPONSE" ? (
                  <div className="flex justify-end mb-5" key={i}>
                    <p className="border p-2 rounded-md text-gray-600">{message.data.prompt}</p>
                  </div>
                ) :
                message.data.response === "END OF RESPONSE" ? (
                  <div key={i}>
                    <br />
                    <br />
                  </div>
                ) : (
                <span key={i}>{message.data.response}</span>
                )
              ))}
            </div>

            <div className="relative m-2">
              <textarea
                className="w-full border p-2 rounded text-sm"
                placeholder="Ask about your deliveries."
                value={prompt}
                rows={2}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button className="absolute bottom-0.5 right-1" onClick={handleSendPrompt}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>


        <div className="w-3/5">
          <h1 className="my-8 tracking-tight font-mono text-3xl text-center">Deliveries</h1>

          <div className="mx-14">
            <table className="w-full border border-gray-200 text-center text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3">Date</th>
                  <th>Delievery Id</th>
                  <th>Recipient&#39;s Name</th>
                  <th>Destination Address</th>
                  <th>Vehicle Type</th>
                  <th>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <DeliveryRow key={delivery.deliveryId} delivery={delivery} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
