"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
    FilesetResolver, 
    FaceLandmarker, 
    HandLandmarker, 
    FaceLandmarkerResult, 
    HandLandmarkerResult 
} from "@mediapipe/tasks-vision";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 💡 Navigatsiya panelini import qilamiz
import Navigation from "@/components/navigation"; 
import { Eye, PersonStanding, Hand, Volume2 } from 'lucide-react';

function Card({ title, value, color, icon }: { title: string, value: number, color: string, icon: React.ReactNode }) {
    const colorClass = `text-${color}-600`;
    const bgColor = `bg-${color}-50`;
    return (
        <div className={`${bgColor} p-4 rounded-xl flex items-center gap-4 border border-${color}-200 shadow-lg hover:shadow-xl transition-shadow`}>
            <div className={`p-3 rounded-full bg-white border border-${color}-200`}>
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
    const dataArrayRef = useRef<Uint8Array>(new Uint8Array(128));

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

    // FPS hisoblash uchun
    const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

    const loadModels = async () => {
        try {
            const vision = await import("@mediapipe/tasks-vision");

            const fileset = await vision.FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            // Face Landmarker - optimallashtirilgan
            faceLandmarkerRef.current = await vision.FaceLandmarker.createFromOptions(fileset, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
                    delegate: "GPU", // GPU ishlatish (agar mavjud bo'lsa)
                },
                runningMode: "VIDEO",
                numFaces: 1,
                outputFaceBlendshapes: true,
                minFaceDetectionConfidence: 0.5,
                minFacePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            // Hand Landmarker - optimallashtirilgan
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
            setLoading("Modellarni yuklashda xato yuz berdi.");
            runningRef.current = false;
            setIsStarted(false);
        }
    };

    const start = async () => {
        if (runningRef.current) return;
        
        setLoading("Kamera va mikrofon ochilmoqda...");
        runningRef.current = true;
        
        try {
            // Past resolution (yaxshiroq FPS uchun)
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "user", 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    frameRate: { ideal: 30, max: 30 } // Max 30 FPS
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

        setLoading("Audio analiz sozlanmoqda...");
        
        audioCtxRef.current = new AudioContext();
        const src = audioCtxRef.current.createMediaStreamSource(streamRef.current);

        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        src.connect(analyserRef.current);
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

        setLoading("Model yuklanmoqda...");
        if (!modelLoadedRef.current) {
            await loadModels();
        }
        
        if (!modelLoadedRef.current || !runningRef.current) {
            setLoading("Yuklash bekor qilindi.");
            return;
        }

        setLoading("Ishlamoqda...");
        setIsStarted(true);

        eyeScoresRef.current = [];
        postureScoresRef.current = [];
        gestureScoresRef.current = [];
        volumeScoresRef.current = [];
        currentScoresRef.current = { eye: 0, posture: 0, gesture: 0, volume: 0 };
        setFeedback("");
        setOverallScore(null);
        setAverageScores(null);
        lastDetectionTimeRef.current = 0;
        fpsCounterRef.current = { frames: 0, lastTime: performance.now() };

        requestAnimationFrame(loop);
    };

    const stop = async () => {
        if (!runningRef.current) return;

        runningRef.current = false;
        setIsStarted(false);
        setLoading("Maslahat generatsiya qilinmoqda...");

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (audioCtxRef.current) {
            await audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }

        // 💡 Modellar faqat to'xtatishda emas, balki boshida yuklanishi kerak (start funksiyasida shunday)
        // Shuning uchun bu yerda ularni yopish shart emas, agar butun ilovada qayta ishlatilmasa. 
        // Lekin resurslarni bo'shatish uchun yopish yaxshi amaliyot.
        if (faceLandmarkerRef.current) {
          faceLandmarkerRef.current.close();
          faceLandmarkerRef.current = null;
        }

        if (handLandmarkerRef.current) {
          handLandmarkerRef.current.close();
          handLandmarkerRef.current = null;
        }
        
        modelLoadedRef.current = false;


        const calcAverage = (scores: number[]) => 
            scores.length > 0 ? Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            
        const avgEye = calcAverage(eyeScoresRef.current);
        const avgPosture = calcAverage(postureScoresRef.current);
        const avgGesture = calcAverage(gestureScoresRef.current);
        const avgVolume = calcAverage(volumeScoresRef.current);

        // Umumiy ball (o'rtacha)
        const overall = Math.floor((avgEye + avgPosture + avgGesture + avgVolume) / 4);

        setAverageScores({
            eye: avgEye,
            posture: avgPosture,
            gesture: avgGesture,
            volume: avgVolume
        });
        setOverallScore(overall);

        setEyeScore(0);
        setPostureScore(0);
        setGestureScore(0);
        setVolumeScore(0);
        setFps(0);

        await generateFeedback(avgEye, avgPosture, avgGesture, avgVolume);

        setLoading("Tayyor");
    };

    const generateFeedback = async (avgEye: number, avgPosture: number, avgGesture: number, avgVolume: number) => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_NEXT_GEMINI_API_KEY; 
            if (!apiKey) {
                setFeedback("⚠️ Xato: Gemini API kaliti topilmadi. .env.local faylida NEXT_PUBLIC_GEMINI_API_KEY ni sozlang.");
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            // Umumiy ball
            const overall = Math.floor((avgEye + avgPosture + avgGesture + avgVolume) / 4);

            // Har bir ko'rsatkich uchun baho
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
            setFeedback(response.text());
        } catch (error) {
            console.error("Gemini xatosi:", error);
            setFeedback("❌ Maslahat generatsiya qilishda xato yuz berdi. Iltimos, qayta urinib ko'ring.");
        }
    };

    // OPTIMALLASHTIRILGAN LOOP 
    const loop = useCallback(() => {
        if (!runningRef.current || !videoRef.current || !modelLoadedRef.current) return;
        
        const now = performance.now();
        
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

        // THROTTLING: Model detection har 100ms da bir marta (10 FPS)
        const timeSinceLastDetection = now - lastDetectionTimeRef.current;
        const shouldDetect = timeSinceLastDetection >= 100;

        if (shouldDetect) {
            lastDetectionTimeRef.current = now;

            let faceRes: FaceLandmarkerResult | null = null;
            let handRes: HandLandmarkerResult | null = null;

            try {
                faceRes = faceLandmarker.detectForVideo(videoRef.current, now);
            } catch (e) {
                console.warn("FaceLandmarker xatosi:", e);
            }

            try {
                handRes = handLandmarker.detectForVideo(videoRef.current, now);
            } catch (e) {
                console.warn("HandLandmarker xatosi:", e);
            }

            computeScores(faceRes, handRes);
            
            eyeScoresRef.current.push(currentScoresRef.current.eye);
            postureScoresRef.current.push(currentScoresRef.current.posture);
            gestureScoresRef.current.push(currentScoresRef.current.gesture);
            volumeScoresRef.current.push(currentScoresRef.current.volume);
        }

        // Audio va drawing har frame'da (30 FPS)
        computeVolume();
        
        if (videoRef.current) {
            draw(videoRef.current);
        }

        if (runningRef.current) {
            requestAnimationFrame(loop);
        }
    }, []);

    const draw = (video: HTMLVideoElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false }); // alpha: false = tezroq
        if (!ctx) return;

        // Canvas o'lchamini faqat bir marta o'rnat
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
        }

        // Optimallashtirilgan mirror effect
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

    const computeVolume = () => {
        if (!analyserRef.current) {
            currentScoresRef.current.volume = 0;
            setVolumeScore(0);
            return;
        }

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        const avg = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
        let volume = Math.floor((avg / 255) * 100 * 1.5); 
        volume = Math.min(100, volume);
        
        currentScoresRef.current.volume = volume;
        setVolumeScore(volume);
    };

    return (
        <>
            <Navigation />

            <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center p-6 pt-20"> {/* pt-20 Navbar balandligi uchun */}
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
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-xl font-bold text-white transition duration-200 shadow-md"
                        disabled={loading !== "Tayyor"}
                    >
                        {loading === "Tayyor" ? "BOSHLASH" : "YUKLANMOQDA..."}
                    </button>
                ) : (
                    <button
                        onClick={stop}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-full text-xl font-bold text-white transition duration-200 shadow-md"
                    >
                        TUGATISH
                    </button>
                )}

                <p className="mt-4 text-gray-600 font-medium">{loading}</p>

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