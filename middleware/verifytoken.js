import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { logonUsers } from '../db/db.js'

const secret = process.env.MY_SECRET_KEY;

// middleware/verifyToken
export const verifyToken = (req, res, next) => {
  if(req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  const authHeader = req.header('Authorization');
  
  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, secret, {
      algorithms: ['HS256']
    });
  
    const user = logonUsers.get(decodedToken.username)

    if (!user || user.token !== token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next()
  } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
  }    
};