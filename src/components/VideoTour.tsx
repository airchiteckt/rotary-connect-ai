import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import tourDashboard from '@/assets/tour-dashboard.jpg';
import tourDocuments from '@/assets/tour-documents.jpg';
import tourContacts from '@/assets/tour-contacts.jpg';
import tourAutomation from '@/assets/tour-automation.jpg';

interface TourSlide {
  image: string;
  title: string;
  description: string;
  duration: number; // in seconds
}

const tourSlides: TourSlide[] = [
  {
    image: tourDashboard,
    title: "Dashboard Intelligente",
    description: "Una panoramica completa del tuo club con statistiche, attività recenti e azioni rapide",
    duration: 5
  },
  {
    image: tourDocuments,
    title: "Documenti AI",
    description: "Crea verbali, programmi e comunicazioni automaticamente con l'intelligenza artificiale",
    duration: 5
  },
  {
    image: tourContacts,
    title: "Gestione Contatti",
    description: "Organizza membri e contatti con categorie intelligenti e filtri avanzati",
    duration: 5
  },
  {
    image: tourAutomation,
    title: "Automazioni Smart",
    description: "Automatizza comunicazioni e notifiche per risparmiare tempo prezioso",
    duration: 5
  }
];

const VideoTour = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = 100 / (tourSlides[currentSlide].duration * 10);
          const newProgress = prev + increment;
          
          if (newProgress >= 100) {
            // Move to next slide
            if (currentSlide < tourSlides.length - 1) {
              setCurrentSlide((prev) => prev + 1);
              return 0;
            } else {
              // Tour completed
              setIsPlaying(false);
              return 100;
            }
          }
          
          return newProgress;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentSlide]);

  const handlePlay = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setCurrentSlide(0);
    setProgress(0);
    setIsPlaying(true);
    setHasStarted(true);
  };

  const totalDuration = tourSlides.reduce((acc, slide) => acc + slide.duration, 0);
  const currentTime = tourSlides.slice(0, currentSlide).reduce((acc, slide) => acc + slide.duration, 0) + 
                     (progress / 100) * tourSlides[currentSlide].duration;

  return (
    <div className="relative bg-card border rounded-xl overflow-hidden shadow-lg">
      {/* Video Container */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {/* Slide Image */}
        <div className="relative w-full h-full">
          <img 
            src={tourSlides[currentSlide].image} 
            alt={tourSlides[currentSlide].title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play Button Overlay (when not started) */}
          {!hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button
                onClick={handlePlay}
                size="lg"
                className="rounded-full w-16 h-16 p-0 bg-white/90 hover:bg-white text-primary hover:text-primary"
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>
          )}
          
          {/* Content Overlay */}
          {hasStarted && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                {tourSlides[currentSlide].title}
              </h3>
              <p className="text-sm sm:text-base text-white/90">
                {tourSlides[currentSlide].description}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      {hasStarted && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-100 ease-linear"
              style={{ 
                width: `${((currentSlide * 100 + progress) / tourSlides.length)}%` 
              }}
            />
          </div>
          
          {/* Control Buttons and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!isPlaying ? (
                <Button
                  onClick={handlePlay}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <Play className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                onClick={handleRestart}
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {Math.floor(currentTime)}s / {totalDuration}s
            </div>
          </div>
          
          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2">
            {tourSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setProgress(0);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-primary' : 'bg-primary/30'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTour;