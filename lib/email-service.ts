// Email service for sending viral referral emails
// Using EmailJS for client-side email sending (you can replace with server-side solution)
import emailjs from "@emailjs/browser";

interface EmailData {
  to_email: string;
  to_name: string;
  from_name: string;
  idea_title: string;
  idea_description: string;
  referral_link: string;
  referrer_message?: string;
}

export class EmailService {
  private static SERVICE_ID = process.env
    .NEXT_PUBLIC_EMAILJS_SERVICE_ID as string;
  private static TEMPLATE_ID = process.env
    .NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string;
  private static PUBLIC_KEY = process.env
    .NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string;

  static async sendReferralEmail(emailData: EmailData): Promise<boolean> {
    try {
      // For demo purposes, we'll simulate email sending
      // In production, replace this with actual EmailJS or server-side email service

      console.log("📧 Sending viral referral email:", {
        to: emailData.to_email,
        subject: `${emailData.from_name} shared an amazing idea with you!`,
        idea: emailData.idea_title,
        link: emailData.referral_link,
      });

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo, we'll always return success
      // In production, implement actual email sending:

      const result = await emailjs.send(
        EmailService.SERVICE_ID,
        EmailService.TEMPLATE_ID,
        {
          from_name: emailData.from_name,
          to_email: emailData.to_email,
          idea_title: emailData.idea_title,
          idea_description: emailData.idea_description,
          referral_link: emailData.referral_link,
          referrer_message: emailData.referrer_message || "", // Optional field fallback
        },
        EmailService.PUBLIC_KEY
      );

      return result.status === 200;

      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  static generateEmailTemplate(emailData: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Idea Shared With You!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .idea-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💡 You've Received a Brilliant Idea!</h1>
            <p>${emailData.from_name} thought you'd love this idea</p>
          </div>
          <div class="content">
            <div class="idea-box">
              <h2>${emailData.idea_title}</h2>
              <p>${emailData.idea_description}</p>
            </div>
            
            <p>🌟 <strong>Here's how it works:</strong></p>
            <ol>
              <li>Click the link below to view the full idea</li>
              <li>If you love it, share it with 3 people you know</li>
              <li>Watch as your referrals create a chain of positive impact!</li>
            </ol>

            <div style="text-align: center;">
              <a href="${emailData.referral_link}" class="cta-button">
                🚀 View Idea & Join the Chain
              </a>
            </div>

            <p><em>"Every great change starts with a single idea. Be part of the chain that changes the world!"</em></p>
            
            ${
              emailData.referrer_message
                ? `
              <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>Personal message from ${emailData.from_name}:</strong><br>
                "${emailData.referrer_message}"
              </div>
            `
                : ""
            }
          </div>
          <div class="footer">
            <p>This email was sent through SparkLoop - One idea. Infinite reach.</p>
            <p>Join the movement of spreading brilliant ideas worldwide!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
