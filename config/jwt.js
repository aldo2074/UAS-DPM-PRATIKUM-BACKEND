const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET 
const JWT_EXPIRES_IN = '24h'; 

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  generateToken: (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },
  verifyToken: (token) => {
    return jwt.verify(token, JWT_SECRET);
  }
};
