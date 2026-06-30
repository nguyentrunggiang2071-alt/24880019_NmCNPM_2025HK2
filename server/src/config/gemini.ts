import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY!;
if (!apiKey) throw new Error('Missing GEMINI_API_KEY environment variable');

export const GEMINI_MODEL = 'gemini-flash-latest';

export async function geminiGenerateContent(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const response = await axios.post(
    url,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { 'X-goog-api-key': apiKey, 'Content-Type': 'application/json' } }
  );

  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
