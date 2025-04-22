
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DeliveryDetailsForm from '@/components/payment/DeliveryDetailsForm';

const DeliveryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get booking details from location state
  const bookingDetails = location.state?.bookingDetails || null;
  
  // If no booking details, redirect to events page
  if (!bookingDetails) {
    navigate('/events');
    return null;
  }
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Delivery Details</h1>
              <p className="text-gray-600">
                For event: {bookingDetails.eventTitle}
              </p>
            </div>
            
            <DeliveryDetailsForm 
              bookingId={bookingDetails.bookingId}
              eventTitle={bookingDetails.eventTitle}
              amount={bookingDetails.amount}
              onBack={handleBack}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DeliveryDetails;
