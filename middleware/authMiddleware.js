const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
  // Get the token from the Authorization header
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  
  // If the token has the "Bearer " prefix, strip it
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length); // Remove "Bearer " prefix
  }

 

  // Verify the token using the correct secret key
  jwt.verify(token,process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    
    req.userId = decoded.id; // Save the user ID for use in other routes
    
    next(); // Continue to the next middleware/route handler
  });
};

module.exports = { verifyToken };
