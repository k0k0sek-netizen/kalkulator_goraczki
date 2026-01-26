# Kalkulator Gorączki 🌡️💊

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Aplikacja webowa do obliczania dawek leków przeciwgorączkowych (Paracetamol, Ibuprofen) dla dzieci, z funkcją śledzenia historii, wykresem temperatury i wieloma innymi funkcjami.

## 🚀 Live Demo

👉 **[Otwórz aplikację](https://twoja-app.vercel.app)** *(uzupełnij po deploymencie)*

## ✨ Funkcje

### ✅ Aktualnie dostępne (v1.0)
- 💊 **Kalkulator dawek** - automatyczne przeliczanie Paracetamolu i Ibuprofenu na podstawie wagi
- 👶 **Profile dzieci** - zarządzanie wieloma profilami
- 📊 **Wykres temperatury** - wizualizacja przebiegu gorączki
- 📝 **Historia podań** - kompletny dziennik leków i pomiarów
- ⏰ **Licznik czasu** - do następnej możliwej dawki
- 🎨 **Dark mode** - przyjemny dla oczu tryb ciemny
- 📱 **Responsywny design** - działa na telefonie i komputerze
- 💾 **Eksport/Import** - kopia zapasowa danych do JSON
- 🩺 **Raport dla lekarza** - kopiowanie historii do schowka
- ✏️ **Edycja wpisów** - możliwość poprawiania błędów
- 🤖 **Asystent AI** - interfejs gotowy (wymaga API key)

### 🔜 W planach (v2.0+)
Zobacz [TODO.md](./TODO.md) dla pełnej listy planowanych funkcji:
- ⏰ Live timer z odliczaniem
- 📝 Notatki i objawy dodatkowe
- 📊 Rozszerzone statystyki
- 📄 Eksport do PDF
- 🔔 Powiadomienia push
- 📅 Archiwum chorób
- 📱 PWA (instalacja jak aplikacja)
- ...i wiele więcej!

## 🛠️ Technologie

- **React 18** (via CDN + Babel standalone)
- **Tailwind CSS** (via CDN)
- **LocalStorage** - persystencja danych
- **Recharts** - wykresy
- **Gemini AI** (opcjonalnie, wymaga API key)

## 📦 Instalacja lokalna

### Opcja 1: Bezpośrednie otwarcie
```bash
# Sklonuj repozytorium
git clone https://github.com/twoj-username/kalkulator-goraczki.git
cd kalkulator-goraczki

# Otwórz index.html w przeglądarce
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

### Opcja 2: Lokalny serwer
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Następnie otwórz http://localhost:8000

## 🚀 Deployment na Vercel

### Metoda 1: Vercel CLI (zalecana)
```bash
# Instalacja CLI
npm i -g vercel

# Deploy
vercel
```

### Metoda 2: GitHub + Vercel Dashboard
1. Wypushuj kod do GitHub
2. Połącz repo z Vercel na [vercel.com](https://vercel.com)
3. Auto-deploy przy każdym commit!

### Metoda 3: Drag & Drop
Przeciągnij folder na [vercel.com/new](https://vercel.com/new)

## 📖 Jak używać

1. **Utwórz profil dziecka**
   - Podaj imię i wagę
   - Zaznacz "Profil pediatryczny" (dla dzieci <40kg)

2. **Oblicz dawkę**
   - Przejdź do zakładki "Leki"
   - Wybierz stężenie syropu/czopków
   - Kliknij "Zapisz podanie"

3. **Dodaj pomiar temperatury**
   - Na zakładce "Start" kliknij "Dodaj pomiar temperatury"
   - Lub podaj temperaturę przy zapisywaniu leku

4. **Monitoruj historię**
   - Zakładka "Historia" - pełna lista podań
   - Możliwość edycji i usuwania wpisów

5. **Eksportuj raport**
   - "Historia" → "Kopiuj raport dla lekarza"
   - Lub "Profil" → "Eksportuj dane" (JSON)

## 🔐 Prywatność i bezpieczeństwo

- ✅ **100% offline** - dane przechowywane tylko lokalnie (LocalStorage)
- ✅ **Zero trackingu** - brak analytics, cookies, itp.
- ✅ **Open source** - kod jawny, audytowalny
- ⚠️ **Nie zastępuje lekarza** - to narzędzie pomocnicze, nie porada medyczna

## 📝 Licencja

MIT License - możesz swobodnie używać, modyfikować i dystrybuować.

## 🤝 Wkład

Pull requesty mile widziane! Dla większych zmian, otwórz issue.

1. Fork projektu
2. Utwórz branch (`git checkout -b feature/amazing-feature`)
3. Commit zmian (`git commit -m 'Add amazing feature'`)
4. Push do brancha (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## 📞 Kontakt

Masz pytania lub sugestie? Otwórz [issue](https://github.com/twoj-username/kalkulator-goraczki/issues)!

## ⚠️ Disclaimer

**To narzędzie ma charakter edukacyjny i pomocniczy. Nie zastępuje konsultacji medycznej. Zawsze kon sultuj się z lekarzem przy podawaniu leków dziecku.**

Opracowano na podstawie:
- "Rekomendacji postępowania w pozaszpitalnych zakażeniach układu oddechowego" (2016)
- Charakterystyk produktów leczniczych
- Ogólnie dostępnych wytycznych pediatrycznych

---

**Zbudowano z ❤️ dla rodziców**
