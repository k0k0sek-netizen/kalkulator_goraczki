export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

export function scheduleNotification(title: string, body: string, delayInMinutes: number) {
    if (Notification.permission !== 'granted') return;

    // For simple implementation without Push Backend, we rely on SW or setTimeout if app is open.
    // Ideally we use ServiceWorkerRegistration.showNotification with 'tag' and 'renotify'.
    // But standard 'setTimeout' only works if tab is open/backgrounded (limited).
    // The most robust PWA way without backend is standard Notification API, 
    // but on mobile it might require the app to be 'installed'.

    setTimeout(() => {
        new Notification(title, {
            body,
            icon: '/icon-192x192.png',
            tag: 'medication-reminder'
        });
    }, delayInMinutes * 60 * 1000);
}

// Better approach: Test notification
export function sendTestNotification() {
    if (Notification.permission === 'granted') {
        new Notification("Kalkulator Gorączki", {
            body: "Powiadomienia działają poprawnie! 🔔",
            icon: '/icon-192x192.png'
        });
    }
}
