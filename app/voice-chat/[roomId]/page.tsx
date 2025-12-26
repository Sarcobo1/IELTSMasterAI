"use client"

import { useState, useEffect } from 'react';
import { Mic, MicOff, User, Plus, Headset, Crown, Check, X } from 'lucide-react';
// import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParams } from 'next/navigation';

// --- TYPE DEFINITIONS (Ma'lumot turlari) ---
// Har bir ishtirokchi yoki tinglovchi ob'ekti uchun interfeys
interface UserBase {
    id: number | string; // Simulyatsiya uchun string id ham bo'lishi mumkin
    name: string;
}

// Ishtirokchi (Speaker) uchun kengaytirilgan interfeys
interface ParticipantType extends UserBase {
    isHost: boolean;
    isMuted: boolean;
    color: string;
    border: string;
    isEmpty?: boolean; // Bo'sh slotlar uchun
}

// Tinglovchi (Observer) uchun interfeys
interface ObserverType extends UserBase {
    // Qo'shimcha maydonlar (hozircha yo'q)
}
// --- Dastlabki ma'lumotlar (Simulyatsiya uchun) ---

const DEFAULT_COLOR = 'text-slate-600';
const DEFAULT_BORDER = 'border-slate-300';
const TOTAL_SLOTS = 8;

// Ishtirokchilar (Namuna bo'yicha) - ParticipantType turida
const initialParticipants: ParticipantType[] = [
    { id: 1, name: "Sardor", isHost: true, isMuted: false, color: 'text-green-600', border: 'border-green-500' },
    { id: 2, name: "Nigora", isHost: false, isMuted: true, color: 'text-red-600', border: 'border-red-500' },
    { id: 3, name: "Ali", isHost: false, isMuted: false, color: 'text-blue-600', border: 'border-blue-500' },
    { id: 4, name: "Jasur", isHost: false, isMuted: false, color: 'text-blue-600', border: 'border-blue-500' },
];

// Tinglovchilar (ObserverType turida)
const initialObservers: ObserverType[] = [
    { id: 101, name: "Azizbek" },
    { id: 102, name: "Dilnoza" },
    { id: 103, name: "Farhod" },
    { id: 104, name: "Gulnora" },
    { id: 105, name: "Hayot" },
    { id: 106, name: "Iroda" },
    { id: 107, name: "Javohir" },
    { id: 108, name: "Kamola" },
    { id: 109, name: "Lobar" },
    { id: 110, name: "Muhammad" },
    { id: 111, name: "Nodira" },
    { id: 112, name: "Oybek" },
];


// Individual ishtirokchi komponenti
const ParticipantSlot = ({ participant, onClick }: { participant: ParticipantType, onClick?: () => void }) => {
    
    // Bo'sh o'rin uchun chaqiruv tugmasi
    if (participant.isEmpty) {
        return (
            <div 
                className={`bg-white border-2 border-dashed border-slate-300 text-slate-500 rounded-xl p-4 flex flex-col items-center justify-center transition-all aspect-square min-h-32 ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                onClick={onClick || undefined}
            >
                <Plus size={36} />
                <p className="mt-2 text-base font-semibold">Ishtirokchi qo'shish</p>
                <p className="text-sm">Bo'sh O'rin</p>
            </div>
        );
    }

    // Xato tuzatildi: micIcon o'zgaruvchisi o'rniga MicComp (PascalCase) ishlatiladi.
    const MicComp = participant.isMuted ? MicOff : Mic;

    return (
        <div className={`bg-white rounded-xl p-4 flex flex-col items-center justify-center relative transition-all aspect-square 
            border-4 ${participant.border || DEFAULT_BORDER} shadow-md`}>
            
            {participant.isHost && <Crown size={24} className="absolute top-[-8px] left-[-8px] text-amber-500 fill-amber-500" />} 
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 bg-slate-100`}>
                <User size={40} className={`${participant.color || DEFAULT_COLOR}`} />
            </div>
            
            <p className="font-bold text-slate-800 text-base truncate w-full text-center">{participant.name}</p>
            
            <MicComp size={20} className={`mt-1 absolute bottom-2 right-2 ${participant.isMuted ? 'text-red-500' : 'text-green-500'}`} />
        </div>
    );
};

// Tinglovchi komponenti (Qo'shilish tugmasi bilan)
const ObserverItem = ({ observer, onRequestJoin, hasRequested, isCurrentUser }: { 
    observer: ObserverType, 
    onRequestJoin: (o: ObserverType) => void, 
    hasRequested: boolean, 
    isCurrentUser: boolean 
}) => {
    return (
        <div className="flex items-center justify-between bg-white border border-slate-200 text-slate-700 p-2 rounded-lg transition-all shadow-sm">
            <div className="flex items-center">
                <User size={18} className="text-blue-500 mr-2 flex-shrink-0" />
                <span className="font-medium truncate">{observer.name}{isCurrentUser ? " (Siz)" : ""}</span>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRequestJoin(observer)}
                disabled={hasRequested}
                className={`${hasRequested ? 'text-gray-500 border-gray-500' : 'text-green-600 border-green-500 hover:bg-green-50'}`}
            >
                {hasRequested ? "So'rov yuborilgan" : "Qo'shilishni so'rash"}
            </Button>
        </div>
    );
};

export default function VoiceChatPage() {
    const params = useParams();
    const roomId = params.roomId || '1'; // Default to 1 if not dynamic

    // State'larga Turlarni Aniqlash
    const [participants, setParticipants] = useState<ParticipantType[]>(initialParticipants);
    const [observers, setObservers] = useState<ObserverType[]>(initialObservers);
    const [isMutedLocally, setIsMutedLocally] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [joinRequests, setJoinRequests] = useState<ObserverType[]>([]); // Qo'shilish so'rovlari: ObserverType[] turida
    const [requestedIds, setRequestedIds] = useState<Set<number | string>>(new Set()); // Yuborilgan so'rovlarni kuzatish
    const [showSelectModal, setShowSelectModal] = useState(false);

    const currentUser: ObserverType = { id: 999, name: "Men" }; // Simulyatsiya uchun joriy foydalanuvchi
    const isCurrentHost = participants.some(p => p.id === currentUser.id && p.isHost);
    const isCurrentParticipant = participants.some(p => p.id === currentUser.id);
    // Joriy foydalanuvchi Observer listida bo'lishi shart emas, u ya'ni hozirgina qo'shilgan bo'lishi mumkin.
    // const isCurrentObserver = observers.some(o => o.id === currentUser.id); 

    // Joriy foydalanuvchini tinglovchilarga qo'shish (kirganda)
    useEffect(() => {
        if (!isCurrentParticipant) {
            setObservers(prev => {
                if (prev.some(o => o.id === currentUser.id)) {
                    return prev;
                }
                // ObserverType ga mos kelishi uchun...
                return [...prev, currentUser as ObserverType];
            });
        }
    }, [isCurrentParticipant]); // currentUser o'zgarmas, shuning uchun uni dependency listdan olib tashladim.

    // ... (Mikrofonni boshqarish uchun useEffect qismi o'zgarishsiz) ...
    useEffect(() => {
        if (isCurrentParticipant && !isMutedLocally) {
            // Haqiqiy mikrofon ishga tushirilishi
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    setMediaStream(stream);
                })
                .catch(err => {
                    console.error('Mikrofonni yoqishda xato:', err);
                    // alert('Mikrofon ruxsati berilmagan yoki xato yuz berdi.');
                });
        } else {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                setMediaStream(null);
            }
        }

        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isMutedLocally, isCurrentParticipant]);
    
    // ... (Joriy foydalanuvchining muted holatini sinxronlash useEffect qismi o'zgarishsiz) ...

    // Bo'sh joyni bosganda tinglovchilarni tanlash modalini ochish (faqat host uchun)
    const handleOpenSelectModal = () => {
        if (!isCurrentHost) {
            alert("Faqat xona egasi ishtirokchi qo'sha oladi!");
            return;
        }
        if (participants.length >= TOTAL_SLOTS) {
            alert("Ishtirokchilar soni maksimalga yetdi!");
            return;
        }
        setShowSelectModal(true);
    };

    // Tanlangan tinglovchini qo'shish (host uchun)
    const handleInviteSelected = (observer: ObserverType) => {
        const newParticipant: ParticipantType = {
            id: observer.id, 
            name: observer.name, 
            isHost: false, 
            isMuted: false, 
            color: 'text-yellow-600', 
            border: 'border-yellow-500' 
        };

        setParticipants(prev => [...prev, newParticipant]);
        setObservers(prev => prev.filter(o => o.id !== observer.id));
        setShowSelectModal(false);
        
        // So'rovni o'chirish
        setRequestedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(observer.id);
            return newSet;
        });
        setJoinRequests(prev => prev.filter(r => r.id !== observer.id));
        
        alert(`${observer.name} ishtirokchi sifatida qo'shildi!`);
    };

    // Tinglovchi qo'shilishni so'raganda (simulyatsiya)
    const handleRequestJoin = (observer: ObserverType) => {
        setJoinRequests(prev => {
            // ✅ observer: ObserverType deb tur berilgani uchun r.id va observer.id xato bermaydi
            if (prev.some((r) => r.id === observer.id)) {
                alert(`${observer.name} allaqachon so'rov yuborgan!`);
                return prev;
            }
            alert(`${observer.name} qo'shilishni so'radi! Host tasdiqlashi kerak.`);
            return [...prev, observer];
        });
        setRequestedIds(prev => new Set([...prev, observer.id]));
    };

    // Host so'rovni tasdiqlash
    const handleApproveJoin = (observer: ObserverType) => {
        if (participants.length >= TOTAL_SLOTS) {
            alert("Joy yo'q!");
            return;
        }
        
        // Yangi ishtirokchi ob'ektini yaratish
        const newParticipant: ParticipantType = {
            id: observer.id, 
            name: observer.name, 
            isHost: false, 
            isMuted: false, 
            color: 'text-yellow-600', 
            border: 'border-yellow-500' 
        };

        setParticipants(prev => [...prev, newParticipant]);
        setObservers(prev => prev.filter(o => o.id !== observer.id));
        setJoinRequests(prev => prev.filter(o => o.id !== observer.id));
        setRequestedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(observer.id);
            return newSet;
        });
        alert(`${observer.name} tasdiqlandi va qo'shildi!`);
    };

    // Host so'rovni rad etish
    const handleRejectJoin = (observer: ObserverType) => {
        setJoinRequests(prev => prev.filter(o => o.id !== observer.id));
        setRequestedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(observer.id);
            return newSet;
        });
        alert(`${observer.name} so'rovi rad etildi!`);
    };
    
    const toggleMute = () => {
        if (!isCurrentParticipant) return;
        const newMuted = !isMutedLocally;
        setIsMutedLocally(newMuted);

        // Joriy foydalanuvchining muted holatini yangilash
        setParticipants(prev => {
            const newP = [...prev];
            // IDni raqam yoki string sifatida ham ishlash mumkinligini hisobga olamiz
            const index = newP.findIndex(p => p.id === currentUser.id); 
            if (index !== -1) {
                newP[index] = { ...newP[index], isMuted: newMuted }; // Objectni immutable yangilash
            }
            return newP;
        });
    };

    const filledSlots = participants.length;
    const slots = [...participants];

    // Qolgan bo'sh o'rinlarni to'ldirish
    while (slots.length < TOTAL_SLOTS) {
        // ParticipantType ga mos kelishi uchun to'liqroq ob'ekt
        slots.push({ 
            id: `empty-${slots.length + 1}`, 
            name: "Bo'sh O'rin", 
            isMuted: false, 
            isHost: false, 
            isEmpty: true, 
            color: DEFAULT_COLOR, 
            border: DEFAULT_BORDER 
        } as ParticipantType);
    }

    const LeftIcon = isMutedLocally ? MicOff : Mic;
    const statusColor = isMutedLocally ? 'text-red-500' : 'text-green-500';
    const statusText = isMutedLocally ? "Mikrofon o'chiq" : "Mikrofon yoqilgan";

    // --- RENDERING ---
    return (
        <>
            {/* <Navigation />  */}
            
            {/* ... (Divlar va Sarlavhalar o'zgarishsiz) ... */}
            <div className="min-h-screen bg-white py-12 px-4 pt-20 flex flex-col items-start lg:items-center">
                <div className="max-w-7xl mx-auto w-full">
                    
                    {/* Sarlavha Paneli */}
                    <div className='mb-8'>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center">
                            <Mic size={30} className="text-purple-600 mr-2" />
                            IELTS Speaking Xonasi #{roomId}
                        </h1>
                        <span className="text-lg font-medium bg-purple-100 text-purple-600 px-4 py-1.5 rounded-full inline-block">
                            <User size={16} className="inline-block mr-1 align-sub" /> {filledSlots} / {TOTAL_SLOTS} Ishtirokchi
                        </span>
                    </div>
                    
                    {/* Gaplashish joylari (8 ta Slot) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-12">
                        {slots.map((p, index) => (
                            <ParticipantSlot 
                                key={p.id} // key o'rnida index emas, balki .id ishlatilishi yaxshiroq
                                participant={p} 
                                onClick={p.isEmpty && isCurrentHost ? handleOpenSelectModal : undefined} // null o'rniga undefined
                            />
                        ))}
                    </div>

                    {/* Tinglovchilar Ro'yxati */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mt-4 mb-24"> 
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <Headset size={24} className="text-blue-500 mr-2" />
                            Tinglovchilar ({observers.length})
                        </h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2">
                            {observers.map((o) => (
                                <ObserverItem 
                                    key={o.id} 
                                    observer={o} 
                                    onRequestJoin={handleRequestJoin} 
                                    hasRequested={requestedIds.has(o.id)} 
                                    isCurrentUser={o.id === currentUser.id}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Qo'shilish so'rovlari (Host uchun ko'rsatish) */}
                    {isCurrentHost && joinRequests.length > 0 && (
                        <div className="bg-yellow-100 p-4 rounded-xl mb-4">
                            <h3 className="font-bold mb-2">Qo'shilish so'rovlari:</h3>
                            {joinRequests.map((req) => (
                                <div key={req.id} className="flex items-center justify-between mb-2">
                                    <span>{req.name} qo'shilishni so'radi</span>
                                    <div>
                                        <Button variant="ghost" onClick={() => handleApproveJoin(req)} className="mr-2 text-green-500">
                                            <Check size={16} />
                                        </Button>
                                        <Button variant="ghost" onClick={() => handleRejectJoin(req)} className="text-red-500">
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tinglovchilarni tanlash modali (Host uchun) */}
            <Dialog open={showSelectModal} onOpenChange={setShowSelectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tinglovchidan ishtirokchi tanlang</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-60 overflow-y-auto">
                        {observers.map((o) => (
                            <div 
                                key={o.id} 
                                className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleInviteSelected(o)}
                            >
                                <span>{o.name}</span>
                                <Plus size={16} className="text-green-500" />
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* Boshqaruv Paneli (Fixed Footer) - Faqat ishtirokchi bo'lsa */}
            {isCurrentParticipant && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl p-3 flex justify-between items-center z-10">
                    
                    {/* Chap taraf */}
                    <div className="flex items-center text-slate-800 font-semibold">
                        <LeftIcon size={20} className={`mr-2 ${statusColor}`} />
                        {statusText}
                    </div>

                    {/* Markaziy Tugma (Ochish/Mute) */}
                    <Button
                        onClick={toggleMute}
                        className={`rounded-full p-4 h-auto transition-all w-32 font-bold ${isMutedLocally ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isMutedLocally ? "Ochish" : "O'chirish"} 
                    </Button>
                    
                    {/* O'ng taraf */}
                    <Button variant="ghost" className="text-slate-500 hover:bg-slate-100 border border-slate-300">
                        Xonadan Chiqish
                    </Button>
                </div>
            )}
        </>
    );
}