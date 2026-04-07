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
  Link
} from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter valid email";
    if (!password) return "Password is required";
    return "";
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");

      const res = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 12 }}>
        <Typography variant="h5">Login</Typography>

        <form onSubmit={handleLogin}>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              fullWidth
              required
              error={!!error && error.toLowerCase().includes("email")}
              helperText={
                error.toLowerCase().includes("email") ? error : ""
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              error={!!error && error.toLowerCase().includes("password")}
              helperText={
                error.toLowerCase().includes("password") ? error : ""
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" variant="contained">
              Login
            </Button>

            <Typography variant="body2" textAlign="center">
              Don’t have an account?{" "}
              <Link
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/register";
                }}
              >
                Register here
              </Link>
            </Typography>

          </Box>
        </form>
      </Paper>
    </Container>
  );
}