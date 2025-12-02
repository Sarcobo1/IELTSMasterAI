"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { 
    FaceLandmarker, 
    HandLandmarker, 
    FaceLandmarkerResult, 
    HandLandmarkerResult 
} from "@mediapipe/tasks-vision";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Navigatsiya panelini import qilamiz
import Navigation from "@/components/navigation"; 
import { Eye, PersonStanding, Hand, Volume2, Loader2 } from 'lucide-react';

// --- Card Komponenti ---
interface CardProps {
    title: string;
    value: number;
    color: string;
    icon: React.ReactNode;
}

function Card({ title, value, color, icon }: CardProps) {
    const colorMap = {
        yellow: { text: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
        blue: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
        cyan: { text: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
        green: { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    };
    
    const { text: colorClass, bg: bgColor, border: borderColor } = colorMap[color as keyof typeof colorMap] || colorMap.blue;

    return (
        <div className={`${bgColor} p-4 rounded-xl flex items-center gap-4 border ${borderColor} shadow-lg hover:shadow-xl transition-shadow`}>
            <div className={`p-3 rounded-full bg-white border ${borderColor}`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <p className="text-gray-600 text-sm font-medium">{title}</p>
                <p className={`${colorClass} text-2xl font-bold`}>{value}</p>
            </div>
        </div>
    );
}

export default function SpeakingAnalyzer() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);

    const streamRef = useRef<MediaStream | null>(null);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    
    // 1. DataArrayRef ni to'g'ri e'lon qilish va tipini qat'iy belgilash
    const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null); 

    const modelLoadedRef = useRef(false);
    const runningRef = useRef(false);
    const lastDetectionTimeRef = useRef(0);

    const [isStarted, setIsStarted] = useState(false);
    const [loading, setLoading] = useState("Tayyor");
    const [fps, setFps] = useState(0);

    const [eyeScore, setEyeScore] = useState(0);
    const [postureScore, setPostureScore] = useState(0);
    const [gestureScore, setGestureScore] = useState(0);
    const [volumeScore, setVolumeScore] = useState(0);

    const currentScoresRef = useRef({
        eye: 0,
        posture: 0,
        gesture: 0,
        volume: 0
    });

    const eyeScoresRef = useRef<number[]>([]);
    const postureScoresRef = useRef<number[]>([]);
    const gestureScoresRef = useRef<number[]>([]);
    const volumeScoresRef = useRef<number[]>([]);

    const [feedback, setFeedback] = useState<string>("");
    const [overallScore, setOverallScore] = useState<number | null>(null);
    const [averageScores, setAverageScores] = useState<{
        eye: number;
        posture: number;
        gesture: number;
        volume: number;
    } | null>(null);

    const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

    const loadModels = async () => {
        try {
            const vision = await import("@mediapipe/tasks-vision");

            const fileset = await vision.FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            setLoading("Yuz detektor yuklanmoqda...");
            faceLandmarkerRef.current = await vision.FaceLandmarker.createFromOptions(fileset, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numFaces: 1,
                outputFaceBlendshapes: true,
                minFaceDetectionConfidence: 0.5,
                minFacePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            setLoading("Qo'l detektor yuklanmoqda...");
            handLandmarkerRef.current = await vision.HandLandmarker.createFromOptions(fileset, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numHands: 2,
                minHandDetectionConfidence: 0.5,
                minHandPresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            modelLoadedRef.current = true;
        } catch (error) {
            console.error("Modellarni yuklashda xato:", error);
            setLoading("Modellarni yuklashda xato yuz berdi. Konsolni tekshiring.");
            runningRef.current = false;
            setIsStarted(false);
        }
    };

    // Stop funksiyasi - Tizimni to'liq tozalash uchun
    const stop = useCallback(async () => {
        if (!runningRef.current && overallScore !== null) return; // Agar natijalar ko'rsatilgan bo'lsa, qayta chaqirmaymiz

        const wasRunning = runningRef.current;
        runningRef.current = false;
        setIsStarted(false);
        setLoading(wasRunning ? "Maslahat generatsiya qilinmoqda..." : "Tayyor");

        // Media Stream'ni to'xtatish
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        // Audio kontekstni yopish
        if (audioCtxRef.current) {
            await audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
        
        // FaceLandmarker'ni yopish
        if (faceLandmarkerRef.current) {
          faceLandmarkerRef.current.close(); 
          faceLandmarkerRef.current = null;
        }

        // HandLandmarker'ni yopish
        if (handLandmarkerRef.current) {
          handLandmarkerRef.current.close();
          handLandmarkerRef.current = null;
        }
        
        modelLoadedRef.current = false; 

        if (wasRunning) {
            // Faqat to'xtatilganda natijalarni hisoblash
            const calcAverage = (scores: number[]) => 
                scores.length > 0 ? Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                
            const avgEye = calcAverage(eyeScoresRef.current);
            const avgPosture = calcAverage(postureScoresRef.current);
            const avgGesture = calcAverage(gestureScoresRef.current);
            const avgVolume = calcAverage(volumeScoresRef.current);

            const overall = Math.floor((avgEye + avgPosture + avgGesture + avgVolume) / 4);

            setAverageScores({ eye: avgEye, posture: avgPosture, gesture: avgGesture, volume: avgVolume });
            setOverallScore(overall);

            setEyeScore(0);
            setPostureScore(0);
            setGestureScore(0);
            setVolumeScore(0);
            setFps(0);

            await generateFeedback(avgEye, avgPosture, avgGesture, avgVolume);
        }

        setLoading("Tayyor");
    }, [overallScore]);

    const start = async () => {
        if (runningRef.current) return;
        
        // Avvalgi natijalarni tozalash
        setFeedback("");
        setOverallScore(null);

        setLoading("Kamera va mikrofon ochilmoqda...");
        runningRef.current = true;
        
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "user", 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    frameRate: { ideal: 30, max: 30 }
                },
                audio: true,
            });
        } catch (e) {
            console.error("Kamera/Mikrofonni ochishda xato:", e);
            setLoading("Kamera/Mikrofon ruxsat berilmagan.");
            runningRef.current = false;
            return;
        }

        if (!videoRef.current || !streamRef.current) {
            runningRef.current = false;
            return;
        }
        
        videoRef.current.muted = true;
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();

        // Audio tizimini sozlash
        setLoading("Audio analiz sozlanmoqda...");
        audioCtxRef.current = new AudioContext();
        const src = audioCtxRef.current.createMediaStreamSource(streamRef.current);
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        src.connect(analyserRef.current);
        
        // 2. Data array ni startda yaratish va tipini qat'iy belgilash
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount) as Uint8Array<ArrayBuffer>; 

        // Modellarni yuklash
        if (!modelLoadedRef.current) {
            await loadModels();
        }
        
        if (!modelLoadedRef.current || !runningRef.current) {
            setLoading("Yuklash bekor qilindi.");
            return;
        }

        setLoading("Ishlamoqda...");
        setIsStarted(true);

        // Score massivlarini tozalash
        eyeScoresRef.current = [];
        postureScoresRef.current = [];
        gestureScoresRef.current = [];
        volumeScoresRef.current = [];
        currentScoresRef.current = { eye: 0, posture: 0, gesture: 0, volume: 0 };
        lastDetectionTimeRef.current = 0;
        fpsCounterRef.current = { frames: 0, lastTime: performance.now() };

        requestAnimationFrame(loop);
    };


    const generateFeedback = async (avgEye: number, avgPosture: number, avgGesture: number, avgVolume: number) => {
        // (Bu funksiya avvalgi javoblardagidek qoladi)
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 
            if (!apiKey) {
                setFeedback("⚠️ Xato: Gemini API kaliti topilmadi. .env.local faylida NEXT_PUBLIC_GEMINI_API_KEY ni sozlang.");
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const overall = Math.floor((avgEye + avgPosture + avgGesture + avgVolume) / 4);

            const getRating = (score: number) => {
                if (score >= 80) return "A'LO";
                if (score >= 65) return "YAXSHI";
                if (score >= 50) return "O'RTACHA";
                return "YAXSHILANISHI KERAK";
            };

            const prompt = `Nutq tahlili natijalari (100 ball tizimida):

UMUMIY BALL: ${overall}/100 - ${getRating(overall)}

Batafsil natijalar:
━━━━━━━━━━━━━━━━━━━━━━━━━━
👁️ Ko'z aloqasi: ${avgEye}/100 - ${getRating(avgEye)}
🧍 Pozitsiya: ${avgPosture}/100 - ${getRating(avgPosture)}
🤲 Jeshtlar: ${avgGesture}/100 - ${getRating(avgGesture)}
🔊 Ovoz balandligi: ${avgVolume}/100 - ${getRating(avgVolume)}

Ushbu natijalarga asoslanib:
1. Har bir ko'rsatkichni tahlil qiling va nima yaxshi, nima yomonligini ayting
2. Kamchiliklar uchun konkret, amaliy maslahatlar bering
3. Kuchli tomonlarni qadrlang
4. Keyingi nutq uchun 3-5 ta asosiy tavsiya bering

Maslahatlar o'zbek tilida, qisqa, aniq va motivatsion bo'lsin. Emoji ishlatib, o'qish qulay qiling.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setFeedback(response.text);
        } catch (error) {
            console.error("Gemini xatosi:", error);
            setFeedback("❌ Maslahat generatsiya qilishda xato yuz berdi. Iltimos, qayta urinib ko'ring.");
        }
    };

    // 3. Audio analiz funksiyasini tuzatish
    const computeVolume = () => {
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        // Xatolikni oldini olish uchun qat'iy tekshiruv
        if (!analyser || !dataArray) {
            currentScoresRef.current.volume = 0;
            setVolumeScore(0);
            return;
        }

        // dataArray ni lokal o'zgaruvchi sifatida ishlatish xatolikni bartaraf etadi
        analyser.getByteFrequencyData(dataArray);

        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        let volume = Math.floor((avg / 255) * 100 * 1.5); 
        volume = Math.min(100, volume);
        
        currentScoresRef.current.volume = volume;
        setVolumeScore(volume);
    };

    // OPTIMALLASHTIRILGAN LOOP 
    const loop = useCallback(() => {
        if (!runningRef.current || !videoRef.current || !modelLoadedRef.current) return;
        
        const now = performance.now();
        const video = videoRef.current;

        // FPS hisobini yangilash
        fpsCounterRef.current.frames++;
        if (now - fpsCounterRef.current.lastTime >= 1000) {
            setFps(fpsCounterRef.current.frames);
            fpsCounterRef.current.frames = 0;
            fpsCounterRef.current.lastTime = now;
        }

        const faceLandmarker = faceLandmarkerRef.current;
        const handLandmarker = handLandmarkerRef.current;
        
        if (!faceLandmarker || !handLandmarker) {
            return;
        }

        // THROTTLING: Model detection har 100ms da bir marta
        const timeSinceLastDetection = now - lastDetectionTimeRef.current;
        const shouldDetect = timeSinceLastDetection >= 100;

        if (shouldDetect) {
            lastDetectionTimeRef.current = now;

            let faceRes: FaceLandmarkerResult | null = null;
            let handRes: HandLandmarkerResult | null = null;
            
            // 4. KRITIK TEKSHIRUV: Video yuklanganiga ishonch hosil qilish
            if (video.videoWidth === 0) return;

            try {
                // MUHIM TUZATISH: faceLandmarker da yuzaga keladigan xato boshqaruvi
                faceRes = faceLandmarker.detectForVideo(video, now);
            } catch (e) {
                console.error("KRITIK XATO: FaceLandmarker ishdan chiqdi!", e);
                runningRef.current = false; 
                alert("Tahlil tizimida xato yuz berdi. Iltimos, qayta urinib ko'ring.");
                stop(); // Tizimni yopish
                return;
            }

            try {
                // MUHIM TUZATISH: handLandmarker da yuzaga keladigan xato boshqaruvi
                handRes = handLandmarker.detectForVideo(video, now);
            } catch (e) {
                console.warn("HandLandmarker xatosi (davom etilmoqda):", e);
                // Agar qo'l detektor ishlamay qolsa ham, boshqalar ishlashi uchun to'xtatmaymiz
            }

            computeScores(faceRes, handRes);
            
            eyeScoresRef.current.push(currentScoresRef.current.eye);
            postureScoresRef.current.push(currentScoresRef.current.posture);
            gestureScoresRef.current.push(currentScoresRef.current.gesture);
            volumeScoresRef.current.push(currentScoresRef.current.volume);
        }

        // Audio va drawing har frame'da
        computeVolume();
        
        draw(video);

        if (runningRef.current) {
            requestAnimationFrame(loop);
        }
    }, [stop]);

    const draw = (video: HTMLVideoElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
        }

        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
    };

    const computeScores = (face: FaceLandmarkerResult | null, hands: HandLandmarkerResult | null) => {
        const lm = face?.faceLandmarks?.[0];
        const blendshapes = face?.faceBlendshapes?.[0]?.categories;

        if (!lm || !blendshapes) {
            const newEye = Math.max(0, currentScoresRef.current.eye - 5);
            const newPosture = Math.max(0, currentScoresRef.current.posture - 5);
            
            currentScoresRef.current.eye = newEye;
            currentScoresRef.current.posture = newPosture;
            currentScoresRef.current.gesture = 0;
            
            setEyeScore(newEye);
            setPostureScore(newPosture);
            setGestureScore(0);
            return;
        }

        const getBlendShapeScore = (name: string) => 
            blendshapes.find((b) => b.categoryName === name)?.score || 0;

        const horizontalDev = Math.max(
            getBlendShapeScore('eyeLookInLeft'), getBlendShapeScore('eyeLookInRight'), 
            getBlendShapeScore('eyeLookOutLeft'), getBlendShapeScore('eyeLookOutRight')
        );
        const verticalDev = Math.max(
            getBlendShapeScore('eyeLookUpLeft'), getBlendShapeScore('eyeLookUpRight'), 
            getBlendShapeScore('eyeLookDownLeft'), getBlendShapeScore('eyeLookDownRight')
        );

        const maxDev = Math.max(horizontalDev, verticalDev);
        let eye = Math.floor(100 * (1 - Math.min(1, maxDev * 2.5))); 
        eye = Math.max(0, Math.min(100, eye)); 
        
        currentScoresRef.current.eye = eye;
        setEyeScore(eye);

        const nose = lm[1];
        const centerEye = lm[168];
        const tilt = Math.abs(nose.x - centerEye.x);
        let posture = Math.floor(100 - tilt * 400); 
        posture = Math.max(0, Math.min(100, posture)); 

        currentScoresRef.current.posture = posture;
        setPostureScore(posture);

        const handCount = hands?.landmarks?.length || 0;
        let gesture = Math.min(100, handCount * 50); 
        
        currentScoresRef.current.gesture = gesture;
        setGestureScore(gesture);
    };


    return (
        <>
            <Navigation />

            <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center p-6 pt-20">
                <div className="flex items-center justify-center gap-4 mb-6 bg-white px-6 py-3 rounded-full shadow-md">
                    <h1 className="text-3xl font-bold text-center text-blue-600">Nutq Tahlilchisi</h1>
                    {isStarted && (
                        <div className="bg-blue-100 px-3 py-1 rounded-full">
                            <span className="text-blue-600 font-mono text-sm">{fps} FPS</span>
                        </div>
                    )}
                </div>

                {!isStarted ? (
                    <button
                        onClick={start}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-xl font-bold text-white transition duration-200 shadow-md flex items-center gap-2 justify-center"
                        disabled={loading !== "Tayyor"}
                    >
                        {loading === "Tayyor" ? "BOSHLASH" : (
                            <><Loader2 className="animate-spin w-5 h-5 mr-2" />{loading}</>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={stop}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-full text-xl font-bold text-white transition duration-200 shadow-md"
                    >
                        TUGATISH
                    </button>
                )}

                <p className="mt-4 text-gray-600 font-medium">{loading === "Tayyor" && overallScore === null ? "Analizni boshlash uchun bosing." : loading}</p>

                <video muted ref={videoRef} autoPlay playsInline className="hidden" />

                <canvas
                    ref={canvasRef}
                    className="mt-6 w-full max-w-md rounded-2xl border border-gray-300 bg-white shadow-xl"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-md w-full">
                    <Card title="Ko'z Aloqasi" value={eyeScore} color="yellow" icon={<Eye className="w-6 h-6 text-yellow-600" />} />
                    <Card title="Pozitsiya" value={postureScore} color="blue" icon={<PersonStanding className="w-6 h-6 text-blue-600" />} />
                    <Card title="Jeshtlar" value={gestureScore} color="cyan" icon={<Hand className="w-6 h-6 text-cyan-600" />} />
                    <Card title="Ovoz Balandligi" value={volumeScore} color="green" icon={<Volume2 className="w-6 h-6 text-green-600" />} />
                </div>

                {/* BAHOLASH NATIJALALARI */}
                {overallScore !== null && averageScores && (
                    <div className="mt-8 max-w-md w-full bg-white p-6 rounded-2xl shadow-2xl border border-gray-200">
                        {/* Umumiy Ball */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">UMUMIY BALL</h2>
                            <div className="relative inline-block">
                                <div className="text-6xl font-black">
                                    <span className={
                                        overallScore >= 80 ? "text-green-600" :
                                        overallScore >= 65 ? "text-blue-600" :
                                        overallScore >= 50 ? "text-yellow-600" :
                                        "text-red-600"
                                    }>{overallScore}</span>
                                    <span className="text-gray-400 text-4xl">/100</span>
                                </div>
                                <div className="mt-2">
                                    <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                                        overallScore >= 80 ? "bg-green-100 text-green-600" :
                                        overallScore >= 65 ? "bg-blue-100 text-blue-600" :
                                        overallScore >= 50 ? "bg-yellow-100 text-yellow-600" :
                                        "bg-red-100 text-red-600"
                                    }`}>
                                        {overallScore >= 80 ? "🌟 A'LO" :
                                        overallScore >= 65 ? "👍 YAXSHI" :
                                        overallScore >= 50 ? "📊 O'RTACHA" :
                                        "📈 YAXSHILANISHI KERAK"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Batafsil Natijalar */}
                        <div className="space-y-3 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-3">Batafsil natijalar</h3>
                            
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">👁️</span>
                                    <span className="text-gray-700 font-medium">Ko'z aloqasi</span>
                                </div>
                                <span className="text-yellow-600 text-xl font-bold">{averageScores.eye}</span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🧍</span>
                                    <span className="text-gray-700 font-medium">Pozitsiya</span>
                                </div>
                                <span className="text-blue-600 text-xl font-bold">{averageScores.posture}</span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🤲</span>
                                    <span className="text-gray-700 font-medium">Jeshtlar</span>
                                </div>
                                <span className="text-cyan-600 text-xl font-bold">{averageScores.gesture}</span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🔊</span>
                                    <span className="text-gray-700 font-medium">Ovoz balandligi</span>
                                </div>
                                <span className="text-green-600 text-xl font-bold">{averageScores.volume}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI MASLAHAT */}
                {feedback && (
                    <div className="mt-6 max-w-md w-full bg-white p-5 rounded-2xl shadow-lg border border-blue-200">
                        <h2 className="text-xl font-bold mb-3 text-blue-600 flex items-center gap-2">
                            <span>🤖</span>
                            <span>AI Maslahat</span>
                        </h2>
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{feedback}</div>
                    </div>
                )}
            </div>
        </>
    );
}