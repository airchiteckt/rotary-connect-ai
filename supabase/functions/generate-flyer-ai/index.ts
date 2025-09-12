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

    // Call Gemini API to generate the image using the correct endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Gemini response:", result);

    // Extract the image data from the response
    const candidate = result.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error('No image generated in response');
    }

    // Find the part containing image data
    const imagePart = candidate.content.parts.find((part: any) => part.inlineData);
    if (!imagePart?.inlineData?.data) {
      throw new Error('No image data found in response');
    }

    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    return new Response(JSON.stringify({
      success: true,
      imageUrl: `data:${mimeType};base64,${imageData}`,
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
    professionale: 'minimalist and clean corporate design with elegant sans-serif typography',
    festa: 'vibrant and festive design with colorful elements and celebration motifs',
    club: 'modern club-style design with sophisticated layout and bold typography',
    service: 'community-focused design with warm colors and professional appearance',
    elegante: 'elegant and refined design with premium aesthetics and gold accent details',
    moderno: 'contemporary minimalist design with clean geometric lines and modern fonts'
  };

  const formatDescription = data.format === '1:1' 
    ? 'square poster format for social media'
    : 'vertical story format for mobile social media';

  // Optimize text for Imagen guidelines (max 25 characters per text element)
  const shortTitle = data.title.length > 25 ? data.title.substring(0, 22) + '...' : data.title;
  const shortSubtitle = data.subtitle && data.subtitle.length > 25 
    ? data.subtitle.substring(0, 22) + '...' 
    : data.subtitle;

  let prompt = `A ${styleDescriptions[data.style]} ${formatDescription} flyer. `;
  
  // Add main text elements following Imagen best practices
  if (shortTitle) {
    prompt += `Include the text "${shortTitle}" as the main title in large bold font. `;
  }
  
  if (shortSubtitle) {
    prompt += `Include the text "${shortSubtitle}" as subtitle in medium font. `;
  }
  
  // Add location and date as separate text elements if they're short enough
  if (data.location && data.location.length <= 20) {
    prompt += `Include the text "${data.location}" as location info in small font. `;
  }
  
  if (data.date) {
    const dateFormatted = new Date(data.date).toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    if (dateFormatted.length <= 20) {
      prompt += `Include the text "${dateFormatted}" as date info in small font. `;
    }
  }

  // Add design specifications
  if (data.hasLogos && data.logoDescriptions?.length) {
    prompt += `Include logo placeholder areas for: ${data.logoDescriptions.join(', ')}. `;
  } else {
    prompt += `Include space for organizational logo. `;
  }

  prompt += `Use ${styleDescriptions[data.style]} with proper hierarchy, balanced composition, and readable typography. `;
  prompt += `Professional social media design with clean layout and appropriate whitespace.`;

  return prompt;
}