import { useState } from "react";
import api from "../api/apiClient";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Snackbar
} from "@mui/material";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phoneNumber: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!form.firstName) return "First Name is required";
    if (!form.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter valid email";
    if (!form.phoneNumber) return "Phone number is required";
    if (!form.password) return "Password is required";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");

      await api.post("/auth/register", form);

      setSuccess("Registered successfully");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data); // duplicate email etc
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 12 }}>
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          <TextField
            label="First Name"
            fullWidth
            required
            value={form.firstName}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
          />

          <TextField
            label="Email"
            fullWidth
            required
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <TextField
            label="Phone"
            fullWidth
            required
            value={form.phoneNumber}
            onChange={(e) =>
              setForm({ ...form, phoneNumber: e.target.value })
            }
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <Button variant="contained" onClick={handleSubmit}>
            Register
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!success}
        autoHideDuration={2000}
        message={success}
        onClose={() => setSuccess("")}
      />
    </Container>
  );
}