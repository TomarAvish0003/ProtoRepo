// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export default async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    req.user = user; // Full user object available in controllers
    next();
  } catch (err) { 
    res.status(401).json({ error: 'Token is not valid' });
  }
}
