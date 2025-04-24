import nodemailer, { SendMailOptions } from 'nodemailer';
import config from '../config';
import logger from './logger.service';

interface TicketEmailData {
  eventDate: Date;
  venueName: string;
  seats: string[];
}

type EmailOptions = SendMailOptions;

interface PaymentInstructionsEmail {
  to: string;
  name: string;
  eventName: string;
  amount: number;
  bookingId: string;
  qrCode: string;
}

interface PaymentConfirmationEmail {
  to: string;
  name: string;
  eventName: string;
  amount: number;
  bookingId: string;
  utr: string;
}

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    // Use ethereal email for development
    if (process.env.NODE_ENV === 'development') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'test@ethereal.email',
          pass: 'testpass',
        },
      });
      logger.info('Using ethereal email for development');
      return;
    }

    // Use real SMTP settings for production
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration only in production
    if (process.env.NODE_ENV === 'production') {
      this.verifyConnection();
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection established successfully');
    } catch (error) {
      logger.error('Failed to establish email service connection:', error);
      throw new Error('Email service configuration error');
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        logger.info('Development mode - Email would be sent:', options);
        return;
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@eventia.com',
        ...options,
      });
      logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  private getTicketEmailTemplate(eventName: string, data: TicketEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
            .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Ticket for ${eventName}</h1>
            </div>
            <div class="content">
              <p>Thank you for your purchase! Your ticket is attached to this email.</p>
              
              <h2>Event Details:</h2>
              <ul>
                <li>Event: ${eventName}</li>
                <li>Date: ${new Date(data.eventDate).toLocaleDateString()}</li>
                <li>Time: ${new Date(data.eventDate).toLocaleTimeString()}</li>
                <li>Venue: ${data.venueName}</li>
                <li>Seats: ${data.seats.join(', ')}</li>
              </ul>
              
              <p><strong>Important Information:</strong></p>
              <ul>
                <li>Please arrive at least 30 minutes before the event starts</li>
                <li>Present this ticket at the venue entrance</li>
                <li>This ticket is non-transferable</li>
                <li>Keep this email for your records</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>For support, contact us at ${config.email.user}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendTicketEmail(
    to: string,
    subject: string,
    html: string,
    attachments: SendMailOptions['attachments']
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
      attachments,
    };

    await this.sendEmail(mailOptions);
  }

  async sendTicketWithPdf(
    to: string,
    eventName: string,
    pdfBuffer: Buffer,
    ticketData: TicketEmailData
  ): Promise<void> {
    const subject = `Your Ticket for ${eventName}`;
    const html = this.getTicketEmailTemplate(eventName, ticketData);

    const attachments: SendMailOptions['attachments'] = [
      {
        filename: `ticket-${eventName.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];

    await this.sendTicketEmail(to, subject, html, attachments);
  }

  public async sendPaymentInstructions(data: PaymentInstructionsEmail): Promise<void> {
    const { to, name, eventName, amount, bookingId, qrCode } = data;

    const html = `
      <h2>Payment Instructions for ${eventName}</h2>
      <p>Dear ${name},</p>
      <p>Thank you for booking tickets for ${eventName}. Please complete your payment to confirm your booking.</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <p>Please scan the QR code below to make the payment:</p>
      <img src="${qrCode}" alt="Payment QR Code" style="max-width: 200px;" />
      <p>If you have any issues, please contact our support team.</p>
      <p>Best regards,<br>Eventia Team</p>
    `;

    await this.sendEmail({
      to,
      subject: `Payment Instructions - ${eventName}`,
      html,
    });
  }

  public async sendPaymentConfirmation(data: PaymentConfirmationEmail): Promise<void> {
    const { to, name, eventName, amount, bookingId, utr } = data;

    const html = `
      <h2>Payment Confirmation for ${eventName}</h2>
      <p>Dear ${name},</p>
      <p>Your payment for ${eventName} has been successfully processed.</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Amount Paid:</strong> ₹${amount}</p>
      <p><strong>UTR Number:</strong> ${utr}</p>
      <p>Your tickets will be sent to you shortly.</p>
      <p>Thank you for choosing Eventia!</p>
      <p>Best regards,<br>Eventia Team</p>
    `;

    await this.sendEmail({
      to,
      subject: `Payment Confirmation - ${eventName}`,
      html,
    });
  }
}

export default EmailService; 