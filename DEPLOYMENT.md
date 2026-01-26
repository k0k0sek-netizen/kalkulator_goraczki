# 🚀 Instrukcja Szybkiego Startu - Deploy na Vercel

## ✅ Status przygotowania
- [x] `index.html` - główny plik aplikacji
- [x] `vercel.json` - konfiguracja deploymentu
- [x] `README.md` - dokumentacja projektu
- [x] `.gitignore` - ignorowane pliki
- [x] `TODO.md` - plan rozwoju

**Projekt gotowy do deploymentu!** 🎉

---

## 📦 Metoda 1: Vercel CLI (najszybsza)

### Krok 1: Instalacja Vercel CLI
```bash
npm i -g vercel
```

### Krok 2: Deploy
```bash
cd /home/h4q/Dokumenty/PlatformIO/Projects/ProjektyWebowe/kalkulator_goraczki
vercel
```

### Krok 3: Odpowiedz na pytania
- **Setup and deploy?** → `Y`
- **Which scope?** → wybierz swój account
- **Link to existing project?** → `N`
- **Project name?** → `kalkulator-goraczki` (lub dowolna nazwa)
- **Directory?** → `.` (enter)
- **Override settings?** → `N`

✨ **Gotowe!** Otrzymasz link typu: `https://kalkulator-goraczki-abc123.vercel.app`

---

## 📦 Metoda 2: GitHub + Vercel Dashboard (automatyczny CI/CD)

### Krok 1: Utwórz repo GitHub
```bash
cd /home/h4q/Dokumenty/PlatformIO/Projects/ProjektyWebowe/kalkulator_goraczki

# Inicjalizuj Git (jeśli jeszcze nie jest)
git init
git add .
git commit -m "Initial commit - Kalkulator Gorączki v1.0"

# Dodaj remote (zamień username/repo)
git remote add origin https://github.com/username/kalkulator-goraczki.git
git branch -M main
git push -u origin main
```

### Krok 2: Połącz z Vercel
1. Wejdź na [vercel.com](https://vercel.com)
2. Zaloguj się przez GitHub
3. Kliknij **"Add New Project"**
4. Wybierz repository `kalkulator-goraczki`
5. Kliknij **"Deploy"**

### Krok 3: Auto-deploy
Od teraz każdy `git push` automatycznie zdeployuje nową wersję! 🚀

---

## 📦 Metoda 3: Drag & Drop (najprostsza)

1. Wejdź na [vercel.com/new](https://vercel.com/new)
2. Przeciągnij folder `kalkulator_goraczki` do okna przeglądarki
3. Gotowe!

---

## 🔧 Co dalej?

### Po pierwszym deploymencie:

1. **Zaktualizuj README.md**
   ```bash
   # Zamień w README.md:
   # https://twoja-app.vercel.app
   # na rzeczywisty link otrzymany od Vercel
   ```

2. **Dodaj custom domenę** (opcjonalnie)
   - Vercel Dashboard → Settings → Domains
   - Dodaj np. `goraczka.pl`

3. **Włącz HTTPS** (automatyczne przez Vercel)
   - Certyfikat SSL jest darmowy i automatyczny

4. **Zacznij dodawać funkcje z TODO.md!**
   - Polecam zacząć od **Live Timer** (30 min pracy)

---

## 💡 Przydatne komendy

```bash
# Deploy produkcyjny
vercel --prod

# Preview deployment (test przed publikacją)
vercel

# Zobacz logi
vercel logs

# Lista projektów
vercel ls

# Usuń projekt
vercel remove kalkulator-goraczki
```

---

## 🐛 Troubleshooting

### Problem: "Error: No index.html found"
**Rozwiązanie**: Upewnij się, że plik nazywa się dokładnie `index.html` (małe litery)

### Problem: "Build failed"
**Rozwiązanie**: To statyczna strona HTML - build nie jest wymagany. Sprawdź czy `vercel.json` nie ma błędu składni.

### Problem: Aplikacja nie działa (biały ekran)
**Rozwiązanie**: 
1. Otwórz DevTools (F12) → Console
2. Sprawdź czy są błędy
3. Najczęściej problem z CDN (Tailwind/React/Babel)

### Problem: LocalStorage nie działa
**Rozwiązanie**: HTTPS musi być włączone (Vercel robi to automatycznie)

---

## 📊 Po deploymencie

Twoja aplikacja będzie dostępna:
- **Production**: `https://nazwa-projektu.vercel.app`
- **Wszystkie regiony**: Vercel CDN automatycznie dystrybuuje na cały świat
- **Automatyczne**: Certificates SSL, compression, cache

**Performance**:
- ⚡ Edge Network (CDN)
- 🗜️ Automatic compression
- 🔒 HTTPS everywhere
- 📱 100/100 Lighthouse score (prawdopodobne)

---

## 🎯 Next Steps

1. ✅ Deploy aplikacji
2. ✅ Test na telefonie (otwórz link)
3. ✅ Prześlij link znajomym/rodzinie do testów
4. 🔜 Zacznij implementować funkcje z `TODO.md`

**Sugerowany pierwszy feature**: Live Timer (patrz TODO.md → Priorytet 1, pkt 1)

---

Powodzenia! 🚀

---

**Pytania?** Otwórz issue na GitHub lub napisz!
