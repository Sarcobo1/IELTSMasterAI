"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Mic, Image as ImageIcon, X, Bot, User, Sparkles, CheckCircle2, Wand2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Types ---
interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

type AiResponse =
  | { type: 'grammar'; corrections: Correction[]; final_corrected_text: string; }
  | { type: 'chat'; message: string; }
  | { type: 'audio'; transcription: string; corrections: Correction[]; final_corrected_text: string; }
  | { type: 'image'; extracted_text: string; solution: string; };

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  content: string | AiResponse;
  filePreview?: string;
  fileType?: 'audio' | 'image';
  additionalText?: string;
}

export default function GrammarTutorPage() {
  // --- States ---
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'chat' | 'audio' | 'image'>('chat');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | undefined>(undefined);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const messageIdCounter = useRef(0);

  // --- Helpers & Logic ---
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    // Bitta ID boshqa bilan ustma-ust tushmasligi uchun vaqt va counter ishlatiladi
    return Date.now() * 1000 + messageIdCounter.current;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // AuthContext ham ishlatadi: 'authToken'
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
      const count = parseInt(localStorage.getItem('questionCount') || '0', 10);
      setQuestionCount(count);
      
      const stored = localStorage.getItem('chatMessages');
      if (stored) {
        try {
          const loaded = JSON.parse(stored);
          if (Array.isArray(loaded)) {
             // Saqlangan xabarlarni yuklashda ID ni qayta generatsiya qilish xato kelishining oldini oladi
             setMessages(loaded.map((msg: any) => ({ 
                 ...msg, 
                 id: generateMessageId(), // Har biriga yangi unikal ID berish
             })));
          }
        } catch (e) {
           console.error("Failed to load messages from storage:", e);
           localStorage.removeItem('chatMessages');
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    messageIdCounter.current = 0;
  };

  const handleFileSelect = (file: File, fileMode: 'audio' | 'image') => {
    if (!file) return;
    setSelectedFile(file);
    setMode(fileMode);
    
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);

    const url = fileMode === 'image' && file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setFilePreviewUrl(url);
    setInputText('');
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text && !selectedFile) return;

    const currentFile = selectedFile;
    const currentPreview = filePreviewUrl;
    const currentText = text;
    const currentMode = mode;

    // ✅ TUZATILDI: UserMessage obyektini to'g'ri turda yaratish
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      sender: 'user',
      content: currentText || (currentFile ? 'Fayl yuklandi' : ''),
      filePreview: currentPreview,
      ...(currentFile && (currentMode === 'audio' || currentMode === 'image') ? { fileType: currentMode as 'audio' | 'image' } : {}),
      additionalText: currentText,
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      localStorage.setItem('chatMessages', JSON.stringify(updated));
      return updated;
    });

    // --- LOGIC: Bepul savollar limitini tekshirish ---
    if (currentMode === 'chat' && !isLoggedIn && questionCount >= 5) {
        // Tizimga kirish talab qilinishi haqida xabar qo'shamiz
        const limitMessage: ChatMessage = { 
            id: generateMessageId(), 
            sender: 'ai', 
            content: { type: 'chat', message: "🚨 Uzr, bepul savollar limiti tugadi. Davom etish uchun iltimos tizimga kiring. Siz hozir avtomatik ravishda Login sahifasiga yo'naltirilasiz." } 
        };

        setMessages(prev => {
            const updated = [...prev, limitMessage];
            localStorage.setItem('chatMessages', JSON.stringify(updated));
            return updated;
        });
        
        // Bir oz kutish (vizual effekt uchun)
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        router.push('/sign-in');
        return; // Davom etishni to'xtatadi
    }
    // --- LOGIC END ---

    setIsLoading(true);
    setInputText('');
    setSelectedFile(null);
    setFilePreviewUrl(undefined); 

    try {
      let response;
      if (currentFile) {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('mode', currentMode);
        if (currentText) formData.append('userText', currentText);
        response = await fetch('/api/grammar', { method: 'POST', body: formData });
      } else {
        response = await fetch('/api/grammar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userText: currentText, mode: 'chat' }),
        });
      }

      if (!response.ok) throw new Error(await response.text());

      if (!currentFile) {
        // --- STREAMING LOGIC ---
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream Error");
        
        const aiId = generateMessageId();
        
        // Initial empty message (ChatMessage turi bilan to'g'ri yaratilgan)
        const initialAiMsg: ChatMessage = { 
            id: aiId, 
            sender: 'ai', 
            content: { type: 'chat', message: '' } as AiResponse // Type assertion is safe here
        };
        
        setMessages(prev => [...prev, initialAiMsg]);
        
        const decoder = new TextDecoder();
        let fullText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          
          setMessages(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(m => m.id === aiId);
            if (idx !== -1) {
                // Yangilanayotgan xabar content'ini o'zgartirish
                const updatedContent: AiResponse = { type: 'chat', message: fullText };
                updated[idx] = { 
                    ...updated[idx], 
                    content: updatedContent 
                } as ChatMessage; // Type assertion
            }
            return updated;
          });
        }
        
        setMessages(prev => { 
            localStorage.setItem('chatMessages', JSON.stringify(prev)); 
            return prev; 
        });

      } else {
        // --- NON-STREAMING (FILE) LOGIC ---
        const data = await response.json();
        
        setMessages(prev => {
            // ✅ TUZATILDI: Type-safe object creation
            const newAiMessage: ChatMessage = { 
                id: generateMessageId(), 
                sender: 'ai', 
                content: data as AiResponse 
            };
            
            const updated = [...prev, newAiMessage];
            localStorage.setItem('chatMessages', JSON.stringify(updated));
            return updated;
        });
      }
      
      // Savollar sonini yangilash
      if (currentMode === 'chat' && !isLoggedIn) {
         setQuestionCount(p => { 
             const newVal = p + 1;
             localStorage.setItem('questionCount', newVal.toString()); 
             return newVal; 
         });
      }

    } catch (err: any) {
      console.error("Sending message failed:", err);
      setError(err.message || 'Server xatosi');
      
      setMessages(prev => {
          // ✅ TUZATILDI: Type-safe object creation for Error
          const errorMessage: ChatMessage = { 
              id: generateMessageId(), 
              sender: 'ai', 
              content: { type: 'chat', message: `⚠️ Xato yuz berdi: ${err.message || 'Server xatosi'}. Iltimos, qayta urinib ko'ring.` } as AiResponse
          };
          
          const updated = [...prev, errorMessage];
          localStorage.setItem('chatMessages', JSON.stringify(updated));
          return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI Components ---
  // (Qolgan UI qismlari avvalgidek qoladi)

  const CorrectionCard = ({ corr }: { corr: Correction }) => (
    <div className="bg-white/50 backdrop-blur-sm border border-rose-100 rounded-xl overflow-hidden mb-3 hover:shadow-md transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row border-b border-rose-50">
        <div className="flex-1 p-3 bg-rose-50/50 text-rose-700 font-medium line-through decoration-rose-400 decoration-2 flex items-center gap-2">
           <X className="w-4 h-4 text-rose-400 shrink-0" /> {corr.original}
        </div>
        <div className="flex-1 p-3 bg-emerald-50/50 text-emerald-700 font-bold flex items-center gap-2">
           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {corr.corrected}
        </div>
      </div>
      <div className="p-3 text-sm text-slate-600 bg-white/40 flex gap-2">
         <span className="mt-0.5">💡</span>
         <span>{corr.explanation}</span>
      </div>
    </div>
  );

  const renderContent = (msg: ChatMessage) => {
    if (msg.sender === 'user') {
      return (
        <div className="text-white space-y-2">
          {msg.fileType === 'image' && msg.filePreview && (
            <div className="rounded-xl overflow-hidden border-2 border-white/20 shadow-lg mb-2 bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={msg.filePreview} alt="User Upload" className="max-w-[240px] max-h-60 object-cover" />
            </div>
          )}
          {msg.fileType === 'audio' && (
             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-sm font-medium">
                <Mic className="w-4 h-4 animate-pulse" /> Audio xabar
             </div>
          )}
          {typeof msg.content === 'string' && msg.content && (
             <p className="text-[15px] leading-relaxed tracking-wide font-medium">{msg.content}</p>
          )}
        </div>
      );
    }

    // AI CONTENT
    if (typeof msg.content === 'string') {
        return <p className="text-slate-800 text-[15px] leading-7 whitespace-pre-wrap">{msg.content}</p>;
    }
    
    const data = msg.content as AiResponse;

    switch (data.type) {
      case 'chat':
        return <p className="text-slate-800 text-[15px] leading-7 whitespace-pre-wrap">{data.message}</p>;
      
      case 'grammar':
      case 'audio':
        return (
          <div className="space-y-4 w-full min-w-[280px]">
            {data.type === 'audio' && data.transcription && (
               <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                  <span className="font-bold text-slate-400 block text-xs uppercase mb-1">Transkripsiya</span>
                  "{data.transcription}"
               </div>
            )}
            
            <div className="space-y-1">
               {data.corrections?.length > 0 ? (
                 <>
                   <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">
                      <Wand2 className="w-3 h-3" /> Tuzatishlar
                   </div>
                   {data.corrections.map((c, i) => <CorrectionCard key={i} corr={c} />)}
                 </>
               ) : (
                 <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 text-emerald-700">
                    <Sparkles className="w-5 h-5 fill-emerald-200" />
                    <span className="font-semibold">Mukammal! Xatolar topilmadi.</span>
                 </div>
               )}
            </div>

            <div className="relative group">
               <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
               <div className="relative bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                  <p className="text-xs text-indigo-500 font-bold mb-1 uppercase tracking-wider">To'g'ri variant</p>
                  <p className="text-slate-900 font-medium text-lg leading-relaxed">{data.final_corrected_text}</p>
               </div>
            </div>
          </div>
        );

      case 'image':
         return (
            <div className="space-y-4">
               <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                  <span className="font-bold text-slate-400 block text-xs uppercase mb-1">Aniqlangan matn</span>
                  {data.extracted_text}
               </div>
               <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-500 block text-xs uppercase mb-2">Javob / Yechim</span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{data.solution}</p>
               </div>
            </div>
         )
         
      default:
         return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] animate-blob"></div>
         <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-cyan-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
         <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      </div>

      {/* --- HEADER --- */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/50 sticky top-0">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">AI Assistant</h1>
              <div className="flex items-center gap-1.5 mt-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="text-xs font-medium text-slate-500">Online</span>
              </div>
           </div>
        </div>

        {messages.length > 0 && (
           <Button variant="ghost" size="icon" onClick={clearChatHistory} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <Trash2 className="w-5 h-5" />
           </Button>
        )}
      </header>

      {/* --- CHAT AREA --- */}
      <div className="relative z-0 flex-grow overflow-y-auto p-4 sm:p-6 scroll-smooth">
         <div className="max-w-4xl mx-auto space-y-8 pb-32">
           
           {/* EMPTY STATE */}
           {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in-95 duration-700">
                 <div className="text-center mb-10">
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">Qanday yordam bera olaman?</h2>
                    <p className="text-lg text-slate-500 max-w-lg mx-auto">Ingliz tilini mukammallashtiring, rasmlardan matn o'qing yoki shunchaki suhbatlashing.</p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                    {[
                       { label: "Grammatikani tekshir", sub: "I has a cat -> I have a cat", icon: Wand2, color: "text-purple-600", bg: "bg-purple-50", text: "Please check my grammar: " },
                       { label: "Suhbatlashamiz", sub: "Speaking practice", icon: Bot, color: "text-blue-600", bg: "bg-blue-50", text: "Let's talk about hobbies." },
                       { label: "Rasm yuklash", sub: "Text extraction", icon: ImageIcon, color: "text-rose-600", bg: "bg-rose-50", action: "image" },
                       { label: "Audio tahlil", sub: "Pronunciation check", icon: Mic, color: "text-emerald-600", bg: "bg-emerald-50", action: "audio" },
                    ].map((item, idx) => (
                       <button 
                          key={idx}
                          onClick={() => {
                             if(item.action === 'image') { setMode('image'); imageRef.current?.click(); }
                             else if(item.action === 'audio') { setMode('audio'); audioRef.current?.click(); }
                             else { setInputText(item.text!); setMode('chat'); }
                          }}
                          className="group flex items-center gap-4 p-5 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 text-left"
                       >
                          <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                             <item.icon className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">{item.label}</p>
                             <p className="text-xs text-slate-400">{item.sub}</p>
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           )}

           {/* MESSAGES */}
           {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                 <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* AVATAR */}
                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md
                       ${msg.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white text-indigo-600 border border-indigo-100 rounded-bl-none'}`}>
                       {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>

                    {/* BUBBLE */}
                    <div className={`relative p-5 shadow-lg
                       ${msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-white/90 backdrop-blur text-slate-800 rounded-2xl rounded-tl-sm border border-white/50'}`}>
                       {renderContent(msg)}
                    </div>
                 </div>
              </div>
           ))}

           {/* LOADING STATE */}
           {isLoading && (
              <div className="flex justify-start w-full animate-in fade-in">
                 <div className="flex gap-4 max-w-[80%]">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
                       <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center gap-1.5">
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    </div>
                 </div>
              </div>
           )}

           <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none flex justify-center">
         <div className="w-full max-w-3xl pointer-events-auto">
           
           {/* PREVIEW BADGE */}
           {selectedFile && (
              <div className="flex justify-center mb-4 animate-in slide-in-from-bottom-4">
                 <div className="bg-white border border-indigo-100 pl-2 pr-4 py-2 rounded-full shadow-xl shadow-indigo-900/5 flex items-center gap-3">
                    {filePreviewUrl ? (
                       // eslint-disable-next-line @next/next/no-img-element
                       <img src={filePreviewUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100" />
                    ) : (
                       <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><Mic size={20} /></div>
                    )}
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{mode === 'image' ? 'Rasm' : 'Audio'}</span>
                       <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => { setSelectedFile(null); setFilePreviewUrl(undefined); if(audioRef.current) audioRef.current.value = ''; if(imageRef.current) imageRef.current.value = ''; }} className="ml-2 p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors">
                       <X size={16} />
                    </button>
                 </div>
              </div>
           )}

           {/* INPUT BAR */}
           <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-2xl shadow-indigo-900/10 p-2 flex items-center gap-2 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                 
                 {/* Tools */}
                 <div className="flex items-center gap-1 pl-2">
                    <button onClick={() => { setMode('image'); imageRef.current?.click(); }} className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" title="Upload Image">
                       <ImageIcon size={22} />
                    </button>
                    <button onClick={() => { setMode('audio'); audioRef.current?.click(); }} className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" title="Record Audio">
                       <Mic size={22} />
                    </button>
                 </div>

                 <div className="w-[1px] h-8 bg-slate-200 mx-1"></div>

                 <Input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={mode === 'chat' ? "Ingliz tilida biror narsa yozing..." : "Fayl haqida izoh qoldiring..."}
                    disabled={isLoading}
                    className="flex-grow border-none bg-transparent shadow-none focus-visible:ring-0 text-lg placeholder:text-slate-400 px-2 h-12"
                 />

                 <Button 
                    onClick={sendMessage}
                    disabled={isLoading || (!inputText.trim() && !selectedFile)}
                    className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md 
                       ${isLoading || (!inputText.trim() && !selectedFile) ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110'}`}
                 >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                 </Button>
              </div>
           </div>
           
           <p className="text-center text-[10px] text-slate-400 mt-3 font-medium tracking-wide uppercase">Powered by AI • English Learning Assistant</p>
        </div>
      </div>

      <input 
          ref={audioRef} 
          type="file" 
          accept="audio/*" 
          onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) handleFileSelect(file, 'audio');
             e.target.value = ''; // Reset value to allow re-selection
          }} 
          className="hidden" 
      />
      <input 
          ref={imageRef} 
          type="file" 
          accept="image/*" 
          onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) handleFileSelect(file, 'image');
             e.target.value = ''; // Reset value to allow re-selection
          }} 
          className="hidden" 
      />
      
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}