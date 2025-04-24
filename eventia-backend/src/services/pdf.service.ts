import PDFDocument from 'pdfkit';
import { Booking } from '../models/booking.model';
import { Event } from '../models/event.model';
import { User } from '../models/user.model';
import { Stadium } from '../models/stadium.model';
import QRCode from 'qrcode';
import EmailService from './email.service';
import logger from './logger.service';

interface TicketData {
  bookingId: number;
  eventId: number;
  userId: string;
  seats: string[];
  eventTitle: string;
  eventDate: Date;
  venueName: string;
  userName: string;
  userEmail: string;
}

class PDFService {
  async generateTicket(bookingId: string): Promise<Buffer> {
    const booking = await Booking.findOne({
      where: { id: parseInt(bookingId, 10) },
      include: [
        {
          model: Event,
          include: [Stadium]
        },
        {
          model: User
        }
      ]
    });

    if (!booking || !booking.event || !booking.user || !booking.event.stadium) {
      throw new Error('Booking not found or missing required relations');
    }

    const ticketData: TicketData = {
      bookingId: booking.id,
      eventId: booking.eventId,
      userId: booking.userId.toString(),
      seats: booking.seats,
      eventTitle: booking.event.title,
      eventDate: booking.event.date,
      venueName: booking.event.stadium.name,
      userName: booking.user.name,
      userEmail: booking.user.email,
    };

    return this.generatePDF(ticketData);
  }

  private async generatePDF(data: TicketData): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Ticket - ${data.eventTitle}`,
        Author: 'Eventia Ticketing',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({
      bookingId: data.bookingId,
      eventId: data.eventId,
      userId: data.userId,
    }));

    // Add header with logo (if available)
    doc.fontSize(24).text('Event Ticket', { align: 'center' });
    doc.moveDown();

    // Add event details
    doc.fontSize(16).text('Event Details');
    doc.fontSize(12)
      .text(`Event: ${data.eventTitle}`)
      .text(`Date: ${new Date(data.eventDate).toLocaleDateString()}`)
      .text(`Time: ${new Date(data.eventDate).toLocaleTimeString()}`)
      .text(`Venue: ${data.venueName}`)
      .moveDown();

    // Add booking details
    doc.fontSize(16).text('Booking Details');
    doc.fontSize(12)
      .text(`Booking ID: ${data.bookingId}`)
      .text(`Seats: ${data.seats.join(', ')}`)
      .text(`Quantity: ${data.seats.length}`)
      .moveDown();

    // Add user details
    doc.fontSize(16).text('Attendee Details');
    doc.fontSize(12)
      .text(`Name: ${data.userName}`)
      .text(`Email: ${data.userEmail}`)
      .moveDown();

    // Add QR code
    doc.image(qrCodeData, {
      fit: [150, 150],
      align: 'center',
    });

    // Add footer
    doc.fontSize(10)
      .text('Please present this ticket at the venue entrance.', { align: 'center' })
      .text('This ticket is non-transferable.', { align: 'center' })
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  async generateAndSendTicket(bookingId: string): Promise<void> {
    try {
      const booking = await Booking.findOne({
        where: { id: parseInt(bookingId, 10) },
        include: [
          {
            model: Event,
            include: [Stadium]
          },
          {
            model: User
          }
        ]
      });

      if (!booking || !booking.event || !booking.user || !booking.event.stadium) {
        throw new Error('Booking not found or missing required relations');
      }

      // Generate PDF
      const pdfBuffer = await this.generateTicket(bookingId);
      
      // Send email with PDF attachment
      const emailService = EmailService.getInstance();
      await emailService.sendTicketWithPdf(
        booking.user.email,
        booking.event.title,
        pdfBuffer,
        {
          eventDate: booking.event.date,
          venueName: booking.event.stadium.name,
          seats: booking.seats,
        }
      );
      
      logger.info(`Ticket sent to ${booking.user.email} for booking ${bookingId}`);
    } catch (error) {
      logger.error(`Error generating and sending ticket for booking ${bookingId}:`, error);
      throw error;
    }
  }
}

export default new PDFService(); 