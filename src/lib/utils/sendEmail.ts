import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
    email: string;
    subject: string;
    message: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
    try {
        const data = await resend.emails.send({
            // By default, Resend requires a verified domain to send FROM.
            // When testing, you can send *from* an arbitrary name via the default testing domain
            // like 'onboarding@resend.dev', but it will only deliver TO the email address 
            // registered with your Resend account.
            from: 'Aura Support <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            html: options.message,
        });

        console.log("Resend API response:", data);
        return data;
    } catch (error) {
        console.error("Failed to send email via Resend API:", error);
        throw error;
    }
};
