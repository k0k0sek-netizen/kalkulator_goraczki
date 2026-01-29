'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function askGeminiAction(prompt: string, context?: string) {
    if (!apiKey) {
        return {
            success: false,
            message: 'Brak konfiguracji AI (GEMINI_API_KEY). Działam w trybie Offline.'
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use Gemini 3 Flash (Preview) as requested
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const systemPrompt = `Jesteś asystentem medycznym w aplikacji "Kalkulator Gorączki".
Twoim celem jest pomaganie rodzicom w dawkowaniu leków, interpretacji objawów (gorączka, wysypka, wymioty) i uspokajaniu.
Bądź konkretny, bezpieczny i zawsze zaznaczaj, że nie jesteś lekarzem.
Kontekst pacjenta (jeśli dostępny): ${context || 'Brak danych'}.
Używaj języka polskiego. 
Jeśli użytkownik poprosi o "Raport" lub "Podsumowanie dla lekarza":
1. Stwórz zwięzłe, chronologiczne podsumowanie na podstawie historii.
2. Wymień podane leki (dawki, godziny) i przebieg gorączki.
3. Formatuj to profesjonalnie, np. "Raport przebiegu gorączki (Pacjent: [Imie])...".
W innych przypadkach odpowiadaj krótko i konkretnie. Zawsze zaznaczaj, że nie jesteś lekarzem.`;

        const result = await model.generateContent([systemPrompt, prompt]);
        const response = result.response;
        const text = response.text();

        return { success: true, message: text };
    } catch (error) {
        console.error('Gemini Error:', error);
        return { success: false, message: `Błąd połączenia z AI: ${error instanceof Error ? error.message : String(error)}` };
    }
}
