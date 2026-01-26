# 🚀 TODO: Kalkulator Gorączki - Plan Rozwoju

## 📋 Status projektu
- ✅ **Wersja 1.0** - Podstawowa funkcjonalność (GOTOWE)
- 🔄 **Wersja 2.0** - Rozszerzenia (W TRAKCIE)

---

## ✅ Ukończone funkcje (v1.0)

- [x] Kalkulator dawek Paracetamol i Ibuprofen
- [x] Profile dzieci (wieloprofilowość)
- [x] Historia podań z datą i godziną
- [x] Wykres temperatury
- [x] Dark mode (domyślny)
- [x] Modal potwierdzenia dawki
- [x] Pomiar samej temperatury
- [x] Pasek zużycia dawki dobowej
- [x] Automatyczne przełączanie tryb pediatryczny/dorosły (<40kg/>40kg)
- [x] Eksport/Import JSON
- [x] Raport dla lekarza (kopiowanie do schowka)
- [x] Edycja wpisów w historii
- [x] Responsywność (max-width na desktop)
- [x] Asystent AI (interfejs gotowy, wymaga API key)

---

## 🎯 Priorytet 1: Quick Wins (łatwe do dodania, duży efekt)

### 1. ⏰ Live Timer - Odliczanie do kolejnej dawki
**Opis**: Zamiast statycznej godziny "Można podać o 14:30", pokazuj live timer "Za 2h 15min 33s"

**Implementacja**:
```javascript
// W komponencie DrugCard
const [timeLeft, setTimeLeft] = useState('');

useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    const nextDose = new Date(lastDoseTime + intervalHours * 3600000);
    const diff = nextDose - now;
    
    if (diff <= 0) {
      setTimeLeft('MOŻNA PODAĆ');
    } else {
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`Za ${hours}h ${mins}min ${secs}s`);
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [lastDoseTime]);
```

**Lokalizacja**: `DrugCard` komponent  
**Szacowany czas**: 30 min  
**Priorytet**: 🔥 WYSOKI

---

### 2. 📝 Notatki/Objawy dodatkowe
**Opis**: Checkbox z typowymi objawami + pole tekstowe na notatki

**UI**:
- Modal "Dodaj objawy" (przycisk obok "Dodaj pomiar temperatury")
- Checkboxy: katar, kaszel, ból gardła, wymioty, biegunka, ból brzucha
- Textarea: dodatkowe notatki
- Wyświetlanie w historii jako ikona + tooltip

**Schema danych**:
```javascript
{
  id: '...',
  timestamp: '...',
  type: 'symptoms',
  symptoms: ['katar', 'kaszel'],
  notes: 'Dziecko skarży się na ból głowy'
}
```

**Komponenty do utworzenia**:
- `SymptomsModal.jsx`
- Ikona `Stethoscope` lub `FileText`

**Lokalizacja**: DashboardView (nowy przycisk), HistoryView (wyświeltanie)  
**Szacowany czas**: 2h  
**Priorytet**: 🔥 WYSOKI

---

### 3. 📊 Statystyki w Dashboard
**Opis**: Podsumowanie choroby w liczbach

**Co wyświetlić (kafelki)**:
- 🌡️ Średnia temperatura (ostatnie 24h)
- 📈 Najwyższa temperatura (ostatnie 24h)
- 💊 Liczba podań leków (dziś / łącznie)
- ⏱️ Czas trwania choroby (od pierwszego pomiaru)
- 📉 Trend temperatury (↗️ rośnie / ↘️ spada / → stabilna)

**Implementacja**:
```javascript
const DashboardStats = ({ history }) => {
  const last24h = history.filter(h => 
    new Date(h.timestamp) > Date.now() - 86400000
  );
  
  const temps = last24h
    .filter(h => h.temperature)
    .map(h => h.temperature);
  
  const avgTemp = temps.reduce((a,b) => a+b, 0) / temps.length;
  const maxTemp = Math.max(...temps);
  
  // ...
};
```

**Lokalizacja**: DashboardView (nowy komponent)  
**Szacowany czas**: 1.5h  
**Priorytet**: 🟡 ŚREDNI

---

## 🎯 Priorytet 2: Wartościowe funkcje

### 4. 📄 PDF Report dla lekarza
**Opis**: Profesjonalny raport do wydruku/wysłania mailem

**Zawartość PDF**:
1. Header: Logo + "Kalkulator Gorączki - Raport Medyczny"
2. Dane pacjenta: Imię, Waga, Wiek (wyliczony z wagi)
3. Okres: Data od-do
4. Tabela historii: Data | Lek/Pomiar | Dawka | Temperatura | Objawy
5. Wykres temperatury (jako obraz)
6. Podsumowanie:
   - Średnia temperatura
   - Liczba podań leków
   - Czas trwania choroby

**Biblioteka**: [jsPDF](https://github.com/parallax/jsPDF) + [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

**Instalacja** (jeśli przejdziemy na build):
```bash
npm install jspdf jspdf-autotable
```

**Lub CDN** (dla single-file):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
```

**Kod przykładowy**:
```javascript
const generatePDF = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('Raport Medyczny - Kalkulator Gorączki', 20, 20);
  
  // Dane pacjenta
  doc.setFontSize(12);
  doc.text(`Pacjent: ${profile.name}`, 20, 35);
  doc.text(`Waga: ${profile.weight} kg`, 20, 42);
  
  // Tabela historii
  doc.autoTable({
    startY: 50,
    head: [['Data', 'Lek', 'Dawka', 'Temp.']],
    body: history.map(h => [
      new Date(h.timestamp).toLocaleString('pl-PL'),
      h.drug,
      `${h.doseMl} ${h.unit}`,
      h.temperature ? `${h.temperature}°C` : '-'
    ])
  });
  
  // Zapis
  doc.save(`raport_${profile.name}_${new Date().toISOString().slice(0,10)}.pdf`);
};
```

**UI**: Przycisk w HistoryView obok "Kopiuj raport"  
**Szacowany czas**: 3h  
**Priorytet**: 🔥 WYSOKI

---

### 5. 🔔 Powiadomienia Push
**Opis**: Przypomnienie o kolejnej dawce (nawet gdy strona zamknięta)

**Technologie**:
- **Web Notifications API** (proste, działa gdy strona otwarta)
- **Service Worker + Push API** (zaawansowane, działa gdy strona zamknięta)

**Implementacja Phase 1** (Web Notifications - proste):
```javascript
// Prośba o pozwolenie
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Zaplanowanie powiadomienia
const scheduleNotification = (drugName, time) => {
  const now = Date.now();
  const delay = new Date(time) - now;
  
  if (delay > 0) {
    setTimeout(() => {
      new Notification('Kalkulator Gorączki', {
        body: `Czas na kolejną dawkę: ${drugName}`,
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        tag: 'dose-reminder'
      });
    }, delay);
  }
};
```

**UI**: 
- Ustawienia → Toggle "Włącz powiadomienia"
- Po podaniu leku = auto-schedule powiadomienia

**Lokalizacja**: SettingsView (toggle), addToHistory (schedule)  
**Szacowany czas**: 2h (prosta wersja), 6h (Service Worker)  
**Priorytet**: 🔥 WYSOKI

---

### 6. 📅 Historia archiwalna / Zakończenie choroby
**Opis**: Rozdzielenie aktywnej choroby od archiwum

**Funkcjonalność**:
1. Przycisk "Zakończ chorobę" w Profilu
2. Historia trafia do `archivedIllnesses`
3. Możliwość przeglądania archiwum
4. Porównywanie: "Ostatnia choroba trwała 5 dni"

**Schema**:
```javascript
profile: {
  id: '...',
  name: '...',
  weight: 22,
  history: [...],  // Aktualna choroba
  archivedIllnesses: [
    {
      id: '...',
      startDate: '2026-01-15',
      endDate: '2026-01-20',
      history: [...],
      summary: {
        duration: 5,
        maxTemp: 39.5,
        medicineCount: 12
      }
    }
  ]
}
```

**UI**:
- Profil → Przycisk "Zakończ chorobę"
- Nowa zakładka "Archiwum" lub rozwijana lista w Historii

**Szacowany czas**: 3h  
**Priorytet**: 🟡 ŚREDNI

---

## 🎯 Priorytet 3: Zaawansowane funkcje

### 7. 📱 PWA (Progressive Web App)
**Opis**: Instalacja aplikacji jak natywna app

**Wymagane pliki**:
1. **manifest.json**:
```json
{
  "name": "Kalkulator Gorączki",
  "short_name": "KalGor",
  "description": "Kalkulator dawek leków przeciwgorączkowych dla dzieci",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#10b981",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **service-worker.js** (cache offline):
```javascript
const CACHE_NAME = 'kalkulator-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

3. **Ikony**: Wygenerować z logo (można użyć https://realfavicongenerator.net/)

**Rejestracja SW w HTML**:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('SW registered', reg))
    .catch(err => console.log('SW error', err));
}
```

**Szacowany czas**: 4h (z ikonami)  
**Priorytet**: 🟡 ŚREDNI

---

### 8. 🌐 Udostępnianie między urządzeniami (QR Code)
**Opis**: Rodzice mogą synchronizować dane między telefonami

**Implementacja Phase 1** (QR Code - prosty):
```javascript
// Biblioteka: https://github.com/davidshimjs/qrcodejs
const shareProfile = () => {
  const data = btoa(JSON.stringify(activeProfile)); // Base64 encode
  const qr = new QRCode(document.getElementById('qrcode'), {
    text: `https://twoja-app.vercel.app/import?data=${data}`,
    width: 256,
    height: 256
  });
};

// Import z QR
const importFromQR = (data) => {
  const decoded = JSON.parse(atob(data));
  setProfiles([...profiles, decoded]);
};
```

**UI**:
- Profil → "Udostępnij" → Modal z QR
- "Zaimportuj z QR" → Kamera (Web API)

**Alternatywa zaawansowana**: Firebase Realtime Database (wymaga backend)

**Szacowany czas**: 3h (QR), 8h (Firebase)  
**Priorytet**: 🔵 NISKI

---

### 9. 🤖 Rozbudowa AI - Smart Insights
**Opis**: AI analizuje dane i daje rekomendacje

**Funkcje AI**:
1. **Analiza trendów**:
   - "Gorączka rośnie mimo leków - rozważ kontakt z lekarzem"
   - "Temperatura stabilna <38°C - możesz rozważyć przerwanie leków"
   
2. **Alerty bezpieczeństwa**:
   - "Przekroczono 3 dni gorączki - wizyta u lekarza zalecana"
   - "Zbyt częste podawanie Ibuprofenu - sprawdź limity"
   
3. **Predykcja**:
   - "Na podstawie dotychczasowego przebiegu, gorączka powinna spaść w ciągu 12h"

**Implementacja** (Gemini API):
```javascript
const analyzeWithAI = async (history, profile) => {
  const last48h = history.filter(h => 
    new Date(h.timestamp) > Date.now() - 172800000
  );
  
  const prompt = `
Jesteś pediatrą. Przeanalizuj dane:

Pacjent: ${profile.name}, ${profile.weight}kg
Historia ostatnich 48h:
${JSON.stringify(last48h, null, 2)}

Odpowiedz zwięźle:
1. Czy są niepokojące trendy?
2. Czy należy się skontaktować z lekarzem?
3. Prognoza (kiedy gorączka ustąpi)?
`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
```

**UI**:
- Dashboard → Kafelek "AI Insights" (auto-analiza)
- AI tab → Przycisk "Analizuj dane"

**Wymagania**: Gemini API key (bezpłatny tier: 60 req/min)

**Szacowany czas**: 4h  
**Priorytet**: 🟡 ŚREDNI

---

### 10. 🎨 Personalizacja
**Opis**: Customizacja UI i ustawień

**Funkcje**:
1. **Motyw kolorystyczny**:
   - Domyślny (zielony akcentuemeral)
   - Niebieski
   - Różowy
   - Pomarańczowy
   
2. **Awatar dziecka**:
   - Upload zdjęcia (base64 w localStorage)
   - Wyświetlanie w DashboardView
   
3. **Niestandardowe nazwy leków**:
   - "Nasz różowy syrop" zamiast "Paracetamol 120mg/5ml"
   - Input field z custom label
   
4. **Jednostki**:
   - °C / °F (temperatura)
   - kg / lb (waga)

**Implementacja**:
```javascript
// ThemeContext
const themes = {
  green: { primary: '#10b981', secondary: '#14b8a6' },
  blue: { primary: '#3b82f6', secondary: '#06b6d4' },
  pink: { primary: '#ec4899', secondary: '#f43f5e' },
  orange: { primary: '#f97316', secondary: '#f59e0b' }
};

// Avatar upload
const uploadAvatar = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    updateProfile({ ...activeProfile, avatar: base64 });
  };
  reader.readAsDataURL(file);
};
```

**UI**: Settings → Sekcje "Motyw", "Awatar", "Personalizacja leków"

**Szacowany czas**: 5h  
**Priorytet**: 🔵 NISKI

---

## 🛠️ Infrastruktura i Utrzymanie

### 11. Migracja do Vite + React
**Opis**: Przepisanie z single-file HTML na prawdziwy projekt React

**Powody**:
- Lepsze zarządzanie kodem (komponenty w osobnych plikach)
- TypeScript support
- Hot Module Replacement (szybszy development)
- Tree shaking (mniejszy bundle)
- Możliwość użycia npm packages bez CDN

**Kroki**:
1. `npm create vite@latest kalkulator-goraczki -- --template react`
2. Podzielenie `index.html` na komponenty:
   - `src/components/DrugCard.jsx`
   - `src/components/TemperatureChart.jsx`
   - `src/views/DashboardView.jsx`
   - itd.
3. Przeniesienie styli do CSS modules lub Tailwind config
4. Konfiguracja Vercel dla Vite

**Szacowany czas**: 2 dni  
**Priorytet**: 🟡 ŚREDNI (gdy aplikacja będzie większa)

---

### 12. Testy automatyczne
**Opis**: Zapobieganie regresji przy dodawaniu nowych funkcji

**Narzędzia**:
- **Vitest** (unit tests)
- **React Testing Library** (component tests)
- **Playwright** (E2E tests)

**Przykładowe testy**:
```javascript
// DrugCard.test.jsx
it('calculates correct dose for 22kg child', () => {
  const dose = calculateDose(22, 'paracetamol');
  expect(dose.min).toBe(220);
  expect(dose.max).toBe(330);
});

it('switches to adult mode at 40kg', () => {
  render(<DrugCard weight={40} />);
  expect(screen.getByText(/Dorośli/)).toBeInTheDocument();
});
```

**Szacowany czas**: 3 dni (setup + testy podstawowe)  
**Przyorytet**: 🟡 ŚREDNI

---

## 📦 Podsumowanie priorytetów

### Do zrobienia w najbliższym czasie:
1. ⏰ Live Timer (30 min) - **START HERE**
2. 📝 Notatki/Objawy (2h)
3. 📊 Statystyki Dashboard (1.5h)
4. 📄 PDF Report (3h)
5. 🔔 Powiadomienia (2h)

### Średnioterminowe:
6. 📅 Archiwum chorób (3h)
7. 📱 PWA (4h)
8. 🤖 AI Insights (4h)

### Długoterminowe:
9. 🌐 QR Share (3h)
10. 🎨 Personalizacja (5h)
11. Migracja do Vite (2 dni)
12. Testy (3 dni)

---

## 🎯 Milestone'y

### Milestone 1: "Essential Features" (1 tydzień)
- [ ] Live Timer
- [ ] Notatki/Objawy
- [ ] Statystyki Dashboard
- [ ] PDF Report

### Milestone 2: "Pro Features" (2 tygodnie)
- [ ] Powiadomienia Push
- [ ] Archiwum chorób
- [ ] PWA (offline mode)

### Milestone 3: "Advanced Features" (1 miesiąc)
- [ ] AI Insights rozbudowane
- [ ] QR Sharing
- [ ] Personalizacja
- [ ] Testy automatyczne

---

## 📝 Notatki implementacyjne

### Ważne:
- **Zawsze testuj na prawdziwych danych** (nie mock)
- **Zachowuj backward compatibility** z localStorage (migracje)
- **Mobile-first** - najpierw telefon, potem desktop
- **Accessibility** - ARIA labels, keyboard navigation
- **Performance** - lazy loading, memo, useMemo dla ciężkich obliczeń

### Biblioteki do rozważenia (jeśli Vite):
- `date-fns` - formatowanie dat (lżejsze niż moment.js)
- `recharts` - zaawansowane wykresy
- `react-hook-form` - formularze
- `zustand` - state management (jeśli useState nie wystarczy)
- `react-pdf` - generowanie PDF
- `react-qr-code` - QR codes

---

**Ostatnia aktualizacja**: 2026-01-25  
**Wersja dokumentu**: 1.0
