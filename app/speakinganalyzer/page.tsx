"use client";

import React, { useRef, useState, useCallback } from "react";
// Navigation komponentini import qilamiz
import Navigation from "@/components/navigation";
import {
  FaceLandmarker,
  HandLandmarker,
  FaceLandmarkerResult,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { Eye, PersonStanding, Hand, Volume2, Loader2 } from "lucide-react";

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
  } as const;

  const { text: colorClass, bg: bgColor, border: borderColor } = colorMap[
    color as keyof typeof colorMap
  ] || colorMap.blue;

  return (
    <div className={`${bgColor} p-4 rounded-xl flex items-center gap-4 border ${borderColor} shadow-lg hover:shadow-xl transition-shadow`}>
      <div className={`p-3 rounded-full bg-white border ${borderColor}`}>{icon}</div>
      <div className="flex flex-col">
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className={`${colorClass} text-2xl font-bold`}>{value}</p>
      </div>
    </div>
  );
}

export default function SpeakingAnalyzerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const dataArrayRef = useRef<Uint8Array | null>(null);

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

  const currentScoresRef = useRef({ eye: 0, posture: 0, gesture: 0, volume: 0 });

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

  // Models yuklash
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
      setLoading("Modellarni yuklashda xato. Konsolni tekshiring.");
      runningRef.current = false;
      setIsStarted(false);
    }
  };

  const computeVolume = () => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    // Tekshiruv: agar analyser yoki dataArray null bo'lsa, ballni 0 ga qo'yamiz va chiqib ketamiz.
    if (!analyser || !dataArray) {
      currentScoresRef.current.volume = 0;
      setVolumeScore(0);
      return;
    }

    // dataArrayRef.current ni avval tekshirganimiz uchun, TypeScript xatosini bartaraf etish uchun
    // non-null assertion operatori (!) dan foydalanamiz, garchi qattiq tekshiruv (if) yetarli bo'lishi kerak bo'lsa ham.
    analyser.getByteFrequencyData(dataArray); 
    
    const avg = Array.from(dataArray).reduce((a, b) => a + b, 0) / dataArray.length;
    let volume = Math.floor((avg / 255) * 100 * 1.5);
    volume = Math.min(100, volume);

    currentScoresRef.current.volume = volume;
    setVolumeScore(volume);
  };

  const computeScores = (face: FaceLandmarkerResult | null, hands: HandLandmarkerResult | null) => {
    const lm = face?.faceLandmarks?.[0];
    const blendshapes = face?.faceBlendshapes?.[0]?.categories;

    // Agar yuz topilmasa, ballarni sekin tushiramiz
    if (!lm || !blendshapes) {
      const newEye = Math.max(0, currentScoresRef.current.eye - 2);
      const newPosture = Math.max(0, currentScoresRef.current.posture - 2);

      currentScoresRef.current.eye = newEye;
      currentScoresRef.current.posture = newPosture;
      currentScoresRef.current.gesture = Math.max(0, currentScoresRef.current.gesture - 5);
      
      setEyeScore(newEye);
      setPostureScore(newPosture);
      setGestureScore(currentScoresRef.current.gesture);
      return;
    }

    const getBlendShapeScore = (name: string) =>
      blendshapes.find((b) => b.categoryName === name)?.score || 0;

    // --- KO'Z ALOQASI (YAXSHILANGAN) ---
    const isBlinking = 
      getBlendShapeScore("eyeBlinkLeft") > 0.5 || 
      getBlendShapeScore("eyeBlinkRight") > 0.5;

    let targetEyeScore = currentScoresRef.current.eye;

    if (!isBlinking) {
      const lookLeft = getBlendShapeScore("eyeLookInLeft") + getBlendShapeScore("eyeLookOutRight");
      const lookRight = getBlendShapeScore("eyeLookInRight") + getBlendShapeScore("eyeLookOutLeft");
      const lookUp = getBlendShapeScore("eyeLookUpLeft") + getBlendShapeScore("eyeLookUpRight");
      const lookDown = getBlendShapeScore("eyeLookDownLeft") + getBlendShapeScore("eyeLookDownRight");

      const horizontalDev = Math.max(lookLeft, lookRight) / 2; 
      const verticalDev = Math.max(lookUp, lookDown) / 2;
      const maxDev = Math.max(horizontalDev, verticalDev);

      let rawEye = 100;
      if (maxDev > 0.15) {
        rawEye = Math.max(0, 100 - ((maxDev - 0.15) * 300));
      }
      targetEyeScore = Math.floor(rawEye);
    }
    
    const smoothEye = Math.floor(currentScoresRef.current.eye * 0.8 + targetEyeScore * 0.2);
    currentScoresRef.current.eye = smoothEye;
    setEyeScore(smoothEye);

    // --- POZITSIYA (POSTURE) ---
    const nose = lm[1];
    
    const centerX = 0.5;
    const deviationX = Math.abs(nose.x - centerX);
    
    const leftEyeOuter = lm[33];
    const rightEyeOuter = lm[263];
    const dy = Math.abs(leftEyeOuter.y - rightEyeOuter.y); 
    
    let rawPosture = 100 - (deviationX * 150) - (dy * 200);
    rawPosture = Math.max(0, Math.min(100, rawPosture));

    const smoothPosture = Math.floor(currentScoresRef.current.posture * 0.9 + rawPosture * 0.1);
    currentScoresRef.current.posture = smoothPosture;
    setPostureScore(smoothPosture);

    // --- JESTLAR (GESTURE) ---
    const handCount = hands?.landmarks?.length || 0;
    
    let targetGesture = 0;
    if (handCount === 1) targetGesture = 60;
    else if (handCount >= 2) targetGesture = 100;
    else targetGesture = Math.max(0, currentScoresRef.current.gesture - 2);

    const smoothGesture = Math.floor(currentScoresRef.current.gesture * 0.8 + targetGesture * 0.2);
    currentScoresRef.current.gesture = smoothGesture;
    setGestureScore(smoothGesture);
  };

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

  const stop = useCallback(async () => {
    if (!runningRef.current && overallScore !== null) return;

    const wasRunning = runningRef.current;
    runningRef.current = false;
    setIsStarted(false);
    setLoading(wasRunning ? "Maslahat generatsiya qilinmoqda..." : "Tayyor");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (audioCtxRef.current) {
      await audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
    if (handLandmarkerRef.current) {
      handLandmarkerRef.current.close();
      handLandmarkerRef.current = null;
    }

    modelLoadedRef.current = false;

    if (wasRunning) {
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

      // Serverga so'rov yuboramiz
      try {
        setLoading("AI maslahat olinmoqda...");
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eye: avgEye,
            posture: avgPosture,
            gesture: avgGesture,
            volume: avgVolume,
          }),
        });

        const data = await res.json();
        if (data?.text) {
          setFeedback(data.text);
        } else if (data?.error) {
          setFeedback("❌ Maslahat generatsiya qilishda xato: " + data.error);
        } else {
          setFeedback("❌ AI javobi noma'lum formatda qaytdi.");
        }
      } catch (err) {
        console.error("Feedback fetch error:", err);
        setFeedback("❌ Maslahat generatsiya qilishda xato. Serverni tekshiring.");
      }
    }

    setLoading("Tayyor");
  }, [overallScore]);

  const loop = useCallback(() => {
    if (!runningRef.current || !videoRef.current || !modelLoadedRef.current) return;

    const now = performance.now();
    const video = videoRef.current;

    fpsCounterRef.current.frames++;
    if (now - fpsCounterRef.current.lastTime >= 1000) {
      setFps(fpsCounterRef.current.frames);
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;
    }

    const faceLandmarker = faceLandmarkerRef.current;
    const handLandmarker = handLandmarkerRef.current;

    if (!faceLandmarker || !handLandmarker) {
      requestAnimationFrame(loop);
      return;
    }

    const timeSinceLastDetection = now - lastDetectionTimeRef.current;
    const shouldDetect = timeSinceLastDetection >= 100;

    if (shouldDetect && video.readyState >= video.HAVE_CURRENT_DATA) {
      lastDetectionTimeRef.current = now;

      let faceRes: FaceLandmarkerResult | null = null;
      let handRes: HandLandmarkerResult | null = null;

      try {
        const timestamp = Math.floor(now);
        faceRes = faceLandmarker.detectForVideo(video, timestamp);
      } catch (e) {
        console.warn("FaceLandmarker xatosi:", e);
      }

      try {
        const timestamp = Math.floor(now);
        handRes = handLandmarker.detectForVideo(video, timestamp);
      } catch (e) {
        console.warn("HandLandmarker xatosi:", e);
      }

      computeScores(faceRes, handRes);

      eyeScoresRef.current.push(currentScoresRef.current.eye);
      postureScoresRef.current.push(currentScoresRef.current.posture);
      gestureScoresRef.current.push(currentScoresRef.current.gesture);
      volumeScoresRef.current.push(currentScoresRef.current.volume);
    }

    computeVolume();
    draw(video);

    if (runningRef.current) {
      requestAnimationFrame(loop);
    }
  }, []);

  const start = async () => {
    if (runningRef.current) return;

    setFeedback("");
    setOverallScore(null);
    setAverageScores(null);

    setLoading("Kamera va mikrofon ochilmoqda...");
    runningRef.current = true;

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } },
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
    lastDetectionTimeRef.current = 0;
    fpsCounterRef.current = { frames: 0, lastTime: performance.now() };

    requestAnimationFrame(loop);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 flex flex-col">
      {/* Navigation komponentini qo'shdik */}
      <Navigation />

      <div className="flex flex-col items-center p-6 flex-grow">
        <div className="flex items-center justify-center gap-4 mb-6 bg-white px-8 py-4 rounded-full shadow-xl">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🎤 Nutq Tahlilchisi
          </h1>
          {isStarted && (
            <div className="bg-green-100 px-4 py-2 rounded-full animate-pulse">
              <span className="text-green-700 font-mono text-sm font-bold">{fps} FPS</span>
            </div>
          )}
        </div>

        {!isStarted ? (
          <button
            onClick={start}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full text-xl font-bold text-white transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center gap-3 justify-center"
            disabled={loading !== "Tayyor"}
          >
            {loading === "Tayyor" ? (
              <>
                <span className="text-2xl">🚀</span>
                BOSHLASH
              </>
            ) : (
              <>
                <Loader2 className="animate-spin w-6 h-6" />
                {loading}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stop}
            className="px-10 py-5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-full text-xl font-bold text-white transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center gap-3"
          >
            <span className="text-2xl">⏹️</span>
            TUGATISH
          </button>
        )}

        <p className="mt-4 text-gray-700 font-medium text-lg">
          {loading === "Tayyor" && overallScore === null ? "Tahlilni boshlash uchun yuqoridagi tugmani bosing" : loading}
        </p>

        <video muted ref={videoRef} autoPlay playsInline className="hidden" />

        <canvas ref={canvasRef} className="mt-8 w-full max-w-2xl rounded-3xl border-4 border-white bg-black shadow-2xl" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 max-w-5xl w-full">
          <Card title="Ko'z Aloqasi" value={eyeScore} color="yellow" icon={<Eye className="w-7 h-7 text-yellow-600" />} />
          <Card title="Pozitsiya" value={postureScore} color="blue" icon={<PersonStanding className="w-7 h-7 text-blue-600" />} />
          <Card title="Jeshtlar" value={gestureScore} color="cyan" icon={<Hand className="w-7 h-7 text-cyan-600" />} />
          <Card title="Ovoz Balandligi" value={volumeScore} color="green" icon={<Volume2 className="w-7 h-7 text-green-600" />} />
        </div>

        {overallScore !== null && averageScores && (
          <div className="mt-12 max-w-2xl w-full bg-white p-8 rounded-3xl shadow-2xl border-2 border-indigo-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">📊 UMUMIY BALL</h2>
              <div className="relative inline-block">
                <div className="text-7xl font-black">
                  <span className={
                    overallScore >= 80 ? "text-green-600" :
                    overallScore >= 65 ? "text-blue-600" :
                    overallScore >= 50 ? "text-yellow-600" :
                    "text-red-600"
                  }>{overallScore}</span>
                  <span className="text-gray-400 text-5xl">/100</span>
                </div>
                <div className="mt-3">
                  <span className={`inline-block px-6 py-2 rounded-full text-lg font-bold ${
                    overallScore >= 80 ? "bg-green-100 text-green-700" :
                    overallScore >= 65 ? "bg-blue-100 text-blue-700" :
                    overallScore >= 50 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {overallScore >= 80 ? "🌟 A'LO" :
                    overallScore >= 65 ? "👍 YAXSHI" :
                    overallScore >= 50 ? "📊 O'RTACHA" :
                    "📈 YAXSHILANISHI KERAK"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-4">📋 Batafsil natijalar</h3>

              <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👁️</span>
                  <span className="text-gray-800 font-semibold text-lg">Ko'z aloqasi</span>
                </div>
                <span className="text-yellow-600 text-2xl font-black">{averageScores.eye}</span>
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🧍</span>
                  <span className="text-gray-800 font-semibold text-lg">Pozitsiya</span>
                </div>
                <span className="text-blue-600 text-2xl font-black">{averageScores.posture}</span>
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-cyan-100 p-4 rounded-xl border-2 border-cyan-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🤲</span>
                  <span className="text-gray-800 font-semibold text-lg">Jeshtlar</span>
                </div>
                <span className="text-cyan-600 text-2xl font-black">{averageScores.gesture}</span>
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔊</span>
                  <span className="text-gray-800 font-semibold text-lg">Ovoz balandligi</span>
                </div>
                <span className="text-green-600 text-2xl font-black">{averageScores.volume}</span>
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div className="mt-8 max-w-2xl w-full bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl shadow-2xl border-2 border-indigo-300">
            <h2 className="text-2xl font-bold mb-5 text-indigo-700 flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <span>AI Maslahat</span>
            </h2>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg bg-white p-6 rounded-2xl border border-indigo-200">
              {feedback}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}