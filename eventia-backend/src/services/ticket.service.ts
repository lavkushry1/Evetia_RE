import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { PrismaClient } from '../../generated/prisma';
import { createWriteStream } from 'fs';
import { join } from 'path';
import logger from './logger.service';

const prisma = new PrismaClient();

export class TicketService {
  private static instance: TicketService;
  private readonly uploadsDir: string;

  private constructor() {
    this.uploadsDir = join(process.cwd(), 'uploads', 'tickets');
  }

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  public async generateTicket(bookingId: number): Promise<string> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          event: true,
          user: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Generate QR code for the ticket
      const qrCodeData = await QRCode.toDataURL(JSON.stringify({
        bookingId,
        eventId: booking.eventId,
        userId: booking.userId
      }));

      // Create PDF document
      const doc = new PDFDocument();
      const fileName = `ticket-${bookingId}.pdf`;
      const filePath = join(this.uploadsDir, fileName);
      const stream = createWriteStream(filePath);

      doc.pipe(stream);

      // Add content to the PDF
      this.addTicketContent(doc, booking, qrCodeData);

      // Finalize the PDF
      doc.end();

      // Update booking with ticket path
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'completed'
        }
      });

      return fileName;
    } catch (error) {
      logger.error('Error generating ticket:', error);
      throw error;
    }
  }

  private addTicketContent(doc: PDFKit.PDFDocument, booking: any, qrCodeData: string): void {
    // Add header
    doc.fontSize(24)
       .text('Eventia Ticket', { align: 'center' })
       .moveDown();

    // Add event details
    doc.fontSize(16)
       .text(booking.event.name)
       .moveDown()
       .fontSize(12)
       .text(`Date: ${new Date(booking.event.date).toLocaleDateString()}`)
       .text(`Time: ${new Date(booking.event.date).toLocaleTimeString()}`)
       .text(`Venue: ${booking.event.venue}`)
       .moveDown();

    // Add booking details
    doc.fontSize(14)
       .text('Booking Details')
       .moveDown()
       .fontSize(12)
       .text(`Booking ID: ${booking.id}`)
       .text(`Customer: ${booking.user.name}`)
       .text(`Email: ${booking.user.email}`)
       .moveDown();

    // Add seat details
    doc.fontSize(14)
       .text('Seat Details')
       .moveDown()
       .fontSize(12);

    booking.seats.forEach((seat: any) => {
      doc.text(`Seat ${seat.seatNumber} - ${seat.section}`);
    });

    // Add QR code
    doc.moveDown()
       .image(qrCodeData, {
         fit: [150, 150],
         align: 'center'
       });

    // Add footer
    doc.moveDown()
       .fontSize(10)
       .text('This is an electronic ticket. Please present this at the venue.', {
         align: 'center'
       });
  }
} 