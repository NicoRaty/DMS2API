import { Router } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import {logonUsers, findUser} from '../db/db.js'

let router = Router()
const secret = process.env.MY_SECRET_KEY;

if (!secret) {
  throw new Error('Secret key is not defined');
}

router.post('/', async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    let [user] = await findUser(username);

    if (!user && user.password === password) {
        return res.status(401).json({ error: 'Login failed' });
    }

    const token = jwt.sign({username: user.username}, secret, {
        expiresIn: '1h',
        algorithm: 'HS256'
    })

    logonUsers.set(username, {...user, token: token});

    res.json( {
        username,
        'access_token': token,
        'token_type': 'Bearer',
        'expires_in': '1h'
    });
})

export default router;