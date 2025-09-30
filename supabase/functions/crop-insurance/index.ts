import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsuranceQuote {
  premium: number;
  coverage: number;
  roi: number;
  recommendations: string[];
  eligibility: boolean;
  documents: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { farmData } = await req.json();
    
    if (!farmData) {
      throw new Error('Farm data is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY_NEW');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY_NEW is not configured');
    }

    console.log('Processing crop insurance calculation:', farmData);

    const prompt = `Based on the following farm and crop information, calculate crop insurance details:

Farm Details:
- Crop Type: ${farmData.cropType}
- Area: ${farmData.area} acres
- Location: ${farmData.location}
- Soil Type: ${farmData.soilType || 'Not specified'}
- Irrigation: ${farmData.irrigationType || 'Not specified'}
- Previous Yield: ${farmData.previousYield || 'Not specified'} tons/acre

Please provide:
1. Annual premium amount (in INR)
2. Coverage amount (in INR)
3. ROI protection percentage
4. Eligibility status (true/false)
5. Three key recommendations
6. Required documents (array of document names)

Consider factors like crop type, regional risk, area size, and farming practices.

Respond in JSON format with fields: premium, coverage, roi, eligibility, recommendations (array), documents (array)`;

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
    let quote: InsuranceQuote;
    try {
      quote = JSON.parse(aiResponse);
    } catch (parseError) {
      console.log('Could not parse JSON response, creating fallback quote');
      const area = parseFloat(farmData.area) || 1;
      const baseRate = farmData.cropType === 'rice' ? 5000 : 
                      farmData.cropType === 'wheat' ? 4500 : 
                      farmData.cropType === 'cotton' ? 6000 : 5000;
      
      quote = {
        premium: Math.round(area * baseRate * 0.05),
        coverage: Math.round(area * baseRate),
        roi: 85,
        eligibility: true,
        recommendations: [
          "Maintain proper farm records for claim processing",
          "Follow recommended agricultural practices",
          "Report any crop damage within 48 hours"
        ],
        documents: [
          "Land ownership documents",
          "Aadhaar card",
          "Bank account details",
          "Previous year yield records"
        ]
      };
    }

    console.log('Insurance calculation completed successfully:', quote);

    return new Response(JSON.stringify(quote), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crop-insurance function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});