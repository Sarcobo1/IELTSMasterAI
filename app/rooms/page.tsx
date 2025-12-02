"use client"

import { useState } from 'react';
import { Mic, User, Headset } from 'lucide-react';
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button"; 
import Link from 'next/link';

// Simulyatsiya uchun xonalar ro'yxati (haqiqiyda backenddan olinadi)
const rooms = [
    { id: '1', name: 'IELTS Speaking Xonasi #1', description: 'Beginner daraja', participants: 4, maxParticipants: 8, observers: 12 },
    { id: '2', name: 'IELTS Speaking Xonasi #2', description: 'Intermediate daraja', participants: 3, maxParticipants: 8, observers: 5 },
    { id: '3', name: 'IELTS Speaking Xonasi #3', description: 'Advanced daraja', participants: 5, maxParticipants: 8, observers: 8 },
    { id: '4', name: 'IELTS Speaking Xonasi #4', description: 'General practice', participants: 2, maxParticipants: 8, observers: 10 },
    // Qo'shimcha xonalar qo'shish mumkin
];

const RoomCard = ({ room }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{room.name}</h3>
            <p className="text-slate-600 mb-4">{room.description}</p>
            <div className="flex items-center mb-2">
                <User size={18} className="text-purple-600 mr-2" />
                <span>{room.participants} / {room.maxParticipants} Ishtirokchi</span>
            </div>
            <div className="flex items-center mb-4">
                <Headset size={18} className="text-blue-500 mr-2" />
                <span>{room.observers} Tinglovchi</span>
            </div>
            <Link href={`/voice-chat/${room.id}`}>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Kirish
                </Button>
            </Link>
        </div>
    );
};

export default function RoomsPage() {
    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-white py-12 px-4 pt-20">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center">
                        <Mic size={30} className="text-purple-600 mr-2" />
                        Voice Chat Xonalari
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {rooms.map((room) => (
                            <RoomCard key={room.id} room={room} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}