const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  notesCount: { type: Number, default: 0 },
  savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }], // Saved notes
  createdNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }] // Notes created by the user
});

const User = mongoose.model('User', userSchema);
module.exports = User;
