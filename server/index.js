import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

app.post('/api/validate', async (req, res) => {
  try {
    const { value, fieldType, validationRules } = req.body;

    const prompt = `
      You are a form validation expert. Please validate the following input:
      
      Field Type: ${fieldType}
      Validation Rules: ${validationRules}
      Input Value: ${value}
      
      Respond with a JSON object containing:
      1. "isValid" (boolean)
      2. "message" (string) explaining why the input is invalid if applicable
      
      Only consider the specific validation rules provided and the appropriate format for the field type.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});