import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { value, fieldType, validationRules } = JSON.parse(event.body);

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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Validation failed' }),
    };
  }
}