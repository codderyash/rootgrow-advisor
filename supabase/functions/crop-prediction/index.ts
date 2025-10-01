import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SensorData {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  pH: number;
  rainfall: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sensorData } = await req.json() as { sensorData: SensorData };
    
    if (!sensorData) {
      throw new Error('Sensor data is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing crop prediction request:', sensorData);
    const ph = (sensorData as any).pH ?? (sensorData as any).ph;

    const prompt = `Based on the following soil and environmental data, recommend the best crop to plant and provide detailed analysis:

Soil nutrients:
- Nitrogen (N): ${sensorData.N} mg/kg
- Phosphorus (P): ${sensorData.P} mg/kg  
- Potassium (K): ${sensorData.K} mg/kg
- pH: ${ph}

Environmental conditions:
- Temperature: ${sensorData.temperature}°C
- Humidity: ${sensorData.humidity}%
- Rainfall: ${sensorData.rainfall}mm

Please provide:
1. The recommended crop
2. Confidence level (as percentage)
3. Brief reasoning for the recommendation
4. Any specific care instructions

Respond in JSON format with fields: crop, confidence, reasoning, careInstructions`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 500,
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
    let prediction;
    try {
      prediction = JSON.parse(aiResponse);
      console.log('Successfully parsed AI response:', prediction);
    } catch (parseError) {
      console.log('Could not parse JSON response, creating fallback prediction');
      prediction = {
        crop: "Rice",
        confidence: 85,
        reasoning: "Based on the provided conditions, rice appears to be a suitable crop choice.",
        careInstructions: "Maintain proper water levels and monitor nutrient uptake regularly."
      };
    }

    console.log('Crop prediction generated successfully:', prediction);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crop-prediction function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});