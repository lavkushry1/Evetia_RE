import PDFDocument from 'pdfkit';
import { getRepository } from 'typeorm';
import { Event } from '../models/event.model';
import { Booking } from '../models/booking.model';
import { User } from '../models/user.model';
import QRCode from 'qrcode';

class PDFService {
  async generateTicket(bookingId: string): Promise<Buffer> {
    const bookingRepository = getRepository(Booking);
    const booking = await bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['event', 'user'],
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({
      bookingId: booking.id,
      eventId: booking.event.id,
      userId: booking.user.id,
    }));

    // Add header
    doc.fontSize(24).text('Event Ticket', { align: 'center' });
    doc.moveDown();

    // Add event details
    doc.fontSize(16).text('Event Details');
    doc.fontSize(12)
      .text(`Event: ${booking.event.name}`)
      .text(`Date: ${new Date(booking.event.date).toLocaleDateString()}`)
      .text(`Venue: ${booking.event.stadium.name}`)
      .moveDown();

    // Add booking details
    doc.fontSize(16).text('Booking Details');
    doc.fontSize(12)
      .text(`Booking ID: ${booking.id}`)
      .text(`Seats: ${booking.seats.join(', ')}`)
      .text(`Quantity: ${booking.quantity}`)
      .text(`Total Amount: ${booking.totalAmount}`)
      .moveDown();

    // Add user details
    doc.fontSize(16).text('Attendee Details');
    doc.fontSize(12)
      .text(`Name: ${booking.user.firstName} ${booking.user.lastName}`)
      .text(`Email: ${booking.user.email}`)
      .moveDown();

    // Add QR code
    doc.image(qrCodeData, {
      fit: [150, 150],
      align: 'center',
    });

    // Add footer
    doc.fontSize(10)
      .text('Please present this ticket at the venue entrance.', { align: 'center' })
      .text('This ticket is non-transferable.', { align: 'center' });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
}

export default new PDFService(); 