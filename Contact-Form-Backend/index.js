const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { check, validationResult } = require("validator");

const app = express();
app.use(bodyParser.json());


const dbURI = "mongodb://localhost:27017/contact_app"; 

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
});

const Contact = mongoose.model("Contact", contactSchema);


// POST /contacts
app.post("/contacts", async (req, res) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const newContact = new Contact(req.body);
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Failed to create contact" });
    }
  }
});

// GET /contacts
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve contacts" });
  }
});


app.put("/contacts/:id", async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact" });
  }
});


app.delete("/contacts/:id", async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndRemove(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
