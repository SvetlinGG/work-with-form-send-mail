import express from 'express';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'igscosmetics@gmail.com',
    subject: 'Welcome',
    html: '<strong>Thanks for signing up!!!</strong>'
});


const port = 3000;
app.listen(port, () => console.log(`Server is listening on port: ${port}`));