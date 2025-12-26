import React, { useState } from 'react';
import { useUserStatus } from '../context/UserStatusContext'; 

const UploaderComponent: React.FC = () => {
    // 1. Status va YANGILASH FUNKSIYASINI olish
    const { 
        remainingUploads, 
        totalLimit, 
        isPremium, 
        isLoading,
        isAuthenticated,
        updateRemainingUploads // ✅ YANGI: Statusni yangilash funksiyasi
    } = useUserStatus();

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const isLimitReached = remainingUploads <= 0;
    const isUploadDisabled = uploading || isLimitReached || !isAuthenticated || !file; // Fayl tanlanmagan bo'lsa ham bloklash

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
                // ✅ Muvaffaqiyatli yuklash
                setMessage(`Muvaffaqiyatli! ${data.message}`);
                
                // --- MUHIM YANGILASH ---
                // Serverdan kelgan yangi qolgan yuklashlar soni bilan Contextni yangilash
                updateRemainingUploads(data.remainingUploads); 
                // -------------------------

                setFile(null); // Fayl inputini tozalash
            } else {
                // ❌ Xato: 429 Limit yoki boshqa xatolar
                setMessage(`Xato: ${data.message}`);
            }

        } catch (error) {
            setMessage('Tarmoq xatosi yuz berdi. Server bilan aloqa yo\'q.');
        } finally {
            setUploading(false);
        }
    };

    // ... (qolgan Render/HTML qismi avvalgi javobingizdagi kabi qoladi) ...

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Fayl Yuklash Markazi</h3>
            
            {/* Limit haqida ma'lumot */}
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: isPremium ? '#e0f7fa' : '#fff3e0', borderRadius: '5px' }}>
                {isPremium ? (
                    <p>⭐ **Premium a'zo:** Qolgan yuklashlar: **{remainingUploads}** / {totalLimit}.</p>
                ) : (
                    <p>
                        Oddiy a'zo: Qolgan yuklashlar: **{remainingUploads}** / {totalLimit}.
                        <a href="/obuna" style={{marginLeft: '10px', color: '#1565c0', fontWeight: 'bold'}}>Limitni 50x oshirish.</a>
                    </p>
                )}
            </div>

            <input 
                type="file" 
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                // Yuklash tugmasi bloklanganda input ham bloklanadi
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
            
            {message && <p style={{ marginTop: '15px', color: isLimitReached ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
};

export default UploaderComponent;