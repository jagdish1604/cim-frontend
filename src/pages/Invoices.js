import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { DataGrid } from "@mui/x-data-grid";
import InvoiceModal from "../components/InvoiceModal";
import {
  Snackbar,
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogActions
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../components/Navbar";

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [snack, setSnack] = useState("");

  const [deleteId, setDeleteId] = useState(null); // ✅ NEW

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices", {
        params: {
          search: search || null,
          sortBy: "CreatedAt",
          sortDir: "desc",
          page: page + 1,
          pageSize
        }
      });

      setRows(res.data.data || []);
      setRowCount(res.data.totalCount || 0);
    } catch (err) {
      console.error(err);
      setSnack("Error loading invoices");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, pageSize, search]);

  const handleEdit = async (invoice) => {
    try {
      const res = await api.get(`/invoices/${invoice.invoiceId}`);
      setSelectedInvoice(res.data);
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ OLD confirm method kept but not used (safe)
  const handleDelete = async (id) => {
    if (!window.confirm("Delete invoice?")) return;

    try {
      await api.delete(`/invoices/${id}`);
      setSnack("Invoice deleted successfully");
      fetchInvoices();
    } catch {
      setSnack("Delete failed");
    }
  };

  const columns = [
    { field: "invoiceNumber", headerName: "Invoice No", flex: 1 },
    { field: "customerName", headerName: "Customer", flex: 1 },

    {
      field: "invoiceDate",
      headerName: "Date",
      flex: 1,
      renderCell: (params) =>
        params.row.invoiceDate
          ? new Date(params.row.invoiceDate).toLocaleDateString()
          : ""
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params) =>
        params.row.dueDate &&
        params.row.dueDate !== "0001-01-01T00:00:00"
          ? new Date(params.row.dueDate).toLocaleDateString()
          : "-"
    },

    {
      field: "totalAmount",
      headerName: "Total",
      flex: 1,
      renderCell: (params) => `₹ ${params.row.totalAmount ?? 0}`
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => setDeleteId(params.row.invoiceId)} // ✅ NEW
          >
            Delete
          </Button>
        </Box>
      )
    }
  ];

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Invoices
        </Typography>

        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedInvoice(null);
                setOpen(true);
              }}
            >
              Add Invoice
            </Button>

            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
            />
          </Box>
        </Paper>

        <Paper sx={{ height: 500, borderRadius: 3 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.invoiceId}
            loading={loading}
            pagination
            paginationMode="server"
            rowCount={rowCount}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </Paper>

        <InvoiceModal
          open={open}
          editData={selectedInvoice}
          onClose={() => setOpen(false)}
          onSuccess={(msg) => {
            setSnack(msg);
            fetchInvoices();
          }}
        />

       
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete this invoice?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              color="error"
              onClick={async () => {
                try {
                  await api.delete(`/invoices/${deleteId}`);
                  setSnack("Invoice deleted successfully");
                  fetchInvoices();
                } catch {
                  setSnack("Delete failed");
                }
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!snack}
          autoHideDuration={3000}
          message={snack}
          onClose={() => setSnack("")}
        />
      </Container>
    </>
  );
}