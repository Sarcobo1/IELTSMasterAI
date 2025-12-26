// components/UploaderComponent.tsx
"use client";

import React, { useState } from 'react';
import { useUserStatus } from '../context/UserStatusContext'; 

const UploaderComponent: React.FC = () => {
    // ✅ Barcha kerakli maydonlar mavjud
    const { 
        remainingUploads, 
        totalLimit, 
        isPremium, 
        isLoading,
        isAuthenticated,
        updateRemainingUploads
    } = useUserStatus();

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const isLimitReached = remainingUploads <= 0;
    const isUploadDisabled = uploading || isLimitReached || !isAuthenticated || !file;

    const handleFileUpload = async () => {
        if (!file || isUploadDisabled) return;
        
        setUploading(true);
        setMessage('Fayl yuklanmoqda...');
        
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('authToken'); 

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            
            if (res.ok) {
                setMessage(`Muvaffaqiyatli! ${data.message}`);
                
                // ✅ Serverdan kelgan yangi qolgan yuklashlar soni
                if (typeof data.remainingUploads === 'number') {
                    updateRemainingUploads(data.remainingUploads);
                }
                
                setFile(null);
            } else {
                setMessage(`Xato: ${data.message}`);
            }

        } catch (error) {
            setMessage('Tarmoq xatosi yuz berdi. Server bilan aloqa yo\'q.');
        } finally {
            setUploading(false);
        }
    };

    // Loading holati
    if (isLoading) {
        return <div>Yuklanmoqda...</div>;
    }

    // Tizimga kirish kerak
    if (!isAuthenticated) {
        return (
            <div style={{ padding: '20px', border: '1px solid #f44336', borderRadius: '8px', backgroundColor: '#ffebee' }}>
                <h3>🔒 Kirish Talab Qilinadi</h3>
                <p>Fayl yuklash uchun tizimga kiring.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Fayl Yuklash Markazi</h3>
            
            {/* Limit haqida ma'lumot */}
            <div style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                backgroundColor: isPremium ? '#e0f7fa' : '#fff3e0', 
                borderRadius: '5px' 
            }}>
                {isPremium ? (
                    <p>⭐ <strong>Premium a'zo:</strong> Qolgan yuklashlar: <strong>{remainingUploads}</strong> / {totalLimit}.</p>
                ) : (
                    <p>
                        Oddiy a'zo: Qolgan yuklashlar: <strong>{remainingUploads}</strong> / {totalLimit}.
                        <a href="/obuna" style={{marginLeft: '10px', color: '#1565c0', fontWeight: 'bold'}}>
                            Limitni 50x oshirish.
                        </a>
                    </p>
                )}
            </div>

            <input 
                type="file" 
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                disabled={isLimitReached || !isAuthenticated || uploading}
            />

            <button 
                onClick={handleFileUpload} 
                disabled={isUploadDisabled}
                style={{
                    marginLeft: '10px',
                    backgroundColor: isUploadDisabled ? '#999' : '#007bff',
                    color: 'white',
                    padding: '8px 15px',
                    cursor: isUploadDisabled ? 'not-allowed' : 'pointer',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                {uploading ? 'Yuklanmoqda...' : isLimitReached ? 'Limitga yetildi' : 'Yuklash'}
            </button>
            
            {message && (
                <p style={{ 
                    marginTop: '15px', 
                    color: message.includes('Xato') ? 'red' : 'green' 
                }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default UploaderComponent;