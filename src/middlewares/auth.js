require('dotenv').config()
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

module.exports = {
  verifyToken: (req, res, next) => {
    const token = extractToken(req)

    if(!token) {
      return res.status(400).json({ message: "No authentification token"})
    }

    try {
      const decoded = jwt.verify(token , JWT_SECRET)
      req._id = decoded._id
      req.username = decoded.username
      next()
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
    
  }
}

// helpers
function extractToken (req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
      return req.query.token;
  }
  return null;
}