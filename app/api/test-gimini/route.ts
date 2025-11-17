// Save this as: app/api/test-gemini/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'GEMINI_API_KEY not found in environment variables',
      hint: 'Make sure .env.local file exists with GEMINI_API_KEY=your_key'
    }, { status: 500 });
  }

  console.log('Testing Gemini API...');
  console.log('API Key exists:', !!geminiApiKey);
  console.log('API Key length:', geminiApiKey.length);
  console.log('API Key starts with:', geminiApiKey.substring(0, 10) + '...');

  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: 'Say "Hello, API is working!"' }
            ]
          }
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        error: data,
        hint: response.status === 429 
          ? 'Quota exceeded - get a new API key from https://aistudio.google.com/app/apikey'
          : response.status === 403
          ? 'Invalid API key - check your .env.local file'
          : 'API request failed'
      }, { status: response.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working!',
      response: text,
      fullResponse: data
    });

  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Check your internet connection and firewall settings'
    }, { status: 500 });
  }
}