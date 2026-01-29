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

        const systemPrompt = `Jesteś zaawansowanym asystentem medycznym w aplikacji "Kalkulator Gorączki".
Twoim celem jest wsparcie rodziców, analiza objawów i sugerowanie prawdopodobnych przyczyn (np. infekcja wirusowa, bakteryjna, ząbkowanie).
ZASADY:
1. Możesz hipotezować na podstawie objawów (np. "Wysoka gorączka bez kataru może sugerować trzydniówkę lub grypę").
2. Używaj języka probabilistycznego ("może wskazywać na", "częsty objaw przy").
3. Nie bój się analizować leków i dawek.
4. ZAWSZE na końcu dodaj (lub miej w stopce) krótkie "To nie jest porada lekarska."
Kontekst pacjenta: ${context || 'Brak danych'}.
Jeśli użytkownik prosi o RAPORT: Stwórz profesjonalne podsumowanie dla lekarza.`;

        const result = await model.generateContent([systemPrompt, prompt]);
        const response = result.response;
        const text = response.text();

        return { success: true, message: text };
    } catch (error) {
        console.error('Gemini Error:', error);
        return { success: false, message: `Błąd połączenia z AI: ${error instanceof Error ? error.message : String(error)}` };
    }
}
