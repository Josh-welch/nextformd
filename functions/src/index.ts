import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import OpenAI from 'openai';

// Initialize Firebase Admin
admin.initializeApp();

const secretManager = new SecretManagerServiceClient();

async function getOpenAIKey() {
  const [version] = await secretManager.accessSecretVersion({
    name: 'projects/nextformd/secrets/Openai/versions/latest',
  });
  return version.payload?.data?.toString() || '';
}

export const validateField = functions.https.onCall(async (data, context) => {
  try {
    const { value, fieldType, validationRules } = data;
    
    const openaiKey = await getOpenAIKey();
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const completion = await openai.chat.completions.create({
      messages: [{ 
        role: "user", 
        content: `
          You are a form validation expert. Please validate the following input:
          
          Field Type: ${fieldType}
          Validation Rules: ${validationRules}
          Input Value: ${value}
          
          Respond with a JSON object containing:
          1. "isValid" (boolean)
          2. "message" (string) explaining why the input is invalid if applicable
          
          Only consider the specific validation rules provided and the appropriate format for the field type.
        `
      }],
      model: "gpt-3.5-turbo",
      temperature: 0,
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Validation error:', error);
    throw new functions.https.HttpsError('internal', 'Validation failed');
  }
});