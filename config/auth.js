export default {
  secret: process.env.JWT_SECRET || 'helmyy',
  expiresIn: '3d'
};