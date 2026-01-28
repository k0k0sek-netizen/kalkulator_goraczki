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
        // Use specific version content-generation model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

        const systemPrompt = `Jesteś asystentem medycznym w aplikacji "Kalkulator Gorączki".
Twoim celem jest pomaganie rodzicom w dawkowaniu leków, interpretacji objawów (gorączka, wysypka, wymioty) i uspokajaniu.
Bądź konkretny, bezpieczny i zawsze zaznaczaj, że nie jesteś lekarzem.
Kontekst pacjenta (jeśli dostępny): ${context || 'Brak danych'}.
Używaj języka polskiego. Odpowiadaj krótko (max 3 zdania), chyba że pytanie wymaga wyjaśnienia.`;

        const result = await model.generateContent([systemPrompt, prompt]);
        const response = result.response;
        const text = response.text();

        return { success: true, message: text };
    } catch (error) {
        console.error('Gemini Error:', error);
        return { success: false, message: `Błąd połączenia z AI: ${error instanceof Error ? error.message : String(error)}` };
    }
}
