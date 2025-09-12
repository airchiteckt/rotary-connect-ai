import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlyerRequest {
  title: string;
  subtitle?: string;
  location?: string;
  date?: string;
  additionalInfo?: string;
  style: 'professionale' | 'festa' | 'club' | 'service' | 'elegante' | 'moderno';
  format: '1:1' | '9:16';
  hasLogos: boolean;
  logoDescriptions?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const flyerData: FlyerRequest = await req.json();
    
    // Create a detailed prompt for Gemini based on the flyer data
    const prompt = createFlyerPrompt(flyerData);
    
    console.log("Generating flyer with prompt:", prompt);

    // Call Gemini API to generate the image
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        config: {
          aspectRatio: flyerData.format === '1:1' ? 'ASPECT_RATIO_1_1' : 'ASPECT_RATIO_9_16',
          safetyFilterLevel: 'BLOCK_ONLY_HIGH',
          personGeneration: 'ALLOW_ADULT'
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Gemini response:", result);

    return new Response(JSON.stringify({
      success: true,
      imageData: result.candidates?.[0]?.content || result.image,
      prompt: prompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-flyer-ai function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createFlyerPrompt(data: FlyerRequest): string {
  const styleDescriptions = {
    professionale: 'professional, clean, corporate design with elegant typography and sophisticated color scheme',
    festa: 'festive, colorful, fun design with vibrant colors and celebration elements',
    club: 'club-style design with modern typography and sophisticated layout',
    service: 'service-oriented design emphasizing community and helping others',
    elegante: 'elegant and refined design with premium aesthetics and gold accents',
    moderno: 'modern minimalist design with clean lines and contemporary style'
  };

  const formatDescription = data.format === '1:1' 
    ? 'square format suitable for Instagram and Facebook posts'
    : 'vertical format perfect for Instagram stories';

  let prompt = `Create a ${styleDescriptions[data.style]} flyer in ${formatDescription}. `;
  
  if (data.title) {
    prompt += `Main title: "${data.title}". `;
  }
  
  if (data.subtitle) {
    prompt += `Subtitle: "${data.subtitle}". `;
  }
  
  if (data.location) {
    prompt += `Location: ${data.location}. `;
  }
  
  if (data.date) {
    prompt += `Date: ${data.date}. `;
  }
  
  if (data.additionalInfo) {
    prompt += `Additional information: ${data.additionalInfo}. `;
  }

  if (data.hasLogos && data.logoDescriptions?.length) {
    prompt += `Include these logo elements: ${data.logoDescriptions.join(', ')}. `;
  } else {
    prompt += `Include space for organizational logos. `;
  }

  prompt += `Design should be eye-catching, readable, and professionally designed for social media sharing. Include appropriate whitespace, hierarchy, and visual balance. Use colors that match the ${data.style} style theme.`;

  return prompt;
}