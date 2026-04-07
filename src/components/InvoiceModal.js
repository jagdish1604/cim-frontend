import { useEffect, useState } from "react";
import api from "../api/apiClient";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function InvoiceModal({ open, onClose, onSuccess, editData }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({
    customerId: "",
    invoiceDate: "",
    terms: 0,
    dueDate: "",
    lines: []
  });

  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const res = await api.get("/invoices/dropdown");
    setCustomers(res.data || []);
  };

  // SET EDIT DATA
  useEffect(() => {
    if (editData && open) {
      setForm({
        customerId: editData.customerId,
        invoiceDate: editData.invoiceDate?.split("T")[0] || "",
        terms: editData.terms || 0,
        dueDate: editData.dueDate?.split("T")[0] || "",
        lines: editData.lines || []
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

  // CUSTOMER EMAIL
  useEffect(() => {
    const cust = customers.find(c => c.customerId == form.customerId);
    setSelectedCustomer(cust);
  }, [form.customerId, customers]);

  // DUE DATE
  useEffect(() => {
    if (form.invoiceDate) {
      const d = new Date(form.invoiceDate);
      d.setDate(d.getDate() + Number(form.terms));

      setForm(prev => ({
        ...prev,
        dueDate: d.toISOString().split("T")[0]
      }));
    }
  }, [form.invoiceDate, form.terms]);

  // TOTAL
  useEffect(() => {
    const sum = form.lines.reduce((a, l) => a + (l.lineTotal || 0), 0);
    setTotal(sum);
  }, [form.lines]);

  const addRow = () => {
    setForm(prev => ({
      ...prev,
      lines: [...prev.lines, { description: "", quantity: 1, unitPrice: 0, lineTotal: 0 }]
    }));
  };

  const updateLine = (i, field, value) => {
    const updated = [...form.lines];
    updated[i][field] = value;
    updated[i].lineTotal = updated[i].quantity * updated[i].unitPrice;
    setForm(prev => ({ ...prev, lines: updated }));
  };

  const removeRow = (i) => {
    setForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, index) => index !== i)
    }));
  };

  const handleSubmit = async () => {
    if (!form.customerId || !form.invoiceDate || !form.lines.length) {
      setError("All fields required");
      return;
    }

    try {
      const payload = {
        ...form,
        customerId: Number(form.customerId),
        totalAmount: total
      };

      if (editData) {
        await api.put(`/invoices/${editData.invoiceId}`, payload);
        onSuccess("Updated");
      } else {
        await api.post("/invoices", payload);
        onSuccess("Created");
      }

      onClose();
    } catch {
      setError("Error saving invoice");
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogTitle>{editData ? "Edit Invoice" : "Add Invoice"}</DialogTitle>

      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}

        {/* CUSTOMER */}
        <Select
          fullWidth
          value={form.customerId}
          onChange={(e) =>
            setForm({ ...form, customerId: e.target.value })
          }
          sx={{ mt: 2 }}
        >
          <MenuItem value="">Select Customer</MenuItem>
          {customers.map(c => (
            <MenuItem key={c.customerId} value={c.customerId}>
              {c.name}
            </MenuItem>
          ))}
        </Select>

        {selectedCustomer && (
          <Typography mt={1}>
            Email: {selectedCustomer.email || "-"}
          </Typography>
        )}

        {/* DATE */}
        <TextField
          fullWidth
          type="date"
          label="Invoice Date"
          InputLabelProps={{ shrink: true }}
          value={form.invoiceDate}
          onChange={(e) =>
            setForm({ ...form, invoiceDate: e.target.value })
          }
          sx={{ mt: 2 }}
        />

        <TextField
          fullWidth
          type="number"
          label="Terms"
          value={form.terms}
          onChange={(e) =>
            setForm({ ...form, terms: Number(e.target.value) })
          }
          sx={{ mt: 2 }}
        />

        <TextField
          fullWidth
          label="Due Date"
          value={form.dueDate}
          InputProps={{ readOnly: true }}
          sx={{ mt: 2 }}
        />

        {/* ITEMS */}
        <Box mt={2}>
          <Button onClick={addRow}>Add Item</Button>

          {form.lines.map((l, i) => (
            <Box key={i} display="flex" gap={1} mt={1}>
              <TextField
                placeholder="Desc"
                value={l.description}
                onChange={(e) =>
                  updateLine(i, "description", e.target.value)
                }
              />
              <TextField
                type="number"
                value={l.quantity}
                onChange={(e) =>
                  updateLine(i, "quantity", Number(e.target.value))
                }
              />
              <TextField
                type="number"
                value={l.unitPrice}
                onChange={(e) =>
                  updateLine(i, "unitPrice", Number(e.target.value))
                }
              />
              <Typography>{l.lineTotal}</Typography>
              <IconButton onClick={() => removeRow(i)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Typography mt={2}>Total: ₹ {total}</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}