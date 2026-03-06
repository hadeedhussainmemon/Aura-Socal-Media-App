import nodemailer from 'nodemailer';

interface SendEmailOptions {
    email: string;
    subject: string;
    message: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
        auth: {
            user: process.env.EMAIL_USERNAME, // Your email address
            pass: process.env.EMAIL_PASSWORD, // Your app password (not your main password)
        },
    });

    // Define email options
    const mailOptions = {
        from: `"Aura Support" <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};
