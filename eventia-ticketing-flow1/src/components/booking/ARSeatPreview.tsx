import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Smartphone, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ARSeatPreviewProps {
  venueId: string;
  sectionId: string;
  selectedSeats: string[];
}

const ARSeatPreview: React.FC<ARSeatPreviewProps> = ({ venueId, sectionId, selectedSeats }) => {
  const { t } = useTranslation();
  const [isARSupported, setIsARSupported] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [arError, setArError] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState<boolean>(false);

  // Check if WebXR is supported with proper feature detection
  const checkARSupport = useCallback(async () => {
    try {
      setIsLoading(true);
      setArError(null);
      
      // Check if WebXR is available
      if (!('xr' in navigator)) {
        setIsARSupported(false);
        return;
      }
      
      // Check if AR is supported by the device
      const isSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
      setIsARSupported(isSupported);
      
      if (!isSupported) {
        setArError(t('booking.arNotSupportedReason'));
      }
    } catch (error) {
      console.error('Error checking AR support:', error);
      setIsARSupported(false);
      setArError(t('booking.arError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    checkARSupport();
  }, [checkARSupport]);

  const handleStartAR = async () => {
    try {
      setIsARActive(true);
      
      // In a real implementation, this would launch the AR experience
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate AR session
      toast({
        title: t('booking.arStarted'),
        description: t('booking.arInstructions'),
      });
      
      // Simulate AR session ending after 30 seconds
      setTimeout(() => {
        setIsARActive(false);
        toast({
          title: t('booking.arEnded'),
          description: t('booking.arThankYou'),
        });
      }, 30000);
    } catch (error) {
      console.error('Error starting AR:', error);
      setArError(t('booking.arStartError'));
      setIsARActive(false);
    }
  };

  const handleStopAR = () => {
    setIsARActive(false);
    toast({
      title: t('booking.arEnded'),
      description: t('booking.arThankYou'),
    });
  };

  const renderARPlaceholder = () => (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {isARActive ? (
        <div className="w-full h-64 bg-primary/10 dark:bg-primary/20 rounded-lg flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-center font-medium">{t('booking.arActive')}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={handleStopAR}
          >
            {t('booking.stopAR')}
          </Button>
        </div>
      ) : (
        <>
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('booking.arPlaceholder')}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleStartAR} 
            disabled={!isARSupported || isARActive}
            className="w-full"
          >
            {t('booking.startAR')}
          </Button>
        </>
      )}
    </div>
  );

  const renderARNotSupported = () => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>{t('booking.arNotSupported')}</AlertTitle>
      <AlertDescription>
        {arError || t('booking.arNotSupportedDescription')}
      </AlertDescription>
      <div className="mt-4 flex items-center justify-center">
        <Globe className="h-5 w-5 mr-2 text-primary" />
        <p className="text-sm">{t('booking.arAlternative')}</p>
      </div>
    </Alert>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('booking.arSeatPreview')}</CardTitle>
        <CardDescription>
          {t('booking.arSeatPreviewDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ar">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ar">{t('booking.arView')}</TabsTrigger>
            <TabsTrigger value="info">{t('booking.arInfo')}</TabsTrigger>
          </TabsList>
          <TabsContent value="ar">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : isARSupported ? (
              renderARPlaceholder()
            ) : (
              renderARNotSupported()
            )}
          </TabsContent>
          <TabsContent value="info">
            <div className="space-y-4 p-4">
              <h3 className="text-lg font-medium">{t('booking.howARWorks')}</h3>
              <p>{t('booking.arInstructions')}</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t('booking.arStep1')}</li>
                <li>{t('booking.arStep2')}</li>
                <li>{t('booking.arStep3')}</li>
                <li>{t('booking.arStep4')}</li>
              </ul>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('booking.arNote')}
              </p>
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-sm font-medium">Selected Seats:</p>
                <p className="text-sm">{selectedSeats.join(', ') || 'No seats selected'}</p>
                <p className="text-sm mt-2">Venue: {venueId}</p>
                <p className="text-sm">Section: {sectionId}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ARSeatPreview; 