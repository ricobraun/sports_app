import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Button from './ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  if (!isInstallable && !isIOS) return null;

  return (
    <div className="relative">
      {isIOS ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Show iOS installation instructions
            alert('To install the app:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"');
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstallClick}
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      )}
    </div>
  );
};

export default InstallPWA;