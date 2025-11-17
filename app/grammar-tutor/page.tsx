"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Mic, Image as ImageIcon, X } from 'lucide-react';
import Navigation from "@/components/navigation";
import { useRouter } from 'next/navigation';

// TypeScript interfaces
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
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'chat' | 'audio' | 'image'>('chat');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | undefined>(undefined);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const messageIdCounter = useRef(0);

  // Generate unique message ID
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return Date.now() * 1000 + messageIdCounter.current;
  };

  // Clear chat history
  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    messageIdCounter.current = 0;
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load from localStorage
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);

    const count = parseInt(localStorage.getItem('questionCount') || '0', 10);
    setQuestionCount(count);

    const stored = localStorage.getItem('chatMessages');
    if (stored) {
      try {
        const loadedMessages = JSON.parse(stored);
        // Ensure all messages have unique IDs
        const messagesWithUniqueIds = loadedMessages.map((msg: ChatMessage, index: number) => ({
          ...msg,
          id: Date.now() * 1000 + index
        }));
        setMessages(messagesWithUniqueIds);
        // Update messageIdCounter to continue from last ID
        messageIdCounter.current = messagesWithUniqueIds.length;
      } catch (e) {
        console.error('Failed to parse stored messages:', e);
      }
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (file: File, fileMode: 'audio' | 'image') => {
    if (!file) return;
    setSelectedFile(file);
    setMode(fileMode);
    if (fileMode === 'image' && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(undefined);
    }
    setInputText('');
  };
//gemini
  // Send message function (with streaming support for chat)
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text && !selectedFile) return;

    const currentFile = selectedFile;
    const currentPreview = filePreviewUrl;
    const currentText = text;
    const currentMode = mode;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      sender: 'user',
      content: currentText || (currentFile ? 'Fayl yuklandi' : ''),
      filePreview: currentPreview,
      fileType: currentFile ? currentMode : undefined,
      additionalText: currentText,
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      localStorage.setItem('chatMessages', JSON.stringify(updated));
      return updated;
    });

    // Login check for chat
    if (currentMode === 'chat' && !isLoggedIn && questionCount >= 5) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Clear input immediately
    setInputText('');
    setSelectedFile(null);
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
      setFilePreviewUrl(undefined);
    }

    try {
      let response;

      if (currentFile) {
        // File mode (audio/image)
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('mode', currentMode);
        if (currentText) formData.append('userText', currentText);

        response = await fetch('/api/grammar', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Text mode (always chat now - it handles grammar checking too)
        response = await fetch('/api/grammar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userText: currentText, mode: 'chat' }),
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server xatosi (${response.status}): ${errText}`);
      }

      let data: AiResponse;

      if (!currentFile) {
        // Streaming for chat (all text input uses streaming now)
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream yo'q");

        const aiMessageId = generateMessageId();
        const aiMessage: ChatMessage = {
          id: aiMessageId,
          sender: 'ai',
          content: { type: 'chat', message: '' },
        };

        setMessages(prev => [...prev, aiMessage]);

        let fullMessage = '';
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullMessage += chunk;

            // Real-time update
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (lastIndex >= 0 && updated[lastIndex].id === aiMessageId) {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: { type: 'chat', message: fullMessage }
                };
              }
              return updated;
            });
          }
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          throw new Error("Streaming xatosi yuz berdi");
        }

        // Save final message to localStorage
        setMessages(prev => {
          localStorage.setItem('chatMessages', JSON.stringify(prev));
          return prev;
        });

        data = { type: 'chat', message: fullMessage.trim() };
      } else {
        // Non-streaming JSON
        data = await response.json();

        // Add AI message
        const aiMessage: ChatMessage = {
          id: generateMessageId(),
          sender: 'ai',
          content: data,
        };

        setMessages(prev => {
          const updated = [...prev, aiMessage];
          localStorage.setItem('chatMessages', JSON.stringify(updated));
          return updated;
        });
      }

      // Increment question count for chat
      if (currentMode === 'chat' && !isLoggedIn) {
        setQuestionCount(prev => {
          const newCount = prev + 1;
          localStorage.setItem('questionCount', newCount.toString());
          return newCount;
        });
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Frontend xatosi:", errorMessage);
      const errorMsg: ChatMessage = {
        id: generateMessageId(),
        sender: 'ai',
        content: `Xato yuz berdi: ${errorMessage}`,
      };
      setMessages(prev => {
        const updated = [...prev, errorMsg];
        localStorage.setItem('chatMessages', JSON.stringify(updated));
        return updated;
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render message content
  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.sender === 'user') {
      return (
        <div className="space-y-2">
          {msg.fileType === 'image' && msg.filePreview && (
            <img src={msg.filePreview} alt="Yuklangan rasm" className="max-w-[200px] max-h-32 rounded-lg object-cover" />
          )}
          {msg.fileType === 'audio' && (
            <div className="flex items-center space-x-2">
              <Mic className="w-8 h-8 text-white" />
              <span className="text-sm text-white">Audio fayl yuklandi</span>
            </div>
          )}
          {typeof msg.content === 'string' && msg.content && (
            <p className="text-sm text-white">{msg.content}</p>
          )}
        </div>
      );
    }

    if (typeof msg.content === 'string') {
      return <p className="text-red-500 text-sm">{msg.content}</p>;
    }

    const data = msg.content as AiResponse;

    switch (data.type) {
      case 'chat':
        return <p className="text-gray-700 text-sm whitespace-pre-wrap">{data.message}</p>;

      case 'audio':
        return (
          <div className="space-y-4">
            <p className="text-blue-600 italic text-sm">Audio transkripsiya va grammatika tahlili:</p>
            {data.transcription && (
              <div className="bg-gray-100 p-2 rounded">
                <p className="font-bold mb-1">Transkripsiya:</p>
                <p className="text-gray-700">{data.transcription}</p>
              </div>
            )}
            {data.corrections?.length > 0 ? (
              <div>
                <p className="font-bold mb-2">Tuzatishlar:</p>
                {data.corrections.map((corr, idx) => (
                  <div key={idx} className="mb-3 border-l-4 border-blue-500 pl-3 p-2 bg-gray-50 rounded-md">
                    <p className="font-semibold text-red-600">Xato: "{corr.original}"</p>
                    <p className="text-green-600">To'g'ri: "{corr.corrected}"</p>
                    <p className="text-sm text-gray-500 mt-1">Izoh: {corr.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-600 font-semibold">Transkripsiyada xato topilmadi!</p>
            )}
            <div className="bg-gray-100 p-3 rounded-lg border">
              <p className="font-bold mb-1">Tuzatilgan versiya:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{data.final_corrected_text}</p>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <p className="text-blue-600 italic text-sm">Rasm tahlili va yechim:</p>
            <div className="bg-gray-100 p-2 rounded">
              <p className="font-bold mb-1">Chiqarilgan matn:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{data.extracted_text}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg border">
              <p className="font-bold mb-1">Yechim:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{data.solution}</p>
            </div>
          </div>
        );

      case 'grammar':
      default:
        return (
          <div className="space-y-4">
            <p className="text-blue-600 italic text-sm">Grammatika tahlili:</p>
            {data.corrections?.length > 0 ? (
              data.corrections.map((corr, idx) => (
                <div key={idx} className="mb-3 border-l-4 border-blue-500 pl-3 p-2 bg-gray-50 rounded-md">
                  <p className="font-semibold text-red-600">Xato: "{corr.original}"</p>
                  <p className="text-green-600">To'g'ri: "{corr.corrected}"</p>
                  <p className="text-sm text-gray-500 mt-1">Izoh: {corr.explanation}</p>
                </div>
              ))
            ) : (
              <p className="text-green-600 font-semibold">Matn mukammal! Hech qanday xato topilmadi.</p>
            )}
            <div className="bg-gray-100 p-3 rounded-lg border">
              <p className="font-bold mb-1 text-blue-600">Tuzatilgan versiya:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{data.final_corrected_text}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Header (if no messages) */}
      {messages.length === 0 && (
        <div className="max-w-4xl mx-auto w-full pt-20 pb-4 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            AI Assistant
          </h1>
          <h6 className="font-extrabold text-gray-400 tracking-tight mt-2">
            Your AI Tutor & Chat Companion
          </h6>
        </div>
      )}

      {/* Clear Chat Button (if messages exist) */}
      {messages.length > 0 && (
        <div className="max-w-4xl mx-auto w-full pt-4 px-4 flex justify-end">
          <Button
            onClick={clearChatHistory}
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Chatni tozalash
          </Button>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`flex items-start max-w-lg ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar Placeholder */}
              <div className="w-8 h-8 rounded-full flex-shrink-0 mx-2 mt-1 bg-gray-300" />

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-3xl shadow-lg transition-all duration-300 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-tl-md border border-gray-200'
                }`}
              >
                {renderMessageContent(message)}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 mx-2 mt-1" />
            <div className="p-4 bg-white rounded-3xl rounded-tl-md border shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex justify-center w-full">
        <div className="flex flex-col items-end space-y-2 w-full max-w-4xl">
          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center space-x-2 self-end bg-gray-100 p-2 rounded-lg w-full max-w-md">
              {mode === 'image' && filePreviewUrl ? (
                <img src={filePreviewUrl} alt="Selected image preview" className="w-16 h-16 rounded object-cover" />
              ) : mode === 'audio' ? (
                <div className="flex items-center space-x-2">
                  <Mic className="w-8 h-8 text-gray-600" />
                  <span className="text-sm text-gray-600">Audio fayl</span>
                </div>
              ) : null}
              <p className="text-sm text-gray-600 flex-grow truncate">
                {mode === 'image' ? 'Rasm' : 'Audio'} tanlandi. Izoh yozing va yuboring.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreviewUrl(undefined);
                  setInputText('');
                  if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center space-x-3 w-full">
            <Input
              type="text"
              placeholder={
                mode === 'chat'
                  ? "Ask a question, check grammar, or chat in English..."
                  : mode === 'audio'
                  ? "Audio yuklaganingizdan keyin qo'shimcha izoh yozing..."
                  : "Rasm yuklaganingizdan keyin savol yoki izoh yozing..."
              }
              className="flex-grow p-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-red-500 h-12 shadow-inner"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
            />

            {/* Image Upload Icon */}
            <ImageIcon
              className="text-gray-400 hover:text-gray-600 cursor-pointer w-6 h-6 flex-shrink-0"
              onClick={() => {
                setMode('image');
                imageRef.current?.click();
              }}
            />

            {/* Audio Upload Icon */}
            <Mic
              className="text-gray-400 hover:text-gray-600 cursor-pointer w-6 h-6 flex-shrink-0"
              onClick={() => {
                setMode('audio');
                audioRef.current?.click();
              }}
            />

            {/* Send Button */}
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!inputText.trim() && !selectedFile)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 h-12 w-12 flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50"
            >
              <Send className="w-5 h-5 -rotate-90" />
            </Button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={audioRef}
          type="file"
          accept="audio/*"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files[0]!, 'audio')}
          className="hidden"
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files[0]!, 'image')}
          className="hidden"
        />
      </div>
    </div>
  );
}