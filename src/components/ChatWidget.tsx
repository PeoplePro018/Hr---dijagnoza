import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Bot
} from 'lucide-react';
import { ClientSubmission } from '../types';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface ChatWidgetProps {
  currentResult?: ClientSubmission | null;
}

export function ChatWidget({ currentResult }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting tailored to company if result is available
  const getInitialGreeting = (): Message => {
    let greetingText = 'Dobar dan! Ja sam **Dragana Stanimirović**, osnivač agencije **People Pro** i Vaš lični HR konsultant sa srcem.\n\n';

    if (currentResult) {
      greetingText += `Vidim da ste pregledali HR Dijagnozu za kompaniju **${currentResult.companyInfo.companyName}** (Ukupan HR indeks: **${currentResult.scores.overallScore}%**).\n\n`;
      if (currentResult.scores.redPoints.length > 0) {
        greetingText += `Identifikovali smo **${currentResult.scores.redPoints.length} crvene tačke** (${currentResult.scores.redPoints.map(r => r.categoryTitle).join(', ')}).\n\nKako Vam mogu pomoći da postavimo prioritete i rešimo ove izazove?`;
      } else {
        greetingText += `Vaša organizacija ima odlične rezultate bez kritičnih crvenih tačaka! Želite li savet kako da očuvate ove standarde ili unapredite napredne prakse?`;
      }
    } else {
      greetingText += 'Tu sam da Vam pomognem oko svih HR pitanja – od tumačenja pitanja iz upitnika, preko rešavanja fluktuacije i uvođenja KPI-eva, do izbora idealnog People Pro paketa saradnje (START, CORE, GROW).\n\nKako Vam mogu pomoći danas?';
    }

    return {
      id: 'msg-init',
      role: 'assistant',
      content: greetingText,
      timestamp: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const [messages, setMessages] = useState<Message[]>([getInitialGreeting()]);

  // When currentResult changes, optionally add an update message if chat is empty or fresh
  useEffect(() => {
    if (messages.length === 1 && currentResult) {
      setMessages([getInitialGreeting()]);
    }
  }, [currentResult?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build client context if available
      const clientContext = currentResult ? {
        companyName: currentResult.companyInfo.companyName,
        industry: currentResult.companyInfo.industry,
        employeeCount: currentResult.companyInfo.employeeCount,
        overallScore: currentResult.scores.overallScore,
        redPointsCount: currentResult.scores.redPoints.length,
        redPoints: currentResult.scores.redPoints.map(rp => ({
          categoryTitle: rp.categoryTitle,
          dangerImpact: rp.dangerImpact,
          recommendedAction: rp.recommendedAction
        }))
      } : undefined;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
          })),
          clientContext
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Hvala Vam na pitanju. Molim Vas kontaktirajte me na dragana.peoplepro@gmail.com.',
        timestamp: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: 'Trenutno je došlo do privremenog zastoja u konekciji. Ipak, uvek me možete direktno kontaktirati putem telefona **+381 60 131 72 82** ili na email **dragana.peoplepro@gmail.com**.',
        timestamp: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([getInitialGreeting()]);
  };

  const quickChips = currentResult?.scores.redPoints.length
    ? [
        `Objasni mi ${currentResult.scores.redPoints[0]?.categoryTitle}`,
        'Kako uvesti KPI bez otpora zaposlenih?',
        'Koji People Pro paket nam preporučujete?',
        'Kako smanjiti fluktuaciju u našem sektoru?'
      ]
    : [
        'Kako se tumače rezultati HR dijagnoze?',
        'Koji People Pro paket je najbolji za nas?',
        'Kako rešiti visoku fluktuaciju?',
        'Zašto nam treba onboarding sistem?'
      ];

  // Helper to format simple markdown-like asterisks for bolding
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating launcher trigger button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
        {/* The Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-2xl transition-all duration-300 font-bold text-sm ${
            isOpen
              ? 'bg-slate-800 text-white hover:bg-slate-900 rotate-0'
              : 'bg-gradient-to-r from-[#2761ff] to-[#1a4cd2] text-white hover:shadow-blue-500/30 hover:scale-105'
          }`}
          aria-label="AI HR Konsultant Dragana"
        >
          {isOpen ? (
            <>
              <ChevronDown className="w-5 h-5" />
              <span>Zatvori chat</span>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-white text-[#2761ff] flex items-center justify-center font-black text-xs shadow">
                  DS
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#2761ff] rounded-full"></span>
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-xs font-black">AI HR Konsultant</p>
                <p className="text-[10px] text-blue-100 font-normal">Dragana Stanimirović</p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[420px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-7rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 print:hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2761ff] via-[#1e52e0] to-[#123db3] text-white p-4 shrink-0 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm p-0.5 border-2 border-white/40 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-white text-[#2761ff] rounded-full flex items-center justify-center font-black text-sm">
                    DS
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#2761ff] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">Dragana Stanimirović</h3>
                  <span className="bg-blue-400/30 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-300/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    AI People Pro
                  </span>
                </div>
                <p className="text-blue-100 text-[11px] leading-tight flex items-center gap-1">
                  <span>Virtualni HR Konsultant</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-medium">Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restartuj razgovor"
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Smanji prozor"
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Diagnostic Context Pill (if result exists) */}
          {currentResult && (
            <div className="bg-slate-50 border-b border-slate-200/80 px-3.5 py-2 text-[11px] text-slate-600 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-slate-800 truncate">
                  🏢 {currentResult.companyInfo.companyName}
                </span>
                <span className="text-slate-400">|</span>
                <span className="font-semibold text-[#2761ff]">
                  Skor: {currentResult.scores.overallScore}%
                </span>
              </div>
              {currentResult.scores.redPoints.length > 0 ? (
                <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200 text-[10px] flex items-center gap-1 shrink-0">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  {currentResult.scores.redPoints.length} crvene tačke
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Odličan status
                </span>
              )}
            </div>
          )}

          {/* Chat Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white">
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';
              return (
                <div
                  key={message.id}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-[#2761ff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-sm">
                      DS
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                      isAssistant
                        ? 'bg-white text-slate-700 border border-slate-200/90 rounded-tl-sm'
                        : 'bg-[#2761ff] text-white rounded-tr-sm shadow-blue-500/10'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-1.5">
                      {message.content.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.startsWith('* ') || paragraph.startsWith('- ')
                            ? formatText(paragraph)
                            : formatText(paragraph)}
                        </p>
                      ))}
                    </div>

                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                        isAssistant ? 'text-slate-400' : 'text-blue-100'
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#2761ff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">
                  DS
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                  <span>Dragana razmišlja i analizira</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#2761ff] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#2761ff] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#2761ff] rounded-full animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts suggestions */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-[#2761ff] text-slate-700 rounded-full transition-colors border border-slate-200/60 disabled:opacity-50 shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Quick direct contact bar */}
          <div className="px-3 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
            <span className="font-semibold text-slate-700">Lični kontakt Dragane:</span>
            <div className="flex items-center gap-2 font-medium">
              <a
                href="tel:+381601317282"
                className="text-[#2761ff] hover:underline flex items-center gap-0.5"
              >
                <Phone className="w-3 h-3" />
                060/131-7282
              </a>
              <span>•</span>
              <a
                href="mailto:dragana.peoplepro@gmail.com"
                className="text-[#2761ff] hover:underline flex items-center gap-0.5"
              >
                <Mail className="w-3 h-3" />
                Email
              </a>
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Postavite pitanje Dragani o HR izazovima..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2761ff]/40 focus:border-[#2761ff] transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#2761ff] hover:bg-[#1a4cd2] text-white p-2.5 rounded-xl disabled:opacity-40 disabled:hover:bg-[#2761ff] transition-colors shadow-sm"
                title="Pošalji poruku"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-[9px] text-slate-400">
                Pritisnite Enter za slanje
              </span>
              <span className="text-[9px] text-slate-400 flex items-center gap-1">
                Powered by Gemini • People Pro
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
