import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // serve static files from current directory

// Serve index.html by default
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Endpoint to call Groq API
app.post("/api/groq", async (req, res) => {
  const { userMessage, chatHistory = [], systemPrompt } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Groq API key not configured" });
  }

  if (!userMessage) {
    return res.status(400).json({ error: "No user message provided" });
  }

  const messages = [
    { role: "system", content: systemPrompt || "You are a helpful assistant." },
    ...chatHistory,
    { role: "user", content: userMessage }
  ];

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 700,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    res.json({ reply: content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to call Groq API" });
  }
});

app.post('/api/generate-code', async (req, res) => {
    const { instructions } = req.body;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are an expert AI that generates fully working code with comments.' },
                    { role: 'user', content: instructions }
                ],
                max_tokens: 1200,
                temperature: 0.2
            })
        });

        const groqData = await response.json();
        const code = groqData.choices?.[0]?.message?.content || '';
        res.json({ code });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate code' });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});