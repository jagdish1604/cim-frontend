import { useState, useEffect } from "react";
import api from "../api/apiClient";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box
} from "@mui/material";

export default function CustomerModal({ open, onClose, onSuccess, editData }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: ""
  });

  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({}); // ✅ inline error

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm({
        name: "",
        address: "",
        phoneNumber: "",
        email: ""
      });
    }
  }, [editData, open]);

  const validate = () => {
    const errors = {};

    if (!form.name) errors.name = "Name is required";
    if (!form.address) errors.address = "Address is required";
    if (!form.phoneNumber) errors.phoneNumber = "Phone is required";
    if (!form.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Invalid email";

    setFieldError(errors);

    return Object.keys(errors).length === 0;
  };

  const isValid =
    form.name && form.address && form.phoneNumber && form.email;

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setError("");

      if (editData) {
        await api.put(`/customers/${editData.customerId}`, form);
      } else {
        await api.post("/customers", form);
      }

      onSuccess("Saved successfully");
      onClose();
    } catch (err) {
      
      if (
        err.response?.data?.toLowerCase().includes("email")
      ) {
        setFieldError((prev) => ({
          ...prev,
          email: err.response.data
        }));
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editData ? "Edit Customer" : "Add Customer"}
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Customer Name"
            fullWidth
            required
            value={form.name}
            error={!!fieldError.name}
            helperText={fieldError.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <TextField
            label="Address"
            fullWidth
            required
            value={form.address}
            error={!!fieldError.address}
            helperText={fieldError.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <TextField
            label="Phone Number"
            fullWidth
            required
            value={form.phoneNumber}
            error={!!fieldError.phoneNumber}
            helperText={fieldError.phoneNumber}
            onChange={(e) =>
              setForm({ ...form, phoneNumber: e.target.value })
            }
          />

          <TextField
            label="Email Address"
            fullWidth
            required
            value={form.email}
            error={!!fieldError.email}
            helperText={fieldError.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid} 
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}