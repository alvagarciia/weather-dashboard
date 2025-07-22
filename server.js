// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';


// Simple AI function 1
async function getCompletion(prompt, model="gpt-3.5-turbo") {
  return await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "developer", 
          content: "You are a fun activity recommender that will take into account the user info. Recommend one activity in up to 2 sentences, if appropriate for the time." }, 
        { role: "user", content: prompt }],
      max_completion_tokens: 64,
    });
}
// AI 
async function getResponse(prompt, model="gpt-4o-mini") {
  return await openai.responses.create({
      model: model,
      // tools: [ { type: "web_search_preview" }],
      input: [
        { role: "developer", 
          content: "You are a fun activity recommender that will take into account the user info. If appropriate for the time, recommend one activity in the city mentioned in up to 2 sentences." }, 
        { role: "user", content: prompt }],
      max_output_tokens: 128,
      store: false,
    });
}

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
    // Responses Model (better, more expensive)
    // const response = await getResponse(prompt);
    // const suggestion = response.output_text;

    // Responses Model (inferior, cheaper)
    const response = await getCompletion(prompt);
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