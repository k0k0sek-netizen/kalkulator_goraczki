# Kalkulator Gorączki - Asystent Rodzica (2026 Edition)

Nowoczesna aplikacja webowa (PWA) wspierająca rodziców w bezpiecznym dawkowaniu leków przeciwgorączkowych (Paracetamol, Ibuprofen, Pyralgina) i monitorowaniu choroby dziecka.

## 🌟 Kluczowe Funkcje

### 💊 Inteligentny Kalkulator
- **Precyzyjne dawkowanie**: Wylicza bezpieczną ilość leku (ml/mg/tabletki) na podstawie wagi dziecka.
- **Baza leków offline**: Zawiera popularne syropy i czopki (Pedicetamol, Nurofen, Ibum, Panadol, Pyralgin).
- **Bezpieczeństwo**: Ostrzega przed przedawkowaniem dobowym i zbyt częstym podawaniem.

### 🤖 Asystent Dr. AI (Gemini 3 Flash)
- **Komunikacja głosowa/tekstowa**: Odpowiada na pytania o objawy, dawkowanie i postępowanie (np. "Co na wymioty?", "Kiedy do szpitala?").
- **Tryb Hybrydowy**: Działa offline (baza reguł) oraz online (Google Gemini 3 Flash) dla bardziej złożonych zapytań.
- **Kontekst Pacjenta**: AI zna imię i wagę dziecka, dostosowując odpowiedzi.

### 📊 Interaktywna Karta Gorączki
- **Wykres Termiczny**: Wizualizacja temperatury z gradientem (Zielony → Czerwony >38°C).
- **Historia Choroby**: Zapisywanie pomiarów, podanych dawek i objawów.
- **Nawigacja i Zoom**: Łatwe przeglądanie długiej historii choroby.

### 📲 Ekosystem Mobile & PWA
- **Skaner QR**: Przekazywanie historii choroby między telefonami (np. Tata → Mama) bez logowania.
- **Lokalne Powiadomienia**: Przypomnienia o kolejnej dawce leku.
- **Instalowalna Aplikacja**: Działa jak natywna aplikacja na iOS/Android.

## 🛠️ Technologie

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion (płynne animacje "Liquid UI")
- **AI**: Google Gemini API (model `gemini-3-flash-preview`)
- **Dane**: Dexie.js (IndexedDB) - pełna prywatność, dane tylko w telefonie.
- **PWA**: `@ducanh2912/next-pwa`

## 🚀 Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev
```

Aplikacja dostępna pod `http://localhost:3000`.

## 📦 Budowanie Produkcyjne

```bash
npm run build
npm start
```

## 🔒 Prywatność
Aplikacja działa w modelu **Local-First**. Dane medyczne dzieci są zapisywane wyłącznie w pamięci przeglądarki (IndexedDB) i nie są wysyłane na żaden zewnętrzny serwer (poza zapytaniami do AI, które są anonimizowane).

