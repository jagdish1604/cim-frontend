import { useState, useEffect } from "react";
import api from "../api/apiClient";

export default function CustomerModal({ open, onClose, onSuccess, editData }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: ""
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  const handleSubmit = async () => {
    try {
      setError("");

      if (!form.name || !form.email || !form.phoneNumber || !form.address) {
        setError("All fields are required");
        return;
      }

      if (editData) {
        await api.put(`/customers/${editData.customerId}`, form);
      } else {
        await api.post("/customers", form);
      }

      onSuccess(); // refresh list
      onClose();   // close modal
    } catch (err) {
      setError(err.response?.data || "Error occurred");
    }
  };

  if (!open) return null;

  return (
    <div style={{ background: "#00000088", position: "fixed", inset: 0 }}>
      <div style={{ background: "#fff", padding: 20, margin: "100px auto", width: 400 }}>
        
        <h3>{editData ? "Edit Customer" : "Add Customer"}</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Address"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
        />

        <input
          placeholder="Phone"
          value={form.phoneNumber}
          onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <br /><br />

        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}