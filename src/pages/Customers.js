import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { DataGrid } from "@mui/x-data-grid";
import CustomerModal from "../components/CustomerModal";
import { Snackbar } from "@mui/material";
import Navbar from "../components/Navbar";
export default function Customers() {
  const [snack, setSnack] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchCustomers = async () => {
  console.log("Calling Customers API..."); // 👈 ADD THIS

  setLoading(true);
  try {
    const res = await api.get("/customers", {
     params: {
  search: search || null, 
  sortBy: "CreatedAt",
  sortDir: "desc",
  page: page + 1,
  pageSize
}
    });

    console.log("Customers API Response:", res.data); // 👈 ADD

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
  }, [page, pageSize, search]);

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
        <>
          <button
            onClick={() => {
              setEditData(params.row);
              setOpen(true);
            }}
          >
            Edit
          </button>

          <button
            onClick={async () => {
              if (window.confirm("Delete?")) {
                try {
                  await api.delete(`/customers/${params.row.customerId}`);
                  setSnack("Customer deleted successfully");
                  fetchCustomers();
                } catch {
                  setSnack("Delete failed");
                }
              }
            }}
          >
            Delete
          </button>
        </>
      )
    }
  ];

  return (
    <>
    <Navbar/>
    <div style={{ padding: 20 }}>
      <h2>Customers</h2>

      <button
        onClick={() => {
          setEditData(null);
          setOpen(true);
        }}
        style={{ marginBottom: 10 }}
      >
        Add Customer
      </button>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setPage(0);
          setSearch(e.target.value);
        }}
        style={{ marginBottom: 10, padding: 5, marginLeft: 10 }}
      />

      <div style={{ height: 500 }}>
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
      </div>

      <CustomerModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={(msg) => {
          setSnack(msg);
          fetchCustomers();
        }}
        editData={editData}
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