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
      prompt = `Generate ${count} completely independent IELTS Speaking Part 1 questions for Introduction & Interview section.

DIFFICULTY LEVEL: EASY/BEGINNER
- These are simple, personal questions for warm-up conversation
- Topics: home, work, studies, hobbies, family, hometown, daily routines, food, weather, etc.
- Use simple present tense and basic vocabulary
- Questions should be short and direct

Each question must be:
- A complete, standalone question that can be understood without any context
- Simple and easy to understand (beginner-friendly)
- About personal, everyday topics
- Examples: "Where do you live?", "What do you do for work?", "Do you enjoy reading books?", "What's your favorite food?", "How do you usually spend your weekends?"
- NEVER use: "What it was that you had to learn", "Tell me about that", "How do you feel about it?" (vague pronouns)

IMPORTANT: Each question must be independent, complete, and EASY. Use simple language suitable for beginners.

Respond ONLY in JSON format: {"questions": ["Complete question 1", "Complete question 2", ...]}`;
    }

    if (testId === "part-2") {
      prompt = `Generate ${count} completely independent IELTS Speaking Part 2 cue cards.

DIFFICULTY LEVEL: INTERMEDIATE
- These are moderately challenging topics requiring 1-2 minutes of speaking
- Topics: experiences, places, people, objects, events, activities
- Require some vocabulary and ability to organize thoughts

Each cue card must be:
- A complete, standalone topic that can be understood without any context
- Starting with "Describe..." or "Talk about..."
- Include 3-4 bullet points with specific points to cover
- Moderate difficulty - not too easy, not too complex
- Examples of GOOD cue cards:
"Describe a place you visited that you enjoyed.
You should say:
- where it was
- when you went there
- what you did there
and explain why you enjoyed it."

"Talk about a person who has influenced you.
You should say:
- who this person is
- how you know them
- what they have done
and explain why they influenced you."

IMPORTANT: Each cue card must be independent, complete, and MODERATELY CHALLENGING. Use intermediate-level topics.

Respond ONLY in JSON format: {"questions": ["Complete cue card 1", "Complete cue card 2", ...]}`;
    }

    if (testId === "part-3") {
      prompt = `Generate ${count} completely independent IELTS Speaking Part 3 questions.
Topic theme: "${part2Topic || "general discussion"}"

DIFFICULTY LEVEL: ADVANCED/DIFFICULT
- These are challenging, abstract questions requiring deep thinking
- Topics: abstract ideas, opinions, analysis, comparisons, predictions, solutions
- Require advanced vocabulary, complex grammar, and critical thinking
- Questions should provoke thoughtful, extended responses

Each question must be:
- A complete, standalone question that can be understood without any context
- ADVANCED and CHALLENGING - requiring deep analysis and sophisticated language
- About abstract concepts, social issues, future trends, comparisons, or complex opinions
- Examples of GOOD ADVANCED questions: 
  "What are the long-term implications of artificial intelligence on employment?"
  "How do cultural differences influence educational systems around the world?"
  "To what extent should governments regulate social media platforms?"
  "What are the advantages and disadvantages of globalization for developing countries?"
  "How might climate change policies affect economic growth in the next decade?"
- NEVER use: "What it was that you had to learn", "Tell me more about that", "How do you feel about it?" (vague pronouns)

IMPORTANT: Each question must be independent, complete, and ADVANCED/DIFFICULT. Use complex topics that require sophisticated vocabulary and critical thinking.

Respond ONLY in JSON format: {"questions": ["Complete question 1", "Complete question 2", ...]}`;
    }

    // Writing tasks
    if (testId === "task-1") {
      prompt = `Generate ${count} IELTS Writing Task 1 questions. Task 1 requires describing charts, graphs, tables, diagrams, or processes.
Each question should be a complete prompt that asks the candidate to summarize, describe, or report information from visual data.
Respond ONLY in JSON: {"questions": ["question1", "question2"]}`;
    }

    if (testId === "task-2") {
      prompt = `Generate ${count} IELTS Writing Task 2 questions. Task 2 requires writing an opinion essay, discussion essay, or problem-solution essay.
Each question should be a complete prompt that asks for the candidate's opinion, discussion of both views, or analysis of a problem.
Respond ONLY in JSON: {"questions": ["question1", "question2"]}`;
    }

    if (testId === "task-3") {
      prompt = `Generate ${count} IELTS Writing Task 3 questions. Task 3 requires advanced discussion and critical analysis of complex topics.
Each question should be a complete prompt that requires deep analysis, evaluation, and sophisticated argumentation.
Respond ONLY in JSON: {"questions": ["question1", "question2"]}`;
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
                "You are an IELTS question generator. Generate clean JSON only. Never add explanations or extra text. Each question must be complete and independent - never reference other questions or use vague pronouns without clear context.",
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
