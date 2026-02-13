// /app/custom-test/page.tsx

"use client"

import React, { useState } from 'react';
import IeltsTestInterface from '@/components/IeltsTestInterface'; 
import { Upload, Loader2, AlertTriangle, FileText, User, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm'; 

// --- TURLAR ---
interface PassagePart { id: string; text: string; }
interface Question { 
    id: number; 
    pre: string; 
    post: string; 
    words: number; 
    type: 'gap_fill' | 'multiple_choice' | 'tfng'; 
    options?: string[]; 
    answer: string; 
}
interface QuestionGroup { group_title: string; questions: Question[]; }
interface TestDataResponse {
    success: boolean;
    test_id: string;
    test_title: string;
    level: string;
    total_questions: number;
    parts: {
        part_id: number;
        passage_title: string;
        passage: PassagePart[];
        question_groups: QuestionGroup[];
    }[];
}
// --- TURLAR TUGADI ---

const FileUploadPage: React.FC = () => {
    const { isAuthenticated, isLoading, user } = useAuth(); 

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [testData, setTestData] = useState<TestDataResponse | null>(null);
    const [uploadProgress, setUploadProgress] = useState<string>(''); 

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError("Iltimos, faqat .pdf formatidagi fayl tanlang.");
        }
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            setError("Tizimga kirilmagan. Iltimos, avval tizimga kiring.");
            return;
        }

        if (!file) {
            setError("Iltimos, faylni tanlang.");
            return;
        }

        setLoading(true);
        setError(null);
        setUploadProgress("Fayl yuklanmoqda...");

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadProgress("PDF tahlil qilinmoqda...");
            
            const response = await fetch('/api/upload', { 
                method: 'POST',
                body: formData,
            });

            // ✅ TUZATISH: Avval response.ok tekshirish
            if (!response.ok) {
                // Agar server xato qaytarsa
                let errorMessage = "Server xatosi yuz berdi.";
                
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.details || errorMessage;
                } catch (jsonError) {
                    // Agar JSON parse bo'lmasa, status textni olish
                    errorMessage = `Server xatosi: ${response.status} ${response.statusText}`;
                }
                
                setError(errorMessage);
                setTestData(null);
                setUploadProgress('');
                return;
            }

            // ✅ OK response - JSON parse qilish
            setUploadProgress("Test ma'lumotlari yuklanmoqda...");
            
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error("JSON parse xatosi:", jsonError);
                setError("Server noto'g'ri ma'lumot qaytardi. Iltimos, qaytadan urinib ko'ring.");
                setTestData(null);
                setUploadProgress('');
                return;
            }

            // ✅ Muvaffaqiyatli javob
            if (data.success) {
                setTestData(data as TestDataResponse);
                setFile(null);
                setUploadProgress('Tayyor! Test yuklanmoqda...');
            } else {
                setError(data.error || "Faylni tahlil qilishda xato yuz berdi.");
                setTestData(null);
            }

        } catch (err) {
            console.error("Yuklashda xato:", err);
            
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError("Tarmoq xatosi: Serverga ulanib bo'lmadi. Internet aloqangizni tekshiring.");
            } else {
                setError("Kutilmagan xato yuz berdi. Iltimos, qaytadan urinib ko'ring.");
            }
            
            setTestData(null);
        } finally {
            setLoading(false);
            setTimeout(() => setUploadProgress(''), 3000);
        }
    };

    // Loading holati
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className='ml-2 text-gray-700'>Avtorizatsiya tekshirilmoqda...</p>
            </div>
        );
    }
    
    // Test yuklangan bo'lsa
    if (testData) {
        return <IeltsTestInterface customData={testData} />;
    }
    
    // Tizimga kirilmagan bo'lsa
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="flex flex-col md:flex-row gap-6 max-w-2xl w-full">
                    <AuthForm 
                        type="login" 
                        onSuccess={() => window.location.reload()}
                    />
                    <div className="border-l border-gray-300 mx-4 hidden md:block"></div>
                    <AuthForm 
                        type="register" 
                        onSuccess={() => alert("Ro'yxatdan o'tdingiz. Iltimos, tizimga kiring.")}
                    />
                </div>
            </div>
        );
    }

    // 🔑 Yuklash formasi
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <form onSubmit={handleUpload} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    <Upload size={24} className="inline-block mr-2 text-blue-600" />
                    Shaxsiy Test Yuklash
                </h2>
                
                {/* Foydalanuvchi ma'lumoti */}
                <div className="flex items-center justify-center bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg mb-4">
                    <User size={16} className="mr-2" />
                    <span className="text-sm font-medium">Xush kelibsiz, {user?.email}!</span>
                </div>

                {/* Progress ko'rsatish */}
                {uploadProgress && (
                    <div className="flex items-center bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        <span className="text-sm font-medium">{uploadProgress}</span>
                    </div>
                )}

                {/* Xatolar */}
                {error && (
                    <div className="flex items-start bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                
                {/* Fayl tanlash */}
                <div className="mb-4">
                    <label 
                        className={`block w-full text-center py-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer 
                            ${file ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600'}`}
                        htmlFor="file-upload"
                    >
                        {file ? (
                            <span className="font-semibold flex items-center justify-center">
                                <CheckCircle size={20} className="mr-2" />
                                {file.name}
                            </span>
                        ) : (
                            <span className="font-semibold flex items-center justify-center">
                                <FileText size={20} className="mr-2" />
                                PDF faylni tanlash uchun bosing
                            </span>
                        )}
                    </label>
                    <input 
                        id="file-upload" 
                        type="file" 
                        accept="application/pdf" 
                        onChange={handleFileChange} 
                        className="hidden"
                        disabled={loading}
                    />
                </div>

                <p className="text-sm text-gray-500 mb-6 text-center">
                    Faqat IELTS formatidagi PDF fayllarni yuklang. Agar tug'ri kelmasa boshqasini yuklang <br />
                    <span className="font-semibold text-red-600">Kunlik limit: 1 ta test</span>
                </p>

                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                    <p className="text-sm font-semibold text-amber-900 mb-1">Eslatma (PDF format):</p>
                    <p className="text-sm text-amber-800">
                        Har bir PDF oxirida <span className="font-bold">ANSWERS</span> yoki <span className="font-bold">ANSWER</span> degan bo‘lim bo‘lsin va uning pastida
                        savollar raqamiga mos <span className="font-semibold">javoblar</span> yozilgan bo‘lsin. Shu bo‘lim bo‘lmasa yoki noto‘g‘ri bo‘lsa, testda javoblar
                        xato chiqishi mumkin.
                    </p>
                </div>

                {/* Yuklash tugmasi */}
                <button
                    type="submit"
                    className={`w-full flex items-center justify-center py-2.5 rounded-lg font-semibold text-white transition-all 
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
                    disabled={!file || loading}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin mr-2" />
                            Tahlil qilinmoqda...
                        </>
                    ) : "Yuklash va Testni Boshlash"}
                </button>
            </form>
        </div>
    );
};

export default FileUploadPage;