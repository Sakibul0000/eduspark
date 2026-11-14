import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 3000;

function hasValidGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key.length > 10);
}

function createGeminiClient(): GoogleGenAI | null {
  if (!hasValidGeminiKey()) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function generateDemoTutorResponse(message: string, courseContext?: string): string {
  const q = message.toLowerCase();
  const contextLine = courseContext ? `\n\n*Context: ${courseContext}*` : '';

  if (q.includes('machine learning') || q.includes('ml')) {
    return `### Machine Learning Explained Simply

Think of traditional programming like writing a detailed recipe: you give the computer exact rules and data, and it outputs answers. **Machine Learning (ML)** flips this around—you give the computer **examples (data)** and **expected outcomes**, and it discovers the underlying rules on its own.

#### The 3 Core Paradigms
1. **Supervised Learning**: Learning from labeled examples (e.g., predicting housing prices from historical sales, or classifying emails as spam vs. not spam).
2. **Unsupervised Learning**: Finding hidden structure in unlabeled data (e.g., grouping customers by purchasing behavior).
3. **Reinforcement Learning**: Learning by trial and error with rewards and penalties (e.g., training a game agent or robotics controller).

#### A Simple Mental Model
- **Features ($x$)**: The input clues (square footage, bedrooms).
- **Model ($f(x)$)**: A mathematical function with adjustable weights.
- **Loss Function**: Measures how wrong the prediction was.
- **Training**: Repeatedly adjusting weights to minimize that error.${contextLine}`;
  }

  if (q.includes('python')) {
    return `### Getting Started with Modern Python

Python emphasizes readability and clean syntax. Here are the essential building blocks you need first:

\`\`\`python
# 1. Variables & Type Hints
student_name: str = "Elena"
completed_modules: int = 4

# 2. Lists & Dictionaries
topics = ["Variables", "Loops", "Functions", "Classes"]
progress = {"python_basics": 85, "algorithms": 60}

# 3. Clean Functions
def calculate_average(scores: list[int]) -> float:
    if not scores:
        return 0.0
    return sum(scores) / len(scores)

print(f"{student_name}'s average: {calculate_average([88, 92, 95]):.1f}%")
\`\`\`

#### Next Step to Practice
Try writing a function that takes a list of numbers and returns only the even squares using a list comprehension: \`[n ** 2 for n in nums if n % 2 == 0]\`.${contextLine}`;
  }

  if (q.includes('study plan')) {
    return `### Structured 4-Week Mastery Study Plan

Here is a balanced weekly cadence designed for deep retention without burnout (~45 minutes/day):

- **Monday & Tuesday — Core Concepts**: Complete 2 lessons from your primary course and write a 5-bullet summary in your own words.
- **Wednesday — Active Practice**: Implement 2–3 small coding exercises or work through concrete numerical examples without looking at the solution first.
- **Thursday — Concept Synthesis**: Ask **EduSpark AI Tutor** to quiz you on weak spots or review any tricky debugging cases.
- **Friday — Timed Assessment**: Take one topic quiz under timed conditions and review every explanation—including the questions you got right.
- **Weekend — Rest & Spaced Review**: Spend 15 minutes skimming your notes from earlier in the week.

Tell me which subject or target timeline you have, and I can tailor this day-by-day.${contextLine}`;
  }

  if (q.includes('data structure')) {
    return `### Core Data Structures at a Glance

Choosing the right data structure determines how fast your program runs and how cleanly it scales:

| Structure | Strength | Typical Lookup | Best Use Case |
| :--- | :--- | :--- | :--- |
| **Array / List** | Fast indexed access | $O(1)$ by index | Ordered sequences, iteration |
| **Hash Map / Dict** | Key-value lookup | $O(1)$ average | Caching, frequency counting |
| **Stack (LIFO)** | Last-in, first-out | $O(1)$ push/pop | Undo history, function call stack |
| **Queue (FIFO)** | First-in, first-out | $O(1)$ enqueue/dequeue | Task scheduling, BFS traversal |
| **Binary Search Tree** | Sorted hierarchy | $O(\\log n)$ balanced | Range queries, ordered sets |
| **Graph** | Arbitrary relationships | Depends on edges | Social networks, routing, dependencies |

Would you like a step-by-step code walkthrough of any of these?${contextLine}`;
  }

  if (q.includes('practice question') || q.includes('quiz')) {
    return `### Five Practice Questions for Active Recall

1. **Algorithms**: Why does Binary Search require a sorted array, and what is its worst-case time complexity on $n$ elements?
2. **Python**: What is the key difference between a Python \`list\` and a \`tuple\` regarding mutability and memory?
3. **Web / TypeScript**: How do TypeScript union types help prevent invalid state transitions in UI components?
4. **Data Science**: What is the difference between correlation and causation, and why does overfitting hurt test accuracy?
5. **Linear Algebra**: What geometric transformation does multiplying a 2D vector by a $2 \\times 2$ matrix represent?

Reply with your answers (e.g., \`1: O(log n)...\`) and I will grade and explain each one step by step.${contextLine}`;
  }

  return `### EduSpark AI Study Guide

I received your question: **"${message.slice(0, 140)}${message.length > 140 ? '...' : ''}"**

Here is a structured way to break this topic down:

1. **Core Principle**: Identify the fundamental problem this concept solves and its inputs/outputs.
2. **Concrete Example**: Test the idea with a minimal 3-line code snippet or small numerical case before scaling up.
3. **Common Pitfall**: Watch out for edge cases (empty inputs, off-by-one bounds, or unstated assumptions).

Ask me to *"show a code example"*, *"explain step by step"*, or *"give me 3 practice questions"* to dive deeper into this exact topic.${contextLine}`;
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: hasValidGeminiKey(),
  });
});

interface ChatRequestMessage {
  role: 'user' | 'assistant';
  content: string;
}

app.post('/api/tutor/chat', async (req, res) => {
  try {
    const body = req.body as {
      message?: string;
      history?: ChatRequestMessage[];
      courseContext?: string;
    };

    const userMessage = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!userMessage) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    if (userMessage.length > 4000) {
      res.status(400).json({ error: 'Message exceeds maximum length of 4000 characters.' });
      return;
    }

    const courseContext = typeof body?.courseContext === 'string' ? body.courseContext.trim().slice(0, 180) : '';
    const history = Array.isArray(body?.history) ? body.history.slice(-12) : [];

    const ai = createGeminiClient();
    if (!ai) {
      res.json({
        reply: generateDemoTutorResponse(userMessage, courseContext),
        isDemo: true,
        notice: 'GEMINI_API_KEY is not configured in this environment. Running EduSpark Demo Assistant responses.',
      });
      return;
    }

    const systemInstruction = [
      'You are EduSpark AI Tutor, an encouraging, crystal-clear academic mentor and computer science, math, and data science instructor.',
      'Explain complex topics in simple, structured language with concrete examples, step-by-step reasoning, and clean fenced code blocks when helpful.',
      'Help students debug code by spotting the exact root cause and explaining the fix clearly.',
      'Keep responses focused, accurate, well-formatted in Markdown, and under 650 words unless the user asks for an exhaustive breakdown.',
      courseContext ? `The student currently has the course "${courseContext}" selected as study context. Tailor examples to that subject when relevant.` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const contents = [
      ...history
        .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content.slice(0, 4000) }],
        })),
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const replyText = response.text?.trim();
    if (!replyText) {
      res.json({
        reply: generateDemoTutorResponse(userMessage, courseContext),
        isDemo: true,
        notice: 'Empty response from Gemini API; provided demo study response.',
      });
      return;
    }

    res.json({
      reply: replyText,
      isDemo: false,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini Tutor API error:', errMsg);

    const body = req.body as { message?: string; courseContext?: string };
    const fallbackMessage = typeof body?.message === 'string' ? body.message : 'study help';
    const courseContext = typeof body?.courseContext === 'string' ? body.courseContext : '';

    res.json({
      reply: generateDemoTutorResponse(fallbackMessage, courseContext),
      isDemo: true,
      notice: `Live Gemini API unavailable (${errMsg.slice(0, 120)}). Switched to Demo Assistant response.`,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduSpark AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
