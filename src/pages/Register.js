import { useState } from "react";
import api from "../api/apiClient";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Alert
} from "@mui/material";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phoneNumber: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      setError("");

      await api.post("/auth/register", form);

      alert("Registered successfully");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data || "Error");
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
            value={form.firstName}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
          />

          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <TextField
            label="Phone"
            fullWidth
            value={form.phoneNumber}
            onChange={(e) =>
              setForm({ ...form, phoneNumber: e.target.value })
            }
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
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
    </Container>
  );
}