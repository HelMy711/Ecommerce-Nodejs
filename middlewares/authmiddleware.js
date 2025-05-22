import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import authConfig from '../config/auth.js';

const authMiddleware = async (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, authConfig.secret);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export { authMiddleware };