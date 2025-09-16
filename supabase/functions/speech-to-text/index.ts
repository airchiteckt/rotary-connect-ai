import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audioBase64, language = 'it' } = await req.json()
    
    if (!audioBase64) {
      throw new Error('Audio data is required')
    }

    console.log('Processing speech-to-text request with OpenAI Whisper...')

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    // Convert base64 to binary data
    const binaryString = atob(audioBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Create form data for OpenAI Whisper API
    const formData = new FormData()
    const audioBlob = new Blob([bytes], { type: 'audio/webm' })
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', language)
    formData.append('response_format', 'verbose_json')

    console.log('Calling OpenAI Whisper API...')

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI Whisper API error:', error)
      throw new Error(`OpenAI Whisper API error: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log('Whisper transcription result:', result)

    const transcript = result.text || ''
    const wordCount = transcript.split(' ').filter(word => word.length > 0).length
    
    // Whisper doesn't provide confidence scores, so we estimate based on duration
    const duration = result.duration || 0
    const estimatedConfidence = wordCount > 0 ? Math.min(0.9, 0.5 + (wordCount / 100)) : 0

    return new Response(
      JSON.stringify({ 
        transcript, 
        confidence: estimatedConfidence,
        language,
        wordCount,
        duration: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Speech-to-text error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})