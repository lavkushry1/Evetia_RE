import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/ui/page-transition";
import React from 'react';

import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Checkout from "./pages/Checkout";
import DeliveryDetails from "./pages/DeliveryDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEventManagement from "./pages/AdminEventManagement";
import AdminUpiManagement from "./pages/AdminUpiManagement";
import AdminUtrVerification from "./pages/AdminUtrVerification";
import AdminRequestManagement from "./pages/AdminRequestManagement";
import ARVenuePreview from "./pages/ARVenuePreview";
import IPLTickets from "./pages/IPLTickets";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/layout/BottomNav";

// Import for language configuration
import "./i18n/config";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Create a component for route handling that includes AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Index />
          </PageTransition>
        } />
        <Route path="/events" element={
          <PageTransition>
            <Events />
          </PageTransition>
        } />
        <Route path="/event/:id" element={
          <PageTransition>
            <EventDetail />
          </PageTransition>
        } />
        <Route path="/delivery-details" element={
          <PageTransition>
            <DeliveryDetails />
          </PageTransition>
        } />
        <Route path="/payment/:bookingId" element={
          <PageTransition>
            <Payment />
          </PageTransition>
        } />
        <Route path="/confirmation/:bookingId" element={
          <PageTransition>
            <Confirmation />
          </PageTransition>
        } />
        <Route path="/checkout" element={
          <PageTransition>
            <Checkout />
          </PageTransition>
        } />
        <Route path="/ipl-tickets" element={
          <PageTransition>
            <IPLTickets />
          </PageTransition>
        } />
        <Route path="/support" element={
          <PageTransition>
            <Support />
          </PageTransition>
        } />
        <Route path="/admin-login" element={
          <PageTransition>
            <AdminLogin />
          </PageTransition>
        } />
        <Route path="/admin-dashboard" element={
          <PageTransition>
            <AdminDashboard />
          </PageTransition>
        } />
        <Route path="/admin-events" element={
          <PageTransition>
            <AdminEventManagement />
          </PageTransition>
        } />
        <Route path="/admin-upi" element={
          <PageTransition>
            <AdminUpiManagement />
          </PageTransition>
        } />
        <Route path="/admin-utr" element={
          <PageTransition>
            <AdminUtrVerification />
          </PageTransition>
        } />
        <Route path="/admin-requests" element={
          <PageTransition>
            <AdminRequestManagement />
          </PageTransition>
        } />
        <Route path="/venue-preview/:id" element={
          <PageTransition>
            <ARVenuePreview />
          </PageTransition>
        } />
        <Route path="*" element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
