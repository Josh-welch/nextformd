import { auth } from './firebase';

export async function validateField(
  value: string,
  fieldType: string,
  validationRules: string
): Promise<{ isValid: boolean; message?: string }> {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    
    const response = await fetch('/.netlify/functions/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({
        value,
        fieldType,
        validationRules,
      }),
    });

    if (!response.ok) {
      throw new Error('Validation request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: false,
      message: 'Validation service unavailable',
    };
  }
}