'use client'

import React, { useState, ChangeEvent } from 'react';
import IeltsTestInterface from './IeltsTestInterface';

// ... (Types o'zgarishsiz)

interface Question { 
    id: number; 
    type: 'gap_fill' | 'multiple_choice' | 'tfng';
    pre?: string; 
    post?: string; 
    words?: number;
    statement?: string;
    question?: string;
    options?: string[];
    answer: string; 
}

interface QuestionGroup { 
    group_title: string;
    type?: 'gap_fill' | 'multiple_choice' | 'tfng';
    instruction?: string;
    questions: Question[]; 
}

interface PassagePart { 
    id: string; 
    text: string; 
}

interface TestPart {
    part_id: number;
    passage_title: string;
    passage: PassagePart[];
    question_groups: QuestionGroup[];
}

interface ApiTestDataResponse {
    success: boolean;
    test_id: string;
    test_title: string;
    level: string;
    total_questions: number;
    parts: TestPart[];
}

const PdfUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null); 
    const [testData, setTestData] = useState<ApiTestDataResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Iltimos, PDF fayl tanlang');
            return;
        }

        setLoading(true);
        setTestData(null);
        setError(null);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            // ✅ DEBUG: Backend response'ni console'ga chiqarish
            console.log('📦 Backend Response:', {
                success: data.success,
                test_title: data.test_title,
                total_questions: data.total_questions,
                parts_count: data.parts?.length,
                parts: data.parts
            });
            
            // Har bir Part'ni alohida ko'rsatish
            if (data.parts && Array.isArray(data.parts)) {
                data.parts.forEach((part: TestPart, index: number) => {
                    console.log(`\n📖 Part ${index + 1}:`, {
                        part_id: part.part_id,
                        passage_title: part.passage_title,
                        passage_paragraphs: part.passage?.length || 0,
                        passage_preview: part.passage?.[0]?.text?.substring(0, 100) || 'No text',
                        question_groups: part.question_groups?.length || 0,
                        questions: part.question_groups?.reduce((sum, g) => sum + (g.questions?.length || 0), 0) || 0
                    });
                });
            }
            
            if (response.ok && data.success) {
                console.log('✅ Upload successful, setting testData');
                setTestData(data);
            } else {
                const errorMsg = data.details || data.error || "Tahlil qilish muvaffaqiyatsiz tugadi.";
                setError(errorMsg);
                console.error('❌ Upload error:', errorMsg);
            }
        } catch (err: any) {
            const errorMsg = "Yuklashda kutilmagan xato yuz berdi: " + (err.message || '');
            setError(errorMsg);
            console.error('❌ Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        console.log('🔄 Resetting test data');
        setTestData(null);
        setFile(null);
        setError(null);
    };

    // Test yuklangan bo'lsa
    if (testData) {
        console.log('✅ Rendering IeltsTestInterface with data:', {
            parts: testData.parts?.length,
            test_title: testData.test_title
        });
        
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="bg-white border-b border-gray-300 px-4 py-2">
                    <button
                        onClick={handleReset}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-semibold"
                    >
                        ← Yangi PDF yuklash
                    </button>
                </div>
                
                <IeltsTestInterface customData={testData} />
            </div>
        );
    }

    // Upload sahifasi
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        IELTS Reading Test
                    </h1>
                    <p className="text-gray-600">
                        PDF faylni yuklang va testni boshlang
                    </p>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    
                    {/* File Input */}
                    <div className="mb-6">
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {file ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg font-semibold text-gray-700 mb-2">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="mb-2 text-lg font-semibold text-gray-700">
                                            PDF faylni yuklang
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Yoki bu yerga sudrab olib keling
                                        </p>
                                    </>
                                )}
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-red-800">Xatolik</p>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Tahlil qilinmoqda...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Yuklash va Testni Boshlash
                            </>
                        )}
                    </button>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">PDF formatdagi IELTS Reading testlarni yuklang</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Test 1-3 ta Part'dan iborat bo'lishi mumkin</li>
                                    <li>Har bir Part'da Passage va Questions bo'lishi shart</li>
                                    <li>AI avtomatik ravishda tahlil qiladi va ajratadi</li>
                                    <li>Tahlildan so'ng test interfeysi ochiladi</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    ⚠️ Eslatma: Sahifani yangilasangiz, yuklangan test yo'qoladi
                </p>
            </div>
        </div>
    );
};

export default PdfUploader;