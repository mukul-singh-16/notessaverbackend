// routes/noteRoutes.js
const express = require('express');
const Note = require('../models/Note');
const User = require('../models/User')
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware')






// get all notes
router.get('/', async (req, res) => {
  try {
    // Fetch all public notes (Assume that you have a field "public" in the note model)
    const notes = await Note.find(); // Add any other conditions as needed
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});




// Add a new note
router.post('/', verifyToken, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.userId; // Assuming user ID is available from JWT

  // console.log(req.body);

  try {
    // Create and save the note
    const newNote = new Note({
      title,
      content,
      user: userId, // Associate the note with the logged-in user
    });
    const savedNote = await newNote.save();
    // console.log("notes save ho gya")
    // Update the user's createdNotes and increment the notesCount
    await User.findByIdAndUpdate(userId, {
      $push: { createdNotes: savedNote._id },
      $inc: { notesCount: 1 },
    });
    // console.log("user schema me save ho gya");

    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error });
  }
});



// Update a note
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.userId; // Assuming user ID is available from JWT

  // console.log(id)

  

  

  try {
    
    // Find the note and ensure the user owns it
    const note = await Note.findById(id);

    // console.log("11")
    // console.log(userId);
    // console.log("22")
    // console.log(note.user.toString())
    if (!note || note.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    

    // Update the note
    note.title = title;
    note.content = content;
    const updatedNote = await note.save();
    
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note', error });
  }
});




// Delete a note
router.delete('/:id', verifyToken,async (req, res) => {

  console.log(req.user);
  const { id } = req.params;
  const userId = req.userId; // Assuming user ID is available from JWT

  try {
    // Find the note and ensure the user owns it
    const note = await Note.findById(id);
    if (!note || note.user.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // Delete the note
    await Note.findByIdAndDelete(id);

    // Update the user's createdNotes and decrement the notesCount
    await User.findByIdAndUpdate(userId, {
      $pull: { createdNotes: id },
      $inc: { notesCount: -1 },
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error });
  }
});



// Get all notes created by the user
router.get('/user',verifyToken, async (req, res) => {
  const userId  = req.userId;

  try {
    const notes = await Note.find({ user: userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error });
  }
});



module.exports = router;
