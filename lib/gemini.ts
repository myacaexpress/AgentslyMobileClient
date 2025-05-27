// Gemini API Helper
export const callGeminiAPI = async (prompt: string, imageBase64: string | null = null, responseSchema: any = null): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || ""; 
  if (!apiKey) {
    console.error("GOOGLE_AI_API_KEY is not set in .env.local");
    // In a real app, you might want to throw an error or handle this more gracefully
    return responseSchema ? "{}" : "API Key for Gemini is not configured.";
  }
  // Updated model names based on common Gemini models. Adjust if specific versions like "gemini-2.0-flash" are intended.
  // For vision, "gemini-pro-vision" is standard. For text, "gemini-pro" or "gemini-1.5-flash-latest" / "gemini-1.5-pro-latest"
  const model = imageBase64 ? "gemini-pro-vision" : "gemini-1.5-flash-latest"; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let parts: Array<any> = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png", // Assuming PNG, adjust if other types are supported
        data: imageBase64.split(',')[1] // Remove the "data:image/png;base64," part
      }
    });
  }
  
  const payload: any = {
    contents: [{ role: "user", parts: parts }],
  };

  // Handling responseSchema for Gemini.
  // The `responseSchema` parameter in `generationConfig` is specific to certain models/versions.
  // For general JSON output, instructing the model within the prompt is often more reliable,
  // or using function calling if the model supports it.
  if (responseSchema) {
    payload.generationConfig = {
        responseMimeType: "application/json",
        // The 'responseSchema' field itself might not be directly supported in all Gemini text models in this way.
        // It's more common with specific vertex AI model endpoints or through function calling.
        // If you intend to use a strict schema, ensure your prompt clearly asks for JSON matching that schema.
    };
     // Example of how you might include schema instructions in the prompt if direct config is not supported:
     // prompt += `\n\nPlease format your response as a JSON object matching the following schema: ${JSON.stringify(responseSchema)}`;
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API Error:", response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }
    const result = await response.json();
    
    // Check for function calls in response if that's part of your schema/prompt strategy
    if (result.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
        // Handle function call if necessary
        console.log("Gemini wants to call a function:", result.candidates[0].content.parts[0].functionCall);
        // You would then execute the function and send back a function response.
        // For now, assuming text or direct JSON response.
        return JSON.stringify(result.candidates[0].content.parts[0].functionCall.args); // Or however you process function call args
    }

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected Gemini API response structure:", result);
      return responseSchema ? "{}" : "Sorry, I couldn't process that request. The response from the AI was not as expected.";
    }
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return responseSchema ? "{}" : `Sorry, an error occurred: ${error.message}. Please check the console for more details.`;
  }
};
