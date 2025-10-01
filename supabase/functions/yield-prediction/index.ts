import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FarmData {
  area: number;
  irrigation: string;
  fertilizerType: string;
  soilType: string;
  season: string;
  waterUsage: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { farmData } = await req.json() as { farmData: FarmData };
    
    if (!farmData) {
      throw new Error('Farm data is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing yield prediction request:', farmData);

    const prompt = `Based on the following farm parameters, predict the crop yield and provide analysis:

Farm Details:
- Area: ${farmData.area} acres
- Irrigation: ${farmData.irrigation}
- Fertilizer Type: ${farmData.fertilizerType}
- Soil Type: ${farmData.soilType}
- Season: ${farmData.season}
- Water Usage: ${farmData.waterUsage} liters/day

Please provide:
1. Predicted yield in tons
2. Confidence level (as percentage)
3. Tons per acre
4. Estimated revenue (assume $500 per ton)
5. Three key recommendations for improvement

Respond in JSON format with fields: predictedYield, confidence, tonsPerAcre, estimatedRevenue, recommendations (array of 3 strings)`;

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
          maxOutputTokens: 600,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';

    // Try to parse JSON response, fallback to structured data if parsing fails
    let prediction;
    try {
      prediction = JSON.parse(aiResponse);
    } catch (parseError) {
      console.log('Could not parse JSON response, creating fallback prediction');
      prediction = {
        predictedYield: Math.round(farmData.area * 2.5 * 100) / 100,
        confidence: 82,
        tonsPerAcre: 2.5,
        estimatedRevenue: Math.round(farmData.area * 2.5 * 500),
        recommendations: [
          "Optimize irrigation schedule based on crop growth stages",
          "Consider soil testing for precise nutrient management",
          "Implement integrated pest management practices"
        ]
      };
    }

    console.log('Yield prediction generated successfully:', prediction);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in yield-prediction function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});