// app/api/generate-questions/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { testId, count, part2Topic } = await req.json();

    if (!testId) {
      return NextResponse.json({ error: "testId is required" }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing" },
        { status: 500 }
      );
    }

    // Determine prompt type
    let prompt = "";

    if (testId === "part-1") {
      prompt = `Generate ${count} IELTS Speaking Part 1 questions. 
Respond ONLY in JSON: {"questions": ["q1","q2"]}`;
    }

    if (testId === "part-2") {
      prompt = `Generate ${count} IELTS Speaking Part 2 cue cards.
Respond ONLY in JSON: {"questions": ["topic1"]}`;
    }

    if (testId === "part-3") {
      prompt = `Generate ${count} IELTS Speaking Part 3 questions.
Topic base: "${part2Topic}".
Respond ONLY in JSON: {"questions": ["q1","q2"]}`;
    }

    // Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You generate clean JSON only. Never add explanations or extra text.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API Error:", errText);
      return NextResponse.json(
        { error: "Groq AI request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const jsonText = data?.choices?.[0]?.message?.content;

    if (!jsonText) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 500 }
      );
    }

    // Parse JSON returned by AI
    const parsed = JSON.parse(jsonText);

    // Final return
    return NextResponse.json({
      questions: parsed.questions || [],
      topic: parsed.topic || part2Topic || null,
    });
  } catch (err: any) {
    console.error("generate-questions API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
