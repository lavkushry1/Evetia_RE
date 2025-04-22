
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { iplMatches, IPLMatch } from '@/data/iplData';
import { events, Event } from '@/data/eventsData';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeatMap from '@/components/booking/SeatMap';
import { Calendar, Clock, MapPin, Tag, ArrowLeft, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'booked' | 'locked' | 'selected';
  price: number;
  category: string;
}

const EventDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | IPLMatch | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [activeTab, setActiveTab] = useState('info');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Find the event or match by ID
    const foundEvent = events.find(e => e.id === id);
    const foundMatch = iplMatches.find(m => m.id === id);
    
    const foundItem = foundEvent || foundMatch;
    
    if (foundItem) {
      setEvent(foundItem);
    } else {
      // Redirect to a "not found" page or display an error message
      navigate('/not-found');
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (activeTab === 'seating' && selectedSeats.length === 0) {
      toast({
        title: "Please select seats",
        description: "Choose at least one seat to proceed.",
        variant: "destructive"
      });
      return;
    }
    
    if (activeTab === 'info' && !selectedTicket) {
      toast({
        title: "Please select a ticket type",
        description: "Choose the type of ticket you want to purchase.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate creating a booking on the server
    setTimeout(() => {
      setIsProcessing(false);
      
      // Create a mock booking ID
      const mockBookingId = `BKG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      
      // Calculate total amount
      const totalAmount = activeTab === 'info' 
        ? selectedTicket.price * quantity
        : selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
      
      // Navigate to payment page with booking details
      navigate(`/payment/${mockBookingId}`, {
        state: {
          bookingDetails: {
            eventTitle: event?.title,
            eventDate: event?.date,
            eventTime: event?.time,
            venue: event?.venue,
            amount: totalAmount,
            ticketCount: activeTab === 'info' ? quantity : selectedSeats.length
          }
        }
      });
    }, 1500);
  };

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-bold">Loading event details...</p>
      </div>
    );
  }

  const handleSeatSelect = (seats: Seat[]) => {
    setSelectedSeats(seats);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <LanguageSwitcher />
          </div>

          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={(event as Event).posterImage || event.image}
                  alt={event.title}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                  {'teams' in event && (
                    <CardDescription className="text-gray-500">
                      {event.teams.team1.name} vs {event.teams.team2.name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="text-gray-700">
                  {'description' in event && <p className="mb-4">{event.description}</p>}
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {event.date}
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {event.time}
                  </div>
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {event.venue}
                  </div>
                  {'duration' in event && (
                    <div className="flex items-center mb-4">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      Duration: {event.duration}
                    </div>
                  )}

                  <Tabs defaultValue="info" className="mt-6" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">General Admission</TabsTrigger>
                      <TabsTrigger value="seating">Select Seats</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{t('eventDetails.tickets')}</h3>
                        {event.ticketTypes.map((ticket, index) => (
                          <div
                            key={index}
                            className={`border rounded-md p-3 mb-2 cursor-pointer ${selectedTicket === ticket ? 'border-primary' : 'border-gray-200'}`}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{ticket.category}</p>
                                <p className="text-sm text-gray-500">₹{ticket.price}</p>
                              </div>
                              <p className="text-sm text-gray-500">{ticket.available} {t('eventDetails.available')}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{t('eventDetails.quantity')}</h3>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="mx-2">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={handleAddToCart}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            {t('common.processing')}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {t('eventDetails.proceedToPayment')}
                          </>
                        )}
                      </Button>
                    </TabsContent>
                    <TabsContent value="seating">
                      <SeatMap 
                        venueId={id || '0'} 
                        sectionId="A1" 
                        onSeatSelect={handleSeatSelect}
                        selectedSeats={selectedSeats}
                      />

                      {selectedSeats.length > 0 && (
                        <Button 
                          className="w-full mt-4" 
                          onClick={handleAddToCart}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              {t('common.processing')}
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {t('eventDetails.proceedToPayment')}
                            </>
                          )}
                        </Button>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </div>
            </div>
          </Card>
          
          <div className="mt-6 text-center">
            <Link to={`/venue-preview/${id}`}>
              <Button variant="secondary" size="lg" className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                {t('events.viewVenue')}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
