
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/events/EventCard';
import { events } from '@/data/eventsData';
import { Search, Filter, Calendar, MapPin, ArrowUpDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const Events = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('date-asc');

  // Get all unique categories and venues
  const categories = ['All', ...new Set(events.map(event => event.category))];
  const venues = ['All', ...new Set(events.map(event => event.venue))];

  // Add an active filter
  const addFilter = (type: string, value: string) => {
    if (value && value !== 'All') {
      // Remove any existing filter of the same type
      const updatedFilters = activeFilters.filter(f => !f.startsWith(`${type}:`));
      setActiveFilters([...updatedFilters, `${type}:${value}`]);
    } else {
      // If 'All' is selected, remove filters of this type
      setActiveFilters(activeFilters.filter(f => !f.startsWith(`${type}:`)));
    }
  };

  // Remove a filter
  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
    
    // Reset the corresponding state
    const [type, value] = filter.split(':');
    if (type === 'category') setSelectedCategory('');
    if (type === 'venue') setSelectedVenue('');
    if (type === 'date') setDateRange('');
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedCategory('');
    setSelectedVenue('');
    setDateRange('');
  };

  // Update filters when selections change
  useEffect(() => {
    if (selectedCategory) addFilter('category', selectedCategory);
    if (selectedVenue) addFilter('venue', selectedVenue);
    if (dateRange) addFilter('date', dateRange);
  }, [selectedCategory, selectedVenue, dateRange]);

  // Filter events based on search term, category, venue, and date
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if event passes all active filters
    const passesFilters = activeFilters.every(filter => {
      const [type, value] = filter.split(':');
      
      if (type === 'category') return event.category === value;
      if (type === 'venue') return event.venue === value;
      if (type === 'date') {
        // Simple date range logic - can be expanded
        if (value === 'today') {
          const today = new Date().toISOString().split('T')[0];
          return event.date === today;
        }
        if (value === 'this-week') {
          const today = new Date();
          const eventDate = new Date(event.date);
          const diffTime = Math.abs(eventDate.getTime() - today.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && eventDate >= today;
        }
        if (value === 'this-month') {
          const today = new Date();
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === today.getMonth() && 
                 eventDate.getFullYear() === today.getFullYear() && 
                 eventDate >= today;
        }
      }
      return true;
    });
    
    return matchesSearch && (activeFilters.length === 0 || passesFilters);
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'price-asc':
        return Math.min(...a.ticketTypes.map(t => t.price)) - Math.min(...b.ticketTypes.map(t => t.price));
      case 'price-desc':
        return Math.min(...b.ticketTypes.map(t => t.price)) - Math.min(...a.ticketTypes.map(t => t.price));
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Header */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{t('events.title')}</h1>
              <LanguageSwitcher />
            </div>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {t('events.subtitle')}
            </p>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white border-b py-4 sticky top-16 z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder={t('events.searchPlaceholder')}
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.filter') + ' ' + t('categories.title')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'All' ? t('common.all') : t(`categories.${category.toLowerCase().replace(/ & /g, 'And')}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.filter') + ' ' + t('common.venue')} />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue} value={venue}>
                          {venue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.filter') + ' ' + t('common.date')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">{t('events.today')}</SelectItem>
                      <SelectItem value="this-week">{t('events.thisWeek')}</SelectItem>
                      <SelectItem value="this-month">{t('events.thisMonth')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('events.sortBy')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-asc">{t('events.dateAsc')}</SelectItem>
                      <SelectItem value="date-desc">{t('events.dateDesc')}</SelectItem>
                      <SelectItem value="price-asc">{t('events.priceAsc')}</SelectItem>
                      <SelectItem value="price-desc">{t('events.priceDesc')}</SelectItem>
                      <SelectItem value="name-asc">{t('events.nameAsc')}</SelectItem>
                      <SelectItem value="name-desc">{t('events.nameDesc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">{t('events.activeFilters')}:</span>
                  {activeFilters.map((filter) => {
                    const [type, value] = filter.split(':');
                    return (
                      <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                        {type === 'category' ? t(`categories.${value.toLowerCase().replace(/ & /g, 'And')}`) : ''}
                        {type === 'venue' ? value : ''}
                        {type === 'date' ? t(`events.${value}`) : ''}
                        <button 
                          onClick={() => removeFilter(filter)}
                          className="ml-1 h-4 w-4 rounded-full flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    {t('events.clearAll')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Events Grid */}
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {sortedEvents.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="text-gray-600">
                    {t('common.showing')} {sortedEvents.length} {sortedEvents.length === 1 ? t('common.event') : t('common.events')}
                  </div>
                  <div className="flex items-center text-sm">
                    <ArrowUpDown className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="hidden md:inline">{t('events.sortedBy')}: </span>
                    <span className="font-medium ml-1">
                      {t(`events.${sortBy}`)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('common.noEventsFound')}</h2>
                <p className="text-gray-600">
                  {t('common.tryDifferent')}
                </p>
                <Button 
                  onClick={clearAllFilters} 
                  variant="outline" 
                  className="mt-4"
                >
                  {t('events.resetFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Events;
