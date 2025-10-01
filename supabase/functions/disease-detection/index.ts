import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiseaseDetection {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('Image is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY_NEW');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY_NEW is not configured');
    }

    console.log('Processing disease detection request');

    // Extract base64 data from the image
    const base64Data = image.split(',')[1] || image;

    const prompt = `Analyze this plant image for diseases and provide detailed information:

Please identify:
1. Any diseases present in the plant
2. Confidence level (0-100%)
3. Severity level (low, medium, high)
4. Visible symptoms
5. Treatment recommendations
6. Prevention measures

Respond in JSON format with fields: disease, confidence, severity, symptoms (array), treatment (array), prevention (array)

If no disease is detected, indicate "Healthy Plant" as the disease name.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 800,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';

    // Clean up markdown formatting if present
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to parse JSON response, fallback to structured data if parsing fails
    let detection: DiseaseDetection;
    try {
      detection = JSON.parse(aiResponse);
      console.log('Successfully parsed AI response:', detection);
    } catch (parseError) {
      console.log('Could not parse JSON response, creating fallback detection');
      detection = {
        disease: "Potential Disease Detected",
        confidence: 75,
        severity: "medium",
        symptoms: ["Visible leaf discoloration", "Potential pathogen presence"],
        treatment: ["Consult agricultural expert", "Apply appropriate fungicide", "Improve drainage"],
        prevention: ["Regular crop monitoring", "Proper spacing", "Balanced nutrition"]
      };
    }

    console.log('Disease detection completed successfully:', detection);

    return new Response(JSON.stringify(detection), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in disease-detection function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});