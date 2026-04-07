import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { DataGrid } from "@mui/x-data-grid";
import InvoiceModal from "../components/InvoiceModal";
import { Snackbar } from "@mui/material";
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
    console.log("FULL DATA:", res.data);

    setSelectedInvoice(res.data);
    setOpen(true);
  } catch (err) {
    console.error(err);
  }
};

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
    { field: "invoiceDate", headerName: "Date", flex: 1 },
    { field: "dueDate", headerName: "Due Date", flex: 1 },
    { field: "totalAmount", headerName: "Total", flex: 1 },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
        
          <button
            onClick={() => handleEdit(params.row)}
            style={{ marginRight: 10 }}
          >
            Edit
          </button>

        
          <button onClick={() => handleDelete(params.row.invoiceId)}>
            Delete
          </button>
        </>
      )
    }
  ];

  return (
    <>
      <Navbar />

      <div style={{ padding: 20 }}>
        <h2>Invoices</h2>

        <button
          onClick={() => {
            setSelectedInvoice(null); // reset edit
            setOpen(true);
          }}
        >
          Add Invoice
        </button>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          style={{ marginLeft: 10 }}
        />

        <div style={{ height: 500, marginTop: 10 }}>
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
        </div>

        <InvoiceModal
          open={open}
          editData={selectedInvoice} // 🔥 KEY
          onClose={() => setOpen(false)}
          onSuccess={(msg) => {
            setSnack(msg);
            fetchInvoices();
          }}
        />

        <Snackbar
          open={!!snack}
          autoHideDuration={3000}
          message={snack}
          onClose={() => setSnack("")}
        />
      </div>
    </>
  );
}