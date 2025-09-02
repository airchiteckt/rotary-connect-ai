import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentGenerationRequest {
  type: 'verbali' | 'programmi' | 'comunicazioni' | 'circolari';
  currentContent: Record<string, any>;
  clubName?: string;
  additionalContext?: string;
}

const documentPrompts = {
  verbali: {
    system: "Sei un assistente specializzato nella creazione di verbali per club Rotary. Devi generare contenuti professionali, formali e dettagliati seguendo il protocollo Rotary.",
    generateContent: (content: any, clubName: string) => `
Genera il contenuto per un verbale di riunione del ${clubName} con le seguenti informazioni:
${Object.entries(content).map(([key, value]) => `${key}: ${value || 'da completare'}`).join('\n')}

Per ogni sezione mancante o incompleta, genera contenuto appropriato e professionale.
Mantieni un tono formale e rispetta il protocollo Rotary.
`
  },
  programmi: {
    system: "Sei un assistente specializzato nella creazione di programmi mensili per club Rotary. Genera contenuto strutturato in formato JSON che rispetti i valori Rotary di servizio e fellowship. Rispondi SOLO con JSON valido.",
    generateContent: (content: any, clubName: string) => `
Genera un oggetto JSON per il programma mensile del ${clubName} con queste specifiche:

Contenuto esistente:
${Object.entries(content).map(([key, value]) => `${key}: ${value || 'da definire'}`).join('\n')}

Genera un JSON con le seguenti strutture:
- mese: nome del mese in italiano (gennaio, febbraio, etc.)
- anno_rotariano: formato "A.R. YYYY-YYYY+1" 
- eventi: array di oggetti con {title, date (YYYY-MM-DD), location, time (HH:MM), description}
- riunioni: array di oggetti con {type (direttivo/assemblea/caminetto), date (YYYY-MM-DD), time (HH:MM), location}
- comunicazioni_presidente: messaggio formale del presidente
- progetti: testo sui progetti in corso
- service: testo sulle attività di service
- background_template: uno tra classic/modern/elegant/minimal

Crea eventi e riunioni realistici per il mese specificato. Usa date future appropriate.
`
  },
  comunicazioni: {
    system: "Sei un assistente specializzato nelle comunicazioni ufficiali per club Rotary. Crea contenuti chiari, professionali e coinvolgenti.",
    generateContent: (content: any, clubName: string) => `
Genera una comunicazione ufficiale per il ${clubName} con:
${Object.entries(content).map(([key, value]) => `${key}: ${value || 'da specificare'}`).join('\n')}

Mantieni un tono professionale ma accessibile, e assicurati che il messaggio sia chiaro e coinvolgente.
`
  },
  circolari: {
    system: "Sei un assistente specializzato nella creazione di circolari per club Rotary. Crea contenuti informativi, strutturati e di facile comprensione.",
    generateContent: (content: any, clubName: string) => `
Genera una circolare per il ${clubName} con:
${Object.entries(content).map(([key, value]) => `${key}: ${value || 'da completare'}`).join('\n')}

Struttura l'informazione in modo chiaro e logico, includendo tutti i dettagli necessari.
`
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, currentContent, clubName = "Rotary Club", additionalContext }: DocumentGenerationRequest = await req.json();

    console.log('Generating AI content for document type:', type);
    console.log('Current content:', currentContent);

    if (!documentPrompts[type]) {
      throw new Error(`Tipo di documento non supportato: ${type}`);
    }

    const prompt = documentPrompts[type];
    let userPrompt = prompt.generateContent(currentContent, clubName);
    
    if (additionalContext) {
      userPrompt += `\n\nContesto aggiuntivo: ${additionalContext}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: prompt.system
          },
          { 
            role: 'user', 
            content: userPrompt 
          }
        ],
        max_completion_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content successfully');

    // Parse the generated content to fill in missing fields
    const suggestions = parseGeneratedContent(generatedContent, type);

    return new Response(JSON.stringify({ 
      success: true,
      generatedContent,
      suggestions,
      summary: generateSummary(generatedContent)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-document-ai function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Errore interno del server'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseGeneratedContent(content: string, type: string): Record<string, any> {
  // For programmi type, try to parse as JSON first
  if (type === 'programmi') {
    try {
      const jsonContent = JSON.parse(content);
      console.log('Successfully parsed JSON content for programmi:', jsonContent);
      return jsonContent;
    } catch (e) {
      console.log('Failed to parse as JSON, falling back to text parsing');
    }
  }
  
  // Basic parsing logic to extract structured content
  const suggestions: Record<string, string> = {};
  
  // Split content into sections based on common patterns
  const lines = content.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Look for patterns like "Campo: Valore" or "**Campo**: Valore"
    const match = line.match(/^[\*]*([^:]+):[\*]*\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();
      suggestions[key] = value;
    }
  }
  
  // If no structured content found, provide the whole content as main content
  if (Object.keys(suggestions).length === 0) {
    switch (type) {
      case 'verbali':
        suggestions['delibere'] = content;
        break;
      case 'programmi':
        // Fallback for programmi - create basic structure
        const currentYear = new Date().getFullYear();
        suggestions['mese'] = 'gennaio';
        suggestions['anno_rotariano'] = `A.R. ${currentYear}-${currentYear + 1}`;
        suggestions['eventi'] = [];
        suggestions['riunioni'] = [];
        suggestions['comunicazioni_presidente'] = content;
        suggestions['progetti'] = 'Progetti in corso di definizione';
        suggestions['service'] = 'Attività di service in programma';
        suggestions['background_template'] = 'classic';
        break;
      case 'comunicazioni':
        suggestions['corpo'] = content;
        break;
      case 'circolari':
        suggestions['contenuto'] = content;
        break;
    }
  }
  
  return suggestions;
}

function generateSummary(content: string): string {
  // Generate a brief summary of the content
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const firstSentences = sentences.slice(0, 2).join('. ');
  return firstSentences + (sentences.length > 2 ? '...' : '');
}