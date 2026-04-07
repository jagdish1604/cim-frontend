import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function InvoiceModal({ open, onClose, onSuccess, editData }) {
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState({
    customerId: "",
    invoiceDate: "",
    terms: 0,
    dueDate: "",
    lines: []
  });

  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.get("/invoices/dropdown"); 
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (editData && open) {
      setForm({
        customerId: editData.customerId || "",

        invoiceDate: editData.invoiceDate
          ? editData.invoiceDate.split("T")[0]
          : "",

        terms: editData.terms || 0,

        dueDate: editData.dueDate
          ? editData.dueDate.split("T")[0]
          : "",

        lines: (editData.lines || []).map((l) => ({
          description: l.description || "",
          quantity: Number(l.quantity) || 1,
          unitPrice: Number(l.unitPrice) || 0,
          lineTotal:
            (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0)
        }))
      });
    }

    if (!editData && open) {
      setForm({
        customerId: "",
        invoiceDate: "",
        terms: 0,
        dueDate: "",
        lines: []
      });
    }
  }, [editData, open]);

  useEffect(() => {
    if (form.invoiceDate && form.terms >= 0) {
      const d = new Date(form.invoiceDate);
      d.setDate(d.getDate() + Number(form.terms));

      setForm(prev => ({
        ...prev,
        dueDate: d.toISOString().split("T")[0]
      }));
    }
  }, [form.invoiceDate, form.terms]);

  useEffect(() => {
    const sum = form.lines.reduce(
      (acc, l) => acc + (Number(l.lineTotal) || 0),
      0
    );
    setTotal(sum);
  }, [form.lines]);

  const addRow = () => {
    setForm(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        { description: "", quantity: 1, unitPrice: 0, lineTotal: 0 }
      ]
    }));
  };

  const updateLine = (i, field, value) => {
    const updated = [...form.lines];
    updated[i][field] = value;

    const qty = Number(updated[i].quantity) || 0;
    const price = Number(updated[i].unitPrice) || 0;

    updated[i].lineTotal = qty * price;

    setForm(prev => ({ ...prev, lines: updated }));
  };

  const removeRow = (i) => {
    const updated = form.lines.filter((_, index) => index !== i);
    setForm(prev => ({ ...prev, lines: updated }));
  };

  const handleSubmit = async () => {
    if (!form.customerId) return alert("Select customer");
    if (!form.invoiceDate) return alert("Select date");
    if (!form.lines.length) return alert("Add item");

    try {
      if (editData) {
       
        await api.put(`/invoices/${editData.invoiceId}`, {
          ...form,
          customerId: Number(form.customerId),
          totalAmount: total
        });

        onSuccess("Invoice updated");
      } else {
       
        await api.post("/invoices", {
          ...form,
          customerId: Number(form.customerId),
          totalAmount: total
        });

        onSuccess("Invoice created");
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    }
  };

  if (!open) return null;

  return (
    <div style={{ background: "#00000088", position: "fixed", inset: 0 }}>
      <div style={{ background: "#fff", padding: 20, margin: "50px auto", width: 600 }}>
        
        <h3>{editData ? "Edit Invoice" : "Add Invoice"}</h3>

        <select
          value={form.customerId}
          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              customerId: Number(e.target.value)
            }))
          }
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.customerId} value={c.customerId}>
              {c.name}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          type="date"
          value={form.invoiceDate}
          onChange={(e) =>
            setForm(prev => ({ ...prev, invoiceDate: e.target.value }))
          }
        />

        <input
          type="number"
          placeholder="Terms"
          value={form.terms}
          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              terms: Number(e.target.value)
            }))
          }
        />

        <p>Due Date: {form.dueDate}</p>

        <hr />

        <button onClick={addRow}>Add Item</button>

        {form.lines.map((l, i) => (
          <div key={i}>
            <input
              placeholder="Description"
              value={l.description}
              onChange={(e) => updateLine(i, "description", e.target.value)}
            />

            <input
              type="number"
              value={l.quantity}
              onChange={(e) =>
                updateLine(i, "quantity", Number(e.target.value))
              }
            />

            <input
              type="number"
              value={l.unitPrice}
              onChange={(e) =>
                updateLine(i, "unitPrice", Number(e.target.value))
              }
            />

            <span> Total: {l.lineTotal}</span>

            <button onClick={() => removeRow(i)}>X</button>
          </div>
        ))}

        <hr />

        <h4>Total: {total}</h4>

        <button onClick={handleSubmit}>
          {editData ? "Update" : "Save"}
        </button>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}