import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogoData {
  description: string;
  data: string; // base64 encoded image data
  mimeType: string;
}

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
  logos?: LogoData[];
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
    
    console.log("Generated prompt:", prompt);
    console.log("Logos being sent:", flyerData.logos?.length || 0);

    // Build the content parts - include text prompt and any logos
    const contentParts: any[] = [{ text: prompt }];
    
    // Add logos as additional content parts if provided
    if (flyerData.logos && flyerData.logos.length > 0) {
      console.log(`Adding ${flyerData.logos.length} logos to the request`);
      flyerData.logos.forEach((logo, index) => {
        console.log(`Logo ${index + 1}: ${logo.description}, MIME: ${logo.mimeType}`);
        contentParts.push({
          inlineData: {
            mimeType: logo.mimeType,
            data: logo.data
          }
        });
      });
    }

    console.log("Total content parts:", contentParts.length);

    // Call Gemini API to generate the image using the correct endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: contentParts
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
    professionale: 'minimalist corporate design with clean lines, professional typography, and elegant color scheme using blues and grays',
    festa: 'vibrant festive design with bright colors, celebratory elements, and playful typography',
    club: 'sophisticated club design with modern fonts, premium layout, and refined aesthetics',
    service: 'community-focused design with warm colors, inclusive imagery, and approachable typography',
    elegante: 'elegant refined design with premium aesthetics, gold accents, and luxury typography',
    moderno: 'contemporary minimalist design with geometric shapes, modern fonts, and clean composition'
  };

  const formatInfo = data.format === '1:1' 
    ? 'square social media post format (1080x1080 pixels)'
    : 'vertical Instagram story format (1080x1920 pixels)';

  // Ensure text fits Imagen requirements (max 25 characters per element)
  const processText = (text: string, maxLength: number = 25) => {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  const titleText = processText(data.title, 20);
  const subtitleText = data.subtitle ? processText(data.subtitle, 25) : null;
  const locationText = data.location ? processText(data.location, 20) : null;
  
  // Format date in Italian style
  let dateText = null;
  if (data.date) {
    const date = new Date(data.date);
    dateText = date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  // Build comprehensive prompt
  let prompt = `Create a professional ${formatInfo} flyer with ${styleDescriptions[data.style]}. `;
  
  // Main content structure
  prompt += `The flyer must include the following text elements arranged hierarchically: `;
  
  // Title - most prominent
  prompt += `Main title "${titleText}" in large bold font at the top. `;
  
  // Subtitle if provided
  if (subtitleText) {
    prompt += `Subtitle "${subtitleText}" in medium font below the title. `;
  }
  
  // Event details section
  if (locationText || dateText) {
    prompt += `Event details section with: `;
    if (dateText) {
      prompt += `Date "${dateText}" `;
    }
    if (locationText) {
      prompt += `Location "${locationText}" `;
    }
    prompt += `in smaller readable font. `;
  }
  
  // Additional info if provided
  if (data.additionalInfo && data.additionalInfo.trim()) {
    const additionalText = processText(data.additionalInfo, 30);
    prompt += `Additional information "${additionalText}" in small font. `;
  }
  
  // Logo integration instructions
  if (data.logos && data.logos.length > 0) {
    prompt += `IMPORTANT: Seamlessly integrate and properly display the ${data.logos.length} provided logo image${data.logos.length > 1 ? 's' : ''} into the design. `;
    prompt += `Place the logo${data.logos.length > 1 ? 's' : ''} prominently but harmoniously within the layout. `;
    prompt += `Ensure logo${data.logos.length > 1 ? 's are' : ' is'} clearly visible and well-integrated with the text elements. `;
    
    if (data.logoDescriptions && data.logoDescriptions.length > 0) {
      prompt += `Logo context: ${data.logoDescriptions.join(', ')}. `;
    }
  } else {
    prompt += `Reserve appropriate space for organizational logo placement. `;
  }
  
  // Design quality requirements
  prompt += `Ensure: clean composition with proper whitespace, excellent readability of all text, `;
  prompt += `professional color harmony, balanced visual hierarchy, and eye-catching design suitable for social media. `;
  prompt += `Use high contrast between text and background for maximum readability. `;
  prompt += `The overall design should be polished, modern, and attention-grabbing while maintaining the ${data.style} aesthetic.`;

  console.log('Generated prompt:', prompt);
  return prompt;
}