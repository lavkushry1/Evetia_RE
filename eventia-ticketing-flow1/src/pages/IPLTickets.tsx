
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/ui/page-transition';
import { iplMatches } from '@/data/iplData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { motion } from 'framer-motion';

const IPLTickets = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  
  // Filter matches by team if filter is set
  const filteredMatches = filter === 'all' 
    ? iplMatches 
    : iplMatches.filter(match => 
        match.teams.team1.name.includes(filter) || 
        match.teams.team2.name.includes(filter)
      );
  
  // Get unique team names for filtering
  const teams = Array.from(new Set(
    iplMatches.flatMap(match => [match.teams.team1.name, match.teams.team2.name])
  ));
  
  return (
    <PageTransition>
      <Navbar />
      
      <main className="flex-grow pt-16 pb-20 md:pb-8">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{t('ipl.title')}</h1>
              <LanguageSwitcher />
            </div>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              {t('ipl.subtitle')}
            </p>
          </div>
        </div>
        
        {/* Team Filter */}
        <div className="bg-background border-b py-4 sticky top-16 z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant={filter === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setFilter('all')}
              >
                {t('ipl.allMatches')}
              </Badge>
              
              {teams.map(team => (
                <Badge 
                  key={team}
                  variant={filter === team ? 'default' : 'outline'} 
                  className="cursor-pointer"
                  onClick={() => setFilter(team)}
                >
                  {team}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Matches Grid */}
        <div className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                      <div className="h-40 bg-muted relative">
                        <img 
                          src={match.image} 
                          alt={`${match.teams.team1.name} vs ${match.teams.team2.name}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">
                            {match.teams.team1.shortName} vs {match.teams.team2.shortName}
                          </CardTitle>
                          {/* Removed matchNumber usage because it doesn't exist in IPLMatch */}
                          <Badge variant="outline" className="bg-primary/10">
                            {t('ipl.match')}
                          </Badge>
                        </div>
                        <CardDescription>
                          {match.teams.team1.name} vs {match.teams.team2.name}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{match.date}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{match.time}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{match.venue}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{t('ipl.ticketsAvailable')}</span>
                        </div>
                      </CardContent>
                      
                      <CardFooter>
                        <Link to={`/event/${match.id}`} className="w-full">
                          <Button className="w-full group">
                            {t('ipl.bookTickets')}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-5xl mb-4">🏏</div>
                  <h2 className="text-2xl font-semibold mb-2">{t('ipl.noMatchesFound')}</h2>
                  <p className="text-muted-foreground">
                    {t('ipl.tryDifferentTeam')}
                  </p>
                  <Button 
                    onClick={() => setFilter('all')} 
                    variant="outline" 
                    className="mt-4"
                  >
                    {t('ipl.showAllMatches')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </PageTransition>
  );
};

export default IPLTickets;
