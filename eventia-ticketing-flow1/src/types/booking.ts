export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
} 