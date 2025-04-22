
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Copy, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface TicketData {
  category: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface BookingData {
  eventTitle: string;
  tickets: TicketData[];
  totalAmount: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentStep, setPaymentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  
  // Mock UPI VPA (in real app, this would come from admin settings)
  const upiVpa = 'eventia@okicici';
  
  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const savedBookingData = sessionStorage.getItem('bookingData');
    
    if (savedBookingData) {
      setBookingData(JSON.parse(savedBookingData));
    } else {
      // Redirect back to events if no booking data is found
      navigate('/events');
      toast({
        title: "No booking data found",
        description: "Please select an event and tickets first.",
        variant: "destructive"
      });
    }
  }, [navigate, toast]);
  
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    toast({
      title: "UPI ID Copied",
      description: "UPI ID has been copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSubmitUtr = () => {
    if (!utrNumber.trim()) {
      toast({
        title: "UTR Required",
        description: "Please enter the UTR number from your payment",
        variant: "destructive"
      });
      return;
    }
    
    if (!customerName || !email || !phone || !address) {
      toast({
        title: "Information Required",
        description: "Please fill in all the delivery information fields",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would submit this data to your backend
    // Here we'll just simulate a successful submission
    toast({
      title: "Order Placed Successfully!",
      description: "Your tickets will be delivered within 2 days"
    });
    
    // Store order data (in a real app, this would go to your database)
    const orderData = {
      bookingData,
      customerName,
      email,
      phone,
      address,
      utrNumber,
      orderDate: new Date().toISOString(),
      status: 'Pending'
    };
    
    console.log('Order submitted:', orderData);
    
    // Clear booking data from sessionStorage
    sessionStorage.removeItem('bookingData');
    
    // Redirect to confirmation page (we'll create this later)
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };
  
  if (!bookingData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading checkout information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
                
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-2">Event</h3>
                  <p className="text-gray-700">{bookingData.eventTitle}</p>
                </div>
                
                <div className="border-t border-b py-4 my-4">
                  <h3 className="font-medium text-lg mb-3">Your Tickets</h3>
                  <div className="space-y-2">
                    {bookingData.tickets.map((ticket, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {ticket.quantity} x {ticket.category}
                        </span>
                        <span className="font-medium">₹{ticket.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{bookingData.totalAmount}</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium text-lg mb-4">Delivery Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)} 
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input 
                      id="address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                <h3 className="font-medium text-lg mb-4">Payment</h3>
                
                {paymentStep === 1 ? (
                  <div className="text-center space-y-4">
                    <div className="bg-gray-100 p-6 rounded-lg mb-4">
                      <QrCode className="h-32 w-32 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-2">Scan this QR with any UPI app to pay</p>
                      
                      <div className="flex items-center justify-center space-x-2 bg-gray-200 p-2 rounded">
                        <span className="font-medium">{upiVpa}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={handleCopyUpi}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      After payment, you'll receive a UTR number. Enter it in the next step.
                    </p>
                    
                    <Button 
                      onClick={() => setPaymentStep(2)} 
                      className="w-full"
                    >
                      I've Made the Payment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="utr">UTR Number</Label>
                      <Input 
                        id="utr" 
                        value={utrNumber} 
                        onChange={(e) => setUtrNumber(e.target.value)} 
                        placeholder="Enter your UTR number"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can find the UTR number in your UPI app after payment.
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={handleSubmitUtr} 
                        className="w-full"
                      >
                        Complete Order
                      </Button>
                    </div>
                    
                    <div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setPaymentStep(1)}
                      >
                        Back to Payment Options
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
