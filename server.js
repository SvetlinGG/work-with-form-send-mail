import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// cfreate SMTP transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// simple health check
app.get('/health', (_, res) => res.send('OK'));

// register endpoint
app.post(
    '/api/register',
    [
        body('username').trim().isLength({ min: 2, max: 50}),
        body('email').isEmail().normalizeEmail(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, email } = req.body;

        try {
            await transporter.sendMail({
                from: `"New Registration" <${process.env.SMTP_USER}>`,
                to: process.env.MAIL_TO,
                subject: "New User Registration",
                text: `Username: ${username}\nEmail: ${email}`,
                html: `<p><strong>Username:</strong> ${username}</p>
                       <p><strong>Email:</strong> ${email}</p>`,
            });
            // (optional) auto-reply to the user
            await transporter.sendMail({
                from: `"Support" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Thanks for registering!",
                text: `Hi ${username}, thanks for registering.`,
            });
            res.json({ ok: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: 'Email send failed'});
        }
    }
);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is listening on port: ${port}`));