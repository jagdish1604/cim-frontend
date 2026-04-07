import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { DataGrid } from "@mui/x-data-grid";
import CustomerModal from "../components/CustomerModal";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../components/Navbar";

export default function Customers() {
  const [snack, setSnack] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ debounce

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [deleteId, setDeleteId] = useState(null); // ✅ dialog state

  // ✅ Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers", {
        params: {
          search: debouncedSearch || null, // ✅ use debounced
          sortBy: "CreatedAt",
          sortDir: "desc",
          page: page + 1,
          pageSize
        }
      });

      setRows(res.data.data);
      setRowCount(res.data.totalCount);
    } catch (err) {
      console.error(err);
      setSnack("Error loading customers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize, debouncedSearch]); // ✅ updated

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "phoneNumber", headerName: "Phone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              setEditData(params.row);
              setOpen(true);
            }}
          >
            Edit
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteId(params.row.customerId)} // ✅ dialog trigger
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
          Customers
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
                setEditData(null);
                setOpen(true);
              }}
            >
              Add Customer
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
            getRowId={(row) => row.customerId}
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

        <CustomerModal
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={(msg) => {
            setSnack(msg);
            fetchCustomers();
          }}
          editData={editData}
        />

        {/* ✅ MUI DELETE DIALOG */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete this customer?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              color="error"
              onClick={async () => {
                try {
                  await api.delete(`/customers/${deleteId}`);
                  setSnack("Customer deleted successfully");
                  fetchCustomers();
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