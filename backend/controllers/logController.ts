import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../services/Prisma';
import 'dotenv/config';
import { PresenceService } from '../services/PresenceService';

const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export async function handleLogin(req: any, res: any) {
  const { username, password } = req.body;

  try {
    const user = await prisma.player.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).send({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.setCookie('chessin_sid', token, {
      ...cookieOptions,
      maxAge: 604800000,
    });

    return res.status(200).send({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        rapid: user.currentRapidRating,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
}

export async function handleLogout(req: any, res: any) {
  const token = req.cookies.chessin_sid;
  console.log(token);

  if (!token) {
    return res.status(200).send({ message: 'Already logged out' });
  }

  if (!token) {
    return res.status(200).send({ message: 'Already logged out' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const presenceService = PresenceService.getInstance();
    const userSessions = presenceService.getUser(userId);
    if (!userSessions) return;
    userSessions.forEach((socketId) => {
      req.server.io.sockets.sockets.get(socketId)?.disconnect(true);
    });

    presenceService.clearAll(userId);
  } catch (err) {}

  res.clearCookie('chessin_sid', cookieOptions);
  return res.send({ success: true });
}
