// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/get-activity', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const suggestion = response.choices[0].message.content;
    res.json({ suggestion });
  } catch (error) {
    console.error("Error with OpenAI:", error.message);
    res.status(500).json({ error: "Failed to get activity suggestion" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});