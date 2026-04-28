import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../services/Prisma';
import 'dotenv/config';

async function handleSignUp(req: any, res: any) {
  const { email, name, username, password } = req.body;

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.player.create({
      data: {
        username,
        name,
        email,
        currentRapidRating: 1000,
        currentBlitzrating: 1000,
        currentBulletRating: 1000,
        password_hash: hash,
      },
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.cookie('chessin_sid', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in prod, false in dev
      sameSite: 'Strict',
      maxAge: 604800000, // 7 days
    });

    return res.status(201).send({
      message: 'User created successfully',
      user: { id: user.id, username: user.username },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res
        .status(400)
        .send({ message: 'Username or Email already exists' });
    }

    console.error('Signup Error:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
}

export default handleSignUp;
