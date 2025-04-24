import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { iplMatches, IPLMatch } from '@/data/iplData';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, MapPin, Tag, ArrowLeft, ShoppingCart, Eye, Share2, Info, ChevronRight, Star, Shield, Ticket, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const IPLMatchDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<IPLMatch | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('tickets');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  useEffect(() => {
    // Find the match by ID
    const foundMatch = iplMatches.find(m => m.id === id);
    
    if (foundMatch) {
      setMatch(foundMatch);
    } else {
      // Redirect to a "not found" page or display an error message
      navigate('/not-found');
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!selectedTicket) {
      toast({
        title: t('common.error'),
        description: t('ipl.selectTicketCategory'),
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
      const totalAmount = selectedTicket.price * quantity;
      
      // Navigate to payment page with booking details
      navigate(`/payment/${mockBookingId}`, {
        state: {
          bookingDetails: {
            eventTitle: match?.title,
            eventDate: match?.date,
            eventTime: match?.time,
            venue: match?.venue,
            amount: totalAmount,
            ticketCount: quantity,
            teams: match?.teams
          }
        }
      });
    }, 1500);
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  if (!match) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-bold">{t('common.loadingMatch')}</p>
      </div>
    );
  }

  // Format date
  const formattedDate = new Date(match.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Format time
  const formattedTime = new Date(`2000-01-01T${match.time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Hero Section */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img
              src={match.image}
              alt={match.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary text-white">{t('ipl.title')}</Badge>
                <Badge variant="outline" className="text-white border-white">
                  {t('ipl.matchNumber', { number: 1 })}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{match.title}</h1>
              <div className="flex items-center text-white/80 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formattedDate}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Teams Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 flex flex-col items-center">
                <img src={match.teams.team1.logo} alt={match.teams.team1.name} className="h-20 w-20 mb-2" />
                <h3 className="text-xl font-bold">{match.teams.team1.name}</h3>
                <p className="text-gray-500">{match.teams.team1.shortName}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-primary">{t('common.vs')}</div>
                <div className="text-sm text-gray-500 mt-2">{formattedTime}</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <img src={match.teams.team2.logo} alt={match.teams.team2.name} className="h-20 w-20 mb-2" />
                <h3 className="text-xl font-bold">{match.teams.team2.name}</h3>
                <p className="text-gray-500">{match.teams.team2.shortName}</p>
              </div>
            </div>
          </div>

          {/* Venue Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{t('common.venue')}</h2>
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">{match.venue}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Eden Gardens, Kolkata, West Bengal, India
                </p>
                <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                  {t('common.viewOnMap')} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="tickets" className="mb-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="tickets">{t('common.tickets')}</TabsTrigger>
              <TabsTrigger value="seating">{t('ipl.selectSeats')}</TabsTrigger>
              <TabsTrigger value="info">{t('common.info')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tickets">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('ipl.selectTickets')}</CardTitle>
                      <CardDescription>{t('ipl.selectTicketsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {match.ticketTypes.map((ticket, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedTicket === ticket ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{ticket.category}</h3>
                                <p className="text-sm text-gray-500 mt-1">{t('ipl.bestView')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{ticket.price}</p>
                                <p className="text-xs text-gray-500">{ticket.available} {t('common.available')}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('ipl.orderSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedTicket ? (
                        <>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{selectedTicket.category} x {quantity}</span>
                              <span>₹{selectedTicket.price * quantity}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                              <span>{t('payment.totalAmount')}</span>
                              <span>₹{selectedTicket.price * quantity}</span>
                            </div>
                            
                            <div className="space-y-2 mt-4">
                              <h3 className="font-semibold">{t('ipl.selectQuantity')}</h3>
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                  disabled={quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="mx-4 w-8 text-center">{quantity}</span>
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
                                  {t('ipl.proceedToPayment')}
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Ticket className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>{t('ipl.selectTicketCategory')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="seating">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('ipl.selectSeats')}</CardTitle>
                      <CardDescription>{t('ipl.selectSeatsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 p-6 rounded-lg mb-6">
                        <div className="grid grid-cols-10 gap-2">
                          {/* This is a simplified seat map - in a real app, this would be more complex */}
                          {Array.from({ length: 100 }).map((_, i) => {
                            const row = Math.floor(i / 10) + 1;
                            const col = (i % 10) + 1;
                            const seatId = `A${row}-${col}`;
                            const isAvailable = Math.random() > 0.3; // Randomly mark some seats as unavailable
                            
                            return (
                              <div
                                key={i}
                                className={`aspect-square rounded-md flex items-center justify-center text-xs cursor-pointer ${
                                  !isAvailable 
                                    ? 'bg-gray-300 cursor-not-allowed' 
                                    : selectedSeats.includes(seatId)
                                    ? 'bg-primary text-white'
                                    : 'bg-white hover:bg-primary/20'
                                }`}
                                onClick={() => isAvailable && handleSeatSelect(seatId)}
                              >
                                {col}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex justify-center mt-4 gap-4">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-white rounded-md mr-2"></div>
                            <span className="text-sm">{t('ipl.seatLegend.available')}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-primary rounded-md mr-2"></div>
                            <span className="text-sm">{t('ipl.seatLegend.selected')}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-300 rounded-md mr-2"></div>
                            <span className="text-sm">{t('ipl.seatLegend.unavailable')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold">{t('ipl.seatCategories')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {match.ticketTypes.map((ticket, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{ticket.category}</h3>
                                  <p className="text-sm text-gray-500 mt-1">{t('ipl.bestView')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">₹{ticket.price}</p>
                                  <p className="text-xs text-gray-500">{ticket.available} {t('common.available')}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('ipl.selectedSeats')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedSeats.length > 0 ? (
                        <>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              {selectedSeats.map((seat, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-gray-600">Seat {seat}</span>
                                  <span>₹{match.ticketTypes[0].price}</span>
                                </div>
                              ))}
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                              <span>{t('payment.totalAmount')}</span>
                              <span>₹{match.ticketTypes[0].price * selectedSeats.length}</span>
                            </div>
                            
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
                                  {t('ipl.proceedToPayment')}
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>{t('ipl.selectSeatsToSee')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('ipl.matchInfo.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">{t('ipl.matchInfo.about')}</h3>
                          <p className="text-gray-600">
                            {t('ipl.matchInfo.aboutDesc', {
                              team1: match.teams.team1.name,
                              team2: match.teams.team2.name,
                              venue: match.venue
                            })}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2">{t('ipl.matchInfo.venueDetails')}</h3>
                          <p className="text-gray-600">
                            {t('ipl.matchInfo.venueDesc', { venue: match.venue })}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2">{t('ipl.matchInfo.importantInfo')}</h3>
                          <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>{t('ipl.matchInfo.importantPoints.gates')}</li>
                            <li>{t('ipl.matchInfo.importantPoints.id')}</li>
                            <li>{t('ipl.matchInfo.importantPoints.food')}</li>
                            <li>{t('ipl.matchInfo.importantPoints.parking')}</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>{t('ipl.faq.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>{t('ipl.faq.refundPolicy.question')}</AccordionTrigger>
                          <AccordionContent>
                            {t('ipl.faq.refundPolicy.answer')}
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>{t('ipl.faq.transfer.question')}</AccordionTrigger>
                          <AccordionContent>
                            {t('ipl.faq.transfer.answer')}
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger>{t('ipl.faq.bring.question')}</AccordionTrigger>
                          <AccordionContent>
                            {t('ipl.faq.bring.answer')}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('ipl.highlights.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Star className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{t('ipl.highlights.topPlayers.title')}</h3>
                            <p className="text-sm text-gray-600">
                              {t('ipl.highlights.topPlayers.desc')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{t('ipl.highlights.secure.title')}</h3>
                            <p className="text-sm text-gray-600">
                              {t('ipl.highlights.secure.desc')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <AlertCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{t('ipl.highlights.notice.title')}</h3>
                            <p className="text-sm text-gray-600">
                              {t('ipl.highlights.notice.desc')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IPLMatchDetail; 