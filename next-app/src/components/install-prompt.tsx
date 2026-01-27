'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
        }

        // Listen for install prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        try {
            const { outcome } = await deferredPrompt.userChoice;
            console.log('User response to the install prompt:', outcome);

            if (outcome === 'accepted') {
                toast.success('Pomyślnie zainstalowano!');
            } else {
                toast.info('Instalacja anulowana');
            }
        } catch (e) {
            console.error(e);
        } finally {
            // We can't use the prompt again, so clear it
            setDeferredPrompt(null);
        }
    };

    if (isStandalone) return null;

    if (deferredPrompt) {
        return (
            <Card className="border-emerald-500/20 bg-emerald-950/10 mb-6">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="text-sm text-emerald-400">
                        Zainstaluj aplikację, aby mieć ją zawsze pod ręką.
                    </div>
                    <Button onClick={handleInstall} size="sm" className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
                        <Download className="h-4 w-4 mr-2" />
                        Zainstaluj
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isIOS) {
        return (
            <Card className="border-blue-500/20 bg-blue-950/10 mb-6">
                <CardContent className="p-4 text-sm text-blue-300">
                    <div className="flex items-center gap-2 mb-2 font-bold text-blue-400">
                        <Share2 className="h-4 w-4" />
                        Instalacja na iOS
                    </div>
                    <p>Aby zainstalować, kliknij przycisk "Udostępnij" w Safari, a następnie wybierz "Do ekranu początkowego" (Add to Home Screen).</p>
                </CardContent>
            </Card>
        );
    }

    return null;
}
