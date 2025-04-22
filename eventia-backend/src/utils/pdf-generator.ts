import PDFDocument from 'pdfkit';
import { Event } from '../models/event.model';
import { Booking } from '../models/booking.model';
import { User } from '../models/user.model';

export const generateTicketPDF = async (
  event: Event,
  booking: Booking,
  user: User
): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Add content to PDF
    doc.fontSize(25).text('Event Ticket', { align: 'center' });
    doc.moveDown();
    doc.fontSize(15).text(`Event: ${event.name}`);
    doc.text(`Date: ${event.date.toLocaleDateString()}`);
    doc.text(`Venue: ${event.stadium.name}`);
    doc.text(`Booking ID: ${booking.id}`);
    doc.text(`Attendee: ${user.name}`);
    doc.text(`Quantity: ${booking.quantity}`);
    doc.text(`Total Amount: $${booking.totalAmount}`);
    doc.text(`Status: ${booking.status}`);

    doc.end();
  });
}; 