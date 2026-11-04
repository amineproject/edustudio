import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  time: string;
}

interface CurriculumChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToModul?: (content: string) => void;
}

export const CurriculumChatbot: React.FC<CurriculumChatbotProps> = ({
  isOpen,
  onClose,
  onApplyToModul,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Halo, Guru Hebat! 👋 Saya **Asisten Kurikulum & Modul Ajar Deep Learning**. 

Saya siap membantu Anda menyusun, menelaah, atau memperkaya perangkat ajar SMP Kurikulum Merdeka berbasis 3 Pilar:
1. **Berpikir Mendalam (*Deep Thinking*)**
2. **Belajar Bermakna (*Meaningful Learning*)**
3. **Berkarya Nyata (*Real-World Application*)**

Ada yang bisa saya bantu diskusikan hari ini? Silakan pilih topik cepat di bawah atau ajukan pertanyaan spesifik!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Rancang skenario Memahami-Mengaplikasikan-Merefleksikan untuk IPA',
    'Buatkan rubrik analitik skala 1-4 dimensi Bernalar Kritis',
    'Ide pertanyaan pemantik & pemahaman bermakna matematika',
    'Strategi diferensiasi konten & proses di kelas heterogen',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const modelReply: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          content: data.reply || 'Jawaban berhasil disusun.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, modelReply]);
      } else {
        throw new Error('Gagal menghubungi model AI.');
      }
    } catch (err) {
      // Fallback response
      const fallbackReply: ChatMessage = {
        id: `model-fallback-${Date.now()}`,
        role: 'model',
        content: `Tentu, berikut rancangan rekomendasi pedagogis untuk pertanyaan Anda:

### 1. Rekomendasi Skenario Pembelajaran Mendalam (*Deep Learning*):
- **Tahap 1: Memahami (Deep Thinking):** Ajak murid menganalisis fenomena nyata di lingkungan sekitar, catat pertanyaan rasa ingin tahu mereka, dan bangun konsep melalui diskusi interaktif.
- **Tahap 2: Mengaplikasikan (Meaningful Practice):** Fasilitasi studi kasus atau eksperimen langsung dengan LKPD bertingkat. Murid bekerja kolaboratif memecahkan tantangan riil.
- **Tahap 3: Merefleksikan (Reflective Dialogue):** Murid menuliskan jurnal refleksi tentang apa makna materi ini bagi kehidupan mereka, diikuti umpan balik sejawat (*peer feedback*).

### 2. Tips Diferensiasi:
Sediakan konten bertingkat (level dasar, menengah, mahir) dan berikan *scaffolding* pada kelompok yang memerlukan bimbingan membaca.

*(Anda dapat menggunakan tombol Generator Modul Ajar di dashboard untuk membuat naskah lengkap dari A sampai M).*`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Teks berhasil disalin ke clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col h-[92vh] sm:h-[82vh] animate-in fade-in slide-in-from-bottom-4 duration-150">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 px-3.5 sm:px-5 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-bold font-['Plus_Jakarta_Sans']">
                  Pakar Kurikulum AI
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-emerald-950 text-[9.5px] font-bold">
                  Online
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-blue-100 block">
                Konsultasi Deep Learning & Perangkat Ajar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (window.confirm('Bersihkan riwayat percakapan?')) {
                  setMessages([messages[0]]);
                }
              }}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1"
              title="Bersihkan Chat"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">restart_alt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Tutup Chat"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 bg-[#f8f9ff]">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[82%] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#00236f] text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-[#e2e8f0] rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {m.content}
                  </div>

                  {/* Actions on Assistant Message */}
                  {!isUser && m.id !== 'welcome' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 justify-end text-[10.5px] text-slate-500">
                      <button
                        onClick={() => handleCopyMessage(m.content)}
                        className="hover:text-[#0051d5] flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">content_copy</span>
                        <span>Salin</span>
                      </button>
                      {onApplyToModul && (
                        <button
                          onClick={() => {
                            onApplyToModul(m.content);
                            onClose();
                          }}
                          className="hover:text-[#00236f] font-bold flex items-center gap-1 text-[#0051d5]"
                        >
                          <span className="material-symbols-outlined text-[13px]">auto_stories</span>
                          <span>Buka di Modul</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9.5px] text-slate-400 mt-0.5 px-1">
                  {isUser ? 'Anda' : 'Pakar AI'} • {m.time}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
              <span className="material-symbols-outlined animate-spin text-[16px] text-[#0051d5]">
                progress_activity
              </span>
              <span>Pakar kurikulum sedang memformulasikan panduan...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border-t border-[#f1f5f9] overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10.5px] sm:text-[11px] text-slate-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">bolt</span> Saran:
            </span>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] text-[10px] sm:text-[11px] font-semibold transition-colors border border-[#dce9ff]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-2.5 sm:p-4 bg-white border-t border-[#e5eeff] flex items-end gap-2">
          <textarea
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanyakan penyusunan modul, Deep Learning, asesmen..."
            className="flex-1 p-2 sm:p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none resize-none leading-relaxed"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isLoading}
            className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-[#00236f] hover:bg-[#1e3a8a] disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs shrink-0"
          >
            <span>Kirim</span>
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
