import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          CIM System
        </Typography>

        <Button color="inherit" onClick={() => navigate("/dashboard")}>
          Dashboard
        </Button>

        <Button color="inherit" onClick={() => navigate("/customers")}>
          Customers
        </Button>

        <Button color="inherit" onClick={() => navigate("/invoices")}>
          Invoices
        </Button>

        <Button color="inherit" onClick={logout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}