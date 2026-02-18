import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Bidder" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="mb-3 text-xl font-bold">Register</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded border p-2 text-black" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full rounded border p-2 text-black" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full rounded border p-2 text-black" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="w-full rounded border p-2 text-black" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option>Bidder</option>
          <option>Seller</option>
          <option>Admin</option>
        </select>
        <button className="btn-primary w-full">Register</button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-sm">Already have account? <Link className="text-brand-700" to="/login">Login</Link></p>
    </div>
  );
};

export default Register;
