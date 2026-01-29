'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, X, Send, User, Loader2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate, generateId } from '@/lib/utils';
import type { Profile, HistoryItem } from '@/types';
import { askGeminiAction } from '@/actions/gemini';
import { ModalPortal } from '@/components/ui/modal-portal';
import { useProfile } from '@/context/profile-context';
import { toast } from 'sonner';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

interface AiChatAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    activeProfile?: Profile;
}

// 1. Critical Logic (Always check first, regardless of connection)
const getCriticalResponse = (input: string): string | null => {
    const lower = input.toLowerCase();
    if (lower.includes('drgawk')) {
        return '🔴 PILNE: Przy drgawkach gorączkowych: Połóż dziecko w bezpiecznej pozycji na boku. Nie wkładaj nic do buzi. Poluzuj ubranie. Jeśli trwają >5 min, wezwij pogotowie (112).';
    }
    return null;
};

// 2. Offline Fallback Logic (Only if AI fails)
const getOfflineFallback = (input: string, profile?: Profile): string | null => {
    const lower = input.toLowerCase();

    if (lower.includes('zwymiotował') || lower.includes('wymiot')) {
        return `(Tryb Offline) 🤮 Jeśli dziecko zwymiotowało lek do 15 minut od podania, zazwyczaj podaje się dawkę ponownie. Jeśli minęło więcej czasu (np. 30-40 min), lek mógł się już wchłonąć.`;
    }

    if (lower.includes('nie spada') || lower.includes('nadal gorączka') || lower.includes('wysoka')) {
        return `(Tryb Offline) 🌡️ Jeśli podałeś lek i gorączka nie spada po 1 godzinie, możesz rozważyć podanie leku z innej grupy (np. Paracetamol ↔ Ibuprofen). Pamiętaj o odstępach!`;
    }

    if (lower.includes('ile') && lower.includes('dawka')) {
        if (profile) return `(Tryb Offline) ⚖️ Dla wagi ${profile.weight}kg sprawdź zakładkę "Kalkulator". Tam masz dokładne wyliczenie.`;
        return '(Tryb Offline) ⚖️ Dawkę wyliczamy na podstawie wagi dziecka. Użyj zakładki "Kalkulator".';
    }

    if (lower.includes('lekarz') || lower.includes('szpital') || lower.includes('pogotowie') || lower.includes('karetk')) {
        return '(Tryb Offline) 🚑 Skontaktuj się z lekarzem, jeśli: gorączka trwa >3 dni, dziecko ma drgawki, wybroczyny, sztywność karku lub problemy z oddychaniem.';
    }

    if (lower.includes('łączyć') || lower.includes('razem')) {
        return '(Tryb Offline) 💊 Możesz stosować metodę naprzemienną (Paracetamol co 4h, Ibuprofen co 6h). Nigdy nie podawaj ich naraz w jednej dawce bez konsultacji.';
    }

    return null;
};

export function AiChatAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { activeProfile, updateProfile } = useProfile();

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', text: 'Cześć! Jestem Twoim wirtualnym asystentem. Możesz do mnie pisać lub mówić (kliknij mikrofon). Spróbuj: "Dodaj temperaturę 38.5"' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null); // Type any for SpeechRecognition
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        "Dziecko zwymiotowało lek",
        "Gorączka nie spada",
        "Kiedy do lekarza?",
        "Co na drgawki?",
        "Czy mogę łączyć leki?",
        "Napisz raport dla lekarza 📝"
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.lang = 'pl-PL';
                recognition.interimResults = false;

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    // Optional: Auto-send if high confidence? Let user confirm for safety.
                    // For "Actions", auto-sending might be better UX if we parse it immediately.
                    // Let's just set Input for now and let user click send OR handle "Command Mode"
                    handleSend(transcript);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                    toast.error('Błąd rozpoznawania mowy: ' + event.error);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error('Twoja przeglądarka nie obsługuje rozpoznawania mowy.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            toast.info('Słucham... 🎙️');
        }
    };

    // Smart Command Parser
    const processCommand = (text: string): boolean => {
        if (!activeProfile) return false;
        const lower = text.toLowerCase();

        // Regex for Temperature: "temp/gorączka 38.5" or "38.5 stopni"
        // Try to capture number (with dot or comma)
        // Context keywords: "dodaj", "zapisz", "mam", "jest", "temperatura", "gorączka"
        // Simplified: if text contains number and "temp" or "gorączk"

        const tempMatch = lower.match(/(?:temp|gorączk|stan|wynik).*?(\d+[.,]?\d*)/i) ||
            lower.match(/(\d+[.,]?\d*).*?(?:stopni|st\.|celcjusza)/i) ||
            (lower.includes('dodaj') && lower.match(/(\d+[.,]?\d*)/)); // "Dodaj 38.5"

        if (tempMatch && tempMatch[1]) {
            const valStr = tempMatch[1].replace(',', '.');
            const val = parseFloat(valStr);

            if (!isNaN(val) && val > 34 && val < 44) {
                // Create Action
                const newItem: HistoryItem = {
                    id: generateId(),
                    timestamp: new Date(),
                    type: 'dose', // Actually 'dose' type handles temps well in this schema? Or purely 'temp'?
                    // Looking at types/index.ts -> HistoryItem can have 'dose' type but also 'temperature' field.
                    // Ideally we should distinguish, but sticking to existing pattern:
                    // The chart uses 'temperature' field. The type 'dose' usually implies drug.
                    // Let's see handleConfirmDose in calculator page.
                    // It sets type: 'dose' even if just temp? 
                    // Actually let's use type 'dose' but with drug 'Pomiar' as seen in Calculator logic?
                    // Dashboard says: drug !== 'Pomiar' ? h.drug : null
                    drug: 'Pomiar',
                    doseMl: 0,
                    doseMg: 0,
                    unit: 'ml', // Dummy
                    temperature: val,
                    hoursInterval: 0,
                    notes: 'Głosowo'
                };

                const updatedHistory = [newItem, ...activeProfile.history];
                updateProfile({ ...activeProfile, history: updatedHistory, updatedAt: new Date() });

                return true; // Command Handled
            }
        }
        return false;
    };


    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // 0. Check for Commands (Voice Actions)
        if (processCommand(text)) {
            // If command processed successfully, add a system confirmation message
            // Wait a bit for UX
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    text: `✅ Zapisałem pomiar: ${text.match(/(\d+[.,]?\d*)/)?.[1]?.replace(',', '.') || ''}°C.`
                }]);
            }, 600);
            return;
        }

        // 1. Critical Check (Immediate)
        const criticalResponse = getCriticalResponse(text);
        if (criticalResponse) {
            setTimeout(() => {
                setMessages(prev => [...prev, { id: 'crit', role: 'assistant', text: criticalResponse }]);
            }, 500);
            return;
        }

        // 2. Try Gemini (Online)
        setIsLoading(true);

        // Prepare History Context
        let historyContext = '';
        if (activeProfile && activeProfile.history.length > 0) {
            // Get full history for accurate analysis
            const recentHistory = [...activeProfile.history]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            historyContext = recentHistory.map(h => {
                const date = formatDate(h.timestamp, { dateStyle: 'short', timeStyle: 'short' });
                const type = h.type === 'dose' ? `Lek: ${h.drug} (${h.doseMl}ml / ${h.doseMg}mg)` : `Pomiar: ${h.temperature}°C`;
                const symptoms = h.symptoms?.length ? `, Objawy: ${h.symptoms.join(', ')}` : '';
                const notes = h.notes ? `, Notatka: ${h.notes}` : '';
                return `- [${date}] ${type}${symptoms}${notes}`;
            }).join('\n');
        }

        const context = activeProfile
            ? `Pacjent: ${activeProfile.name}, Waga: ${activeProfile.weight}kg.\n\nOstatnia historia choroby (od najnowszych):\n${historyContext || 'Brak wpisów.'}`
            : '';

        try {
            const result = await askGeminiAction(text, context);
            if (!result.success) throw new Error(result.message);

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: result.message
            }]);
        } catch (e) {
            // 3. Smart Offline Fallback
            console.warn('AI Unavailable, trying offline fallback:', e);
            const fallbackMsg = getOfflineFallback(text, activeProfile);

            if (fallbackMsg) {
                setMessages(prev => [...prev, {
                    id: 'doc',
                    role: 'assistant',
                    text: fallbackMsg
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: 'err',
                    role: 'assistant',
                    text: '📶 Brak połączenia z AI. Nie znalazłem też odpowiedzi w bazie offline. Spróbuj zapytać inaczej lub sprawdź połączenie.'
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalPortal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-transparent flex flex-col h-[80dvh] max-h-[600px]"
                        >
                            <Card className="flex-1 flex flex-col border-emerald-500/30 bg-slate-900 shadow-2xl overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-800">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-emerald-400" />
                                        Dr. AI (Beta)
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={onClose}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
                                    {messages.map(m => (
                                        <div key={m.id} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                                m.role === 'user'
                                                    ? "bg-emerald-600 text-white rounded-br-none"
                                                    : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                                            )}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-2 border border-slate-700 flex items-center gap-2 text-slate-400 text-sm">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Myślę...</span>
                                            </div>
                                        </div>
                                    )}
                                    {isListening && (
                                        <div className="flex justify-start">
                                            <div className="bg-emerald-500/10 rounded-2xl rounded-bl-none px-4 py-2 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-sm animate-pulse">
                                                <Mic className="h-4 w-4" />
                                                <span>Słucham...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </CardContent>

                                {/* Suggestions */}
                                <div className="px-4 flex gap-2 overflow-x-auto custom-scrollbar pb-3">
                                    {suggestions.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleSend(s)}
                                            className="whitespace-nowrap px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                <CardFooter className="p-3 bg-slate-950/30 border-t border-slate-800">
                                    <form
                                        className="flex w-full gap-2 items-center"
                                        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                                    >
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className={cn("text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all", isListening && "text-red-500 hover:text-red-400 bg-red-500/10 animate-pulse")}
                                            onClick={toggleListening}
                                        >
                                            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                        </Button>
                                        <Input
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            placeholder={isListening ? "Mów teraz..." : "Dodaj temp. lub zapytaj..."}
                                            className="bg-slate-900 border-slate-700 focus:ring-emerald-500"
                                        />
                                        <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ModalPortal>
    );
}
