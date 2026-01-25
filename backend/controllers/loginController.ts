import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from 'services/Prisma';
import 'dotenv/config';
import { PresenceService } from 'services/PresenceService';

const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};


async function handleLogin(req: any, res: any) {
    const { username, password } = req.body;

    try {
        const user = await prisma.player.findUnique({
            where: { username }
        });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).send({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.setCookie('chessin_sid', token, { 
            ...cookieOptions, 
            maxAge: 604800000 
        });

        return res.status(200).send({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                rapid: user.currentRapidRating
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

async function handleLogOut(req: any, res: any){
    const presenceService = PresenceService.getInstance()
    const userId = req.user.id
    const userSessions = presenceService.getUser(userId);
    if(!userSessions) return
        userSessions.forEach(socketId => {
            req.server.io.sockets.sockets.get(socketId)?.disconnect(true);
        });

    presenceService.clearAll(userId); 

    res.clearCookie('chessin_sid', cookieOptions);

    res.send({ success: true });

    }

export default handleLogin