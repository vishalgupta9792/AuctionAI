import { useState } from "react";
import api from "../api/client";

const SellItem = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    basePrice: "",
    startTime: "",
    endTime: ""
  });
  const [message, setMessage] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auctions", { ...form, basePrice: Number(form.basePrice) });
      setMessage("Auction created successfully");
      setForm({ title: "", description: "", imageUrl: "", basePrice: "", startTime: "", endTime: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create auction");
    }
  };

  return (
    <div className="mx-auto max-w-xl card">
      <h1 className="mb-3 text-xl font-bold">Create Auction</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded border p-2 text-black" name="title" placeholder="Title" value={form.title} onChange={onChange} required />
        <textarea className="w-full rounded border p-2 text-black" name="description" placeholder="Description" value={form.description} onChange={onChange} required />
        <input className="w-full rounded border p-2 text-black" name="imageUrl" placeholder="Image URL (optional)" value={form.imageUrl} onChange={onChange} />
        <input className="w-full rounded border p-2 text-black" type="number" name="basePrice" placeholder="Base Price" value={form.basePrice} onChange={onChange} required />
        <input className="w-full rounded border p-2 text-black" type="datetime-local" name="startTime" value={form.startTime} onChange={onChange} required />
        <input className="w-full rounded border p-2 text-black" type="datetime-local" name="endTime" value={form.endTime} onChange={onChange} required />
        <button className="btn-primary w-full">Create</button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
};

export default SellItem;
