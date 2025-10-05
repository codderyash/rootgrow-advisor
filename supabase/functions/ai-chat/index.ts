import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sensorData, recommendedCrop, language = 'en' } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing AI chat request:', message);

    const languageNames: Record<string, string> = {
      'en': 'English',
      'hi': 'Hindi',
      'bn': 'Bengali', 
      'te': 'Telugu',
      'mr': 'Marathi',
      'ta': 'Tamil',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'or': 'Odia',
      'pa': 'Punjabi'
    };
    
    const languageInstruction = language !== 'en' ? `\n\nIMPORTANT: You MUST respond in ${languageNames[language] || language} language. The entire response should be in ${languageNames[language] || language}, not English.` : '';
    const contextText = sensorData || recommendedCrop ? `\n\nContext:\n${sensorData ? `Sensor Data -> N:${sensorData.N}, P:${sensorData.P}, K:${sensorData.K}, pH:${sensorData.pH ?? sensorData.ph}, Temp:${sensorData.temperature}°C, Humidity:${sensorData.humidity}%, Rainfall:${sensorData.rainfall}mm` : ''}${sensorData && recommendedCrop ? '\n' : ''}${recommendedCrop ? `Recommended Crop -> ${recommendedCrop}` : ''}\n\nUse this context to tailor the answer. If the user asks about crops, prioritize the recommended crop and explain why.` : '' ;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are AgriBot, an AI agricultural assistant. You help farmers with crop management, pest control, fertilizers, weather insights, and farming best practices.${contextText}

User question: ${message}

Provide helpful, practical advice in a friendly and professional manner. Keep responses concise but informative.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'I apologize, I could not generate a response at this time.';

    console.log('AI chat response generated successfully:', aiResponse.substring(0, 100) + '...');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});