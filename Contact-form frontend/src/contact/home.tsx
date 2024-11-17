import * as React from "react";
import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Pagination,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company: string;
  jobTitle: string;
}

const API_BASE_URL = "YOUR_API_BASE_URL"; // Replace with your API base URL

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    company: "",
    jobTitle: "",
  });
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/contacts`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContacts(data);
      } catch (error: any) {
        setError(`Failed to fetch contacts: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewContact({ ...newContact, [event.target.name]: event.target.value });
  };

  const addContact = async () => {
    if (
      !newContact.firstName ||
      !newContact.lastName ||
      !newContact.email ||
      !newContact.phoneNumber ||
      !newContact.company ||
      !newContact.jobTitle
    ) {
      setError("All fields are required.");
      return;
    }
    // Add more robust validation here if needed

    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || `HTTP error! status: ${response.status}`);
        return;
      }
      const addedContact = await response.json();
      setContacts([...contacts, addedContact]);
      setNewContact({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        company: "",
        jobTitle: "",
      });
    } catch (error: any) {
      setError(`Failed to add contact: ${error.message}`);
    }
  };

  const deleteContact = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setContacts(contacts.filter((c) => c.id !== id));
    } catch (error: any) {
      setError(`Failed to delete contact: ${error.message}`);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact(contact);
  };

  const handleSaveEdit = async (id: number) => {
    const updatedContactIndex = contacts.findIndex((c) => c.id === id);
    if (updatedContactIndex === -1) return;

    const updatedContact = { ...contacts[updatedContactIndex], ...newContact };

    if (
      !updatedContact.firstName ||
      !updatedContact.lastName ||
      !updatedContact.email ||
      !updatedContact.phoneNumber ||
      !updatedContact.company ||
      !updatedContact.jobTitle
    ) {
      setError("All fields are required.");
      return;
    }
    // Add more robust validation here if needed

    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedContact),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || `HTTP error! status: ${response.status}`);
        return;
      }
      const updatedContacts = [...contacts];
      updatedContacts[updatedContactIndex] = updatedContact;
      setContacts(updatedContacts);
      setEditingContact(null);
      setNewContact({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        company: "",
        jobTitle: "",
      });
    } catch (error: any) {
      setError(`Failed to update contact: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
    setNewContact({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      company: "",
      jobTitle: "",
    });
  };

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, contacts.length - page * rowsPerPage + 1);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedContacts = contacts.slice(startIndex, endIndex);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Contact Book
      </Typography>
      {error && (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      {loading && <CircularProgress />}

      {/* Add Contact Form */}
      <Box component="form" noValidate autoComplete="off" sx={{ mb: 2 }}>
        <TextField
          label="First Name"
          name="firstName"
          value={newContact.firstName || ""}
          onChange={handleInputChange}
          margin="normal"
          required
          fullWidth
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={newContact.lastName || ""}
          onChange={handleInputChange}
          margin="normal"
          required
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          value={newContact.email || ""}
          onChange={handleInputChange}
          margin="normal"
          required
          fullWidth
        />
        <TextField
          label="Phone Number"
          name="phoneNumber"
          value={newContact.phoneNumber || ""}
          onChange={handleInputChange}
          margin="normal"
          required
          fullWidth
        />
        <TextField
          label="Company"
          name="company"
          value={newContact.company || ""}
          onChange={handleInputChange}
          margin="normal"
          required
          fullWidth
        />
        <TextField
          label="Job Title"
          name="jobTitle"
          value={newContact.jobTitle || ""}
          onChange={handleInputChange}
          margin="normal"
          required
          fullWidth
        />
        <Button variant="contained" onClick={addContact} fullWidth>
          Add Contact
        </Button>
      </Box>

      {/* Contact List */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell align="right">Email</TableCell>
              <TableCell align="right">Phone</TableCell>
              <TableCell align="right">Company</TableCell>
              <TableCell align="right">Job Title</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedContacts.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  {editingContact?.id === row.id ? (
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={newContact.firstName || ""}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      fullWidth
                      size="small"
                    />
                  ) : (
                    row.firstName
                  )}
                </TableCell>
                <TableCell>
                  {editingContact?.id === row.id ? (
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={newContact.lastName || ""}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      fullWidth
                      size="small"
                    />
                  ) : (
                    row.lastName
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingContact?.id === row.id ? (
                    <TextField
                      label="Email"
                      name="email"
                      value={newContact.email || ""}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      fullWidth
                      size="small"
                    />
                  ) : (
                    row.email
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingContact?.id === row.id ? (
                    <TextField
                      label="Phone Number"
                      name="phoneNumber"
                      value={newContact.phoneNumber || ""}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      fullWidth
                      size="small"
                    />
                  ) : (
                    row.phoneNumber
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingContact?.id === row.id ? (
                    <TextField
                      label="Company"
                      name="company"
                      value={newContact.company || ""}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      fullWidth
                      size="small"
                    />
                  ) : (
                    row.company
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingContact?.id === row.id ? (
                    <TextField
                      label="Job Title"
                      name="jobTitle"
                      value={newContact.jobTitle || ""}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      fullWidth
                      size="small"
                    />
                  ) : (
                    row.jobTitle
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingContact?.id === row.id ? (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSaveEdit(row.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => deleteContact(row.id)}
                        startIcon={<DeleteIcon />}
                      >
                        Delete
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEdit(row)}
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={7} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <select
          value={rowsPerPage}
          onChange={handleChangeRowsPerPage}
          style={{ padding: "5px", borderRadius: "5px" }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>
        <Pagination
          count={Math.ceil(contacts.length / rowsPerPage)}
          page={page}
          onChange={handleChangePage}
        />
      </Box>
    </div>
  );
};

export default App;
