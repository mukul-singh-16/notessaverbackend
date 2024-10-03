const Note = require('../models/Note');
const User = require('../models/User');

// Create a new note
const createNote = async (req, res) => {
  const { title, content } = req.body;
  const note = new Note({ title, content, user: req.user.id });
  
  await note.save();
  
  // Increment user's notes count
  await User.findByIdAndUpdate(req.user.id, { 
    $inc: { notesCount: 1 },
    $push: { createdNotes: note._id } // Add the created note ID to the user
  });
  
  res.status(201).json(note);
};

// Get all notes
const getAllNotes = async (req, res) => {
  const notes = await Note.find().populate('user', 'name email');
  res.json(notes);
};


const getUserCreatedNotes = async (req, res) => {
    const user = await User.findById(req.user.id).populate('createdNotes');
    res.json(user.createdNotes);
  };
  

module.exports = { createNote, getAllNotes ,getUserCreatedNotes};
