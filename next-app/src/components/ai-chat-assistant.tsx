'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, X, Send, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';
import { askGeminiAction } from '@/actions/gemini';
import { ModalPortal } from '@/components/ui/modal-portal';

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

// Simple Rule-Based Logic (Offline AI)
const getBotResponse = (input: string, profile?: Profile): string | null => {
    const lower = input.toLowerCase();

    if (lower.includes('zwymiotował') || lower.includes('wymiot')) {
        return `Jeśli dziecko zwymiotowało lek do 15 minut od podania, zazwyczaj podaje się dawkę ponownie. Jeśli minęło więcej czasu (np. 30-40 min), lek mógł się już wchłonąć. Obserwuj temperaturę i nie podawaj od razu pełnej dawki bez pewności.`;
    }

    if (lower.includes('nie spada') || lower.includes('nadal gorączka') || lower.includes('wysoka')) {
        return `Jeśli podałeś lek i gorączka nie spada po 1 godzinie, możesz rozważyć podanie leku z innej grupy (np. jeśli był Paracetamol, to teraz Ibuprofen). Pamiętaj o zachowaniu odstępów między tymi samymi lekami (4h Paracetamol, 6h Ibuprofen).`;
    }

    if (lower.includes('ile') && lower.includes('dawka')) {
        if (profile) return `Dla wagi ${profile.weight}kg, kalkulator automatycznie wylicza bezpieczną dawkę na karcie leku. Sprawdź zakładkę Kalkulator.`;
        return 'Dawkę wyliczamy na podstawie wagi dziecka. Wpisz wagę w profilu, a kalkulator poda dokładną ilość.';
    }

    if (lower.includes('lekarz') || lower.includes('szpital') || lower.includes('pogotowie')) {
        return 'Skontaktuj się z lekarzem, jeśli: gorączka trwa >3 dni, dziecko ma drgawki, wybroczyny, sztywność karku, problemy z oddychaniem lub jest odwodnione. Aplikacja nie zastępuje porady lekarskiej!';
    }

    if (lower.includes('drgawk')) {
        return 'Przy drgawkach gorączkowych: Połóż dziecko w bezpiecznej pozycji na boku. Nie wkładaj nic do buzi. Poluzuj ubranie. Jeśli trwają >5 min, wezwij pogotowie (112).';
    }

    if (lower.includes('łączyć') || lower.includes('razem')) {
        return 'Możesz stosować tzw. naprzemienne podawanie leków (Paracetamol i Ibuprofen), ale zachowaj odstępy! Między tym samym lekiem (np. Ibuprofen-Ibuprofen) musi być 6h przerwy. Między różnymi (Paracetamol-Ibuprofen) zazwyczaj 3-4h. Nigdy nie podawaj ich naraz, chyba że lekarz zalecił inaczej.';
    }

    // Return null to trigger Gemini
    return null;
};

export function AiChatAssistant({ isOpen, onClose, activeProfile }: AiChatAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', text: 'Cześć! Jestem Twoim wirtualnym asystentem. Działam w trybie hybrydowym: najpierw sprawdzam bazę offline, a jeśli trzeba - pytam chmurę AI (wymaga internetu).' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        "Dziecko zwymiotowało lek",
        "Gorączka nie spada",
        "Kiedy do lekarza?",
        "Co na drgawki?",
        "Czy mogę łączyć leki?"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // 1. Try Offline Logic
        const offlineResponse = getBotResponse(text, activeProfile);

        if (offlineResponse) {
            setTimeout(() => {
                const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: offlineResponse };
                setMessages(prev => [...prev, botMsg]);
            }, 500);
            return;
        }

        // 2. Try Gemini (Online)
        setIsLoading(true);
        const context = activeProfile ? `Dziecko: ${activeProfile.name}, waga: ${activeProfile.weight}kg` : '';

        try {
            const result = await askGeminiAction(text, context);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: result.success ? result.message : `(Offline) ${result.message}`
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (e) {
            setMessages(prev => [...prev, { id: 'err', role: 'assistant', text: 'Błąd połączenia z serwerem AI.' }]);
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
                            <Card className="flex-1 flex flex-col border-emerald-500/30 bg-slate-900 shadow-2xl">
                                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-800">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-emerald-400" />
                                        Dr. AI (Beta)
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={onClose}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
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
                                </CardContent>

                                {/* Suggestions */}
                                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
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
                                        className="flex w-full gap-2"
                                        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                                    >
                                        <Input
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            placeholder="Napisz pytanie..."
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
