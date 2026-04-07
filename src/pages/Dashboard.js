import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { Container, Typography, Paper, Box } from "@mui/material";
import Navbar from "../components/Navbar";
export default function Dashboard() {
  const [data, setData] = useState({
    totalCustomers: 0,
    totalInvoices: 0,
    totalAmount: 0
  });

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch {
      console.log("Error loading dashboard");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <>
    <Navbar/>
    <Container>
    
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box display="flex" gap={3}>
        <Paper style={{ padding: 20 }}>
          <Typography>Total Customers</Typography>
          <Typography variant="h5">{data.totalCustomers}</Typography>
        </Paper>

        <Paper style={{ padding: 20 }}>
          <Typography>Total Invoices</Typography>
          <Typography variant="h5">{data.totalInvoices}</Typography>
        </Paper>

        <Paper style={{ padding: 20 }}>
          <Typography>Total Amount</Typography>
          <Typography variant="h5">{data.totalAmount}</Typography>
        </Paper>
      </Box>
    </Container>
    </>
  );
}