import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from 'services/Prisma';
import 'dotenv/config';

async function handleLogin(req: any, res: any) {
    const { username, password } = req.body;

    try {
        const user = await prisma.player.findUnique({
            where: { username: username }
        });

        if (!user) {
            return res.status(401).send({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).send({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.setCookie('chessin_sid', token, {
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 604800000 // 7 days
        });

        res.status(200).send({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                rapid: user.currentRapidRating
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send({ message: "Internal server error" });
    }
}

export default handleLogin