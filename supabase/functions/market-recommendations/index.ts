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
    const { location, season } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing market recommendations request:', { location, season });

    const prompt = `Generate current market recommendations for farmers in ${location || 'general location'} during ${season || 'current'} season.

Please provide:
1. Top 3 crops with high market demand
2. Current market prices per ton
3. Market trend (increasing/stable/decreasing)
4. Brief market insights

Respond in JSON format as an array of 3 objects, each with fields: crop, price, trend, insight`;

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
          temperature: 0.4,
          topK: 30,
          topP: 0.9,
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
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';

    // Try to parse JSON response, fallback to default recommendations if parsing fails
    let recommendations;
    try {
      recommendations = JSON.parse(aiResponse);
    } catch (parseError) {
      console.log('Could not parse JSON response, creating fallback recommendations');
      recommendations = [
        {
          crop: "Tomatoes",
          price: "$450/ton",
          trend: "increasing",
          insight: "High demand due to seasonal factors and export opportunities."
        },
        {
          crop: "Rice",
          price: "$320/ton", 
          trend: "stable",
          insight: "Consistent demand with stable pricing throughout the year."
        },
        {
          crop: "Corn",
          price: "$280/ton",
          trend: "increasing", 
          insight: "Growing demand from livestock feed industry."
        }
      ];
    }

    console.log('Market recommendations generated successfully:', recommendations);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market-recommendations function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});