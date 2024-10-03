// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware')


const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET
  );
};


router.get('/checkUser', verifyToken, (req, res) => {
  res.status(200).json({ message: 'User is valid', userId: req.userId });
});


// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET);

    return res.status(201).json({ message: 'Signup successful', token });

  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: 'Error registering user' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Changed from username to email

  try {
    // Check if user exists
    const user = await User.findOne({ email }); // Changed to search by email
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);

    // Respond with token
    return res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: 'Server error' });
  }
});




router.get('/getProfile', verifyToken, async (req, res) => {
  try {

    // console.log("getProfile");
    // Find the user by the ID from the token (decoded by verifyToken)
    const user = await User.findById(req.userId).select('-password'); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user profile data as response
    return res.status(200).json({
      username: user.username,
      email: user.email,
      bio: user.bio,
      notesCount: user.notesCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching profile data' });
  }
});

// Update profile route
router.put('/updateProfile', verifyToken, async (req, res) => {
  const { username, bio } = req.body;  // Extract updated data from the request

  try {
    // Find the user by the ID from the token (decoded by verifyToken)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's profile details
    user.username = username;
    user.bio = bio;

    await user.save(); // Save changes to the database
    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating profile' });
  }
});



module.exports = router;
