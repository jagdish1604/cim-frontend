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

  const handleLogin = async (e) => {
    if (e) e.preventDefault(); 

    console.log("CLICK WORKING");

    if (!email || !password) {
      debugger
      setError("Email and Password are required");
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
      debugger
      console.log("ERROR:", err);

      setError("Invalid email or password");
       return;
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
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