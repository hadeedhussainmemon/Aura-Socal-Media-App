import { Resend } from 'resend';
// Lazy initialization of Resend to prevent build-time errors if API key is missing
let resend: Resend | null = null;

const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn("RESEND_API_KEY is missing. Email features will be disabled.");
        return null;
    }
    if (!resend) {
        resend = new Resend(apiKey);
    }
    return resend;
};

interface SendEmailOptions {
    email: string;
    subject: string;
    message: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
    const client = getResend();
    if (!client) {
        console.error("Cannot send email: Resend client not initialized (missing API key)");
        return null;
    }

    try {
        const data = await client.emails.send({
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
