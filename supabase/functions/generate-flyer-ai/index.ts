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
    professionale: 'minimalist corporate design with clean lines, professional sans-serif typography, elegant blue and gray color scheme',
    festa: 'vibrant festive design with bright celebratory colors, playful typography, confetti and party elements',
    club: 'sophisticated club design with modern bold fonts, premium dark tones, refined layout and elegant accents',
    service: 'community-focused design with warm welcoming colors, inclusive imagery, approachable typography and humanitarian elements',
    elegante: 'elegant refined design with premium gold and silver accents, luxury serif typography, sophisticated composition',
    moderno: 'contemporary minimalist design with geometric shapes, ultra-modern sans-serif fonts, clean white space and bold contrasts'
  };

  // Exact Instagram specifications
  const formatSpecs = data.format === '1:1' 
    ? 'Instagram/Facebook post format (1080x1080 pixels, perfect square ratio)'
    : 'Instagram Story format (1080x1920 pixels, vertical 9:16 aspect ratio)';

  // Ensure all text fits Imagen requirements and is comprehensive
  const processText = (text: string, maxLength: number = 25) => {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  // Process all collected information
  const titleText = processText(data.title, 20);
  const subtitleText = data.subtitle?.trim() ? processText(data.subtitle.trim(), 25) : null;
  const locationText = data.location?.trim() ? processText(data.location.trim(), 20) : null;
  const additionalInfoText = data.additionalInfo?.trim() ? processText(data.additionalInfo.trim(), 30) : null;
  
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

  // Build comprehensive and detailed prompt
  let prompt = `Create a professional high-quality ${formatSpecs} flyer with ${styleDescriptions[data.style]}. `;
  
  // EXACT DIMENSIONS SPECIFICATION
  if (data.format === '1:1') {
    prompt += `Design specifications: 1080x1080 pixels, perfect square format for Instagram and Facebook posts. `;
  } else {
    prompt += `Design specifications: 1080x1920 pixels, vertical story format (9:16 ratio) for Instagram Stories. `;
  }
  
  // STRUCTURED CONTENT HIERARCHY - Include ALL collected information
  prompt += `Content structure from top to bottom: `;
  
  // 1. MAIN TITLE (always present)
  prompt += `PRIMARY TITLE: "${titleText}" - display as the main heading in large, bold, eye-catching typography at the top center. `;
  
  // 2. SUBTITLE (if provided)
  if (subtitleText) {
    prompt += `SECONDARY SUBTITLE: "${subtitleText}" - place directly below the main title in medium-sized font, complementary to main title. `;
  }
  
  // 3. EVENT DETAILS SECTION (if any provided)
  if (dateText || locationText) {
    prompt += `EVENT DETAILS section in the middle area: `;
    if (dateText) {
      prompt += `DATE: "${dateText}" displayed prominently `;
    }
    if (locationText) {
      prompt += `LOCATION: "${locationText}" clearly visible `;
    }
    prompt += `- format these details in readable, structured typography. `;
  }
  
  // 4. ADDITIONAL INFORMATION (body content)
  if (additionalInfoText) {
    prompt += `BODY CONTENT: "${additionalInfoText}" - include this important information in the lower section in clear, readable font. `;
  }
  
  // 5. LOGO INTEGRATION (if provided)
  if (data.logos && data.logos.length > 0) {
    prompt += `CRITICAL: Integrate and display the ${data.logos.length} provided logo image${data.logos.length > 1 ? 's' : ''} prominently in the design. `;
    prompt += `Place the logo${data.logos.length > 1 ? 's' : ''} strategically (typically top-left, top-right, or bottom) ensuring high visibility and professional integration. `;
    prompt += `The logo${data.logos.length > 1 ? 's must' : ' must'} be clearly visible, properly scaled, and harmoniously integrated with all text elements. `;
    
    if (data.logoDescriptions && data.logoDescriptions.length > 0) {
      prompt += `Logo descriptions for context: ${data.logoDescriptions.join(', ')}. `;
    }
  } else {
    prompt += `Reserve dedicated space for organizational logo placement (typically in header or footer area). `;
  }
  
  // DESIGN QUALITY REQUIREMENTS
  prompt += `ESSENTIAL DESIGN REQUIREMENTS: `;
  prompt += `Perfect visual hierarchy with title most prominent, subtitle secondary, details tertiary. `;
  prompt += `High contrast text on background for maximum readability. `;
  prompt += `Balanced composition with appropriate white space. `;
  prompt += `Professional color coordination matching ${data.style} aesthetic. `;
  prompt += `Typography must be legible at social media viewing sizes. `;
  prompt += `Overall design should be eye-catching, modern, and share-worthy for social media platforms. `;
  
  console.log('Generated comprehensive prompt with all data:', prompt);
  console.log('Data being processed:', {
    title: data.title,
    subtitle: data.subtitle,
    location: data.location,
    date: data.date,
    additionalInfo: data.additionalInfo,
    style: data.style,
    format: data.format,
    logosCount: data.logos?.length || 0
  });
  
  return prompt;
}