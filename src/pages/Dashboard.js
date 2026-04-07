import { useEffect, useState } from "react";
import api from "../api/apiClient";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
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

  const cards = [
    {
      title: "Total Customers",
      value: data.totalCustomers,
      icon: <PeopleIcon fontSize="large" />
    },
    {
      title: "Total Invoices",
      value: data.totalInvoices,
      icon: <ReceiptIcon fontSize="large" />
    },
    {
      title: "Total Amount",
      value: `₹ ${data.totalAmount}`,
      icon: <CurrencyRupeeIcon fontSize="large" />
    }
  ];

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "scale(1.03)"
                  }
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {card.title}
                  </Typography>

                  <Typography variant="h5" fontWeight="bold">
                    {card.value}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    background: "#f5f5f5",
                    borderRadius: "50%",
                    p: 2
                  }}
                >
                  {card.icon}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}