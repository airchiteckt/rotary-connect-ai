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
    const { audioBase64, language = 'it-IT' } = await req.json()
    
    if (!audioBase64) {
      throw new Error('Audio data is required')
    }

    console.log('Processing speech-to-text request...')

    // Convert base64 audio to bytes
    const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))

    // Prepare request for Google Cloud Speech API
    const speechRequest = {
      audio: {
        content: audioBase64
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: language,
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        model: 'latest_long',
        useEnhanced: true
      }
    }

    // Call Google Cloud Speech-to-Text API
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${Deno.env.get('GOOGLE_CLOUD_API_KEY')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(speechRequest),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Google Cloud Speech API error:', error)
      throw new Error(`Google Cloud Speech API error: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log('Speech recognition result:', result)

    // Extract transcript from response
    let transcript = ''
    let confidence = 0
    
    if (result.results && result.results.length > 0) {
      transcript = result.results
        .map((r: any) => r.alternatives[0]?.transcript || '')
        .join(' ')
        .trim()
      
      confidence = result.results[0]?.alternatives[0]?.confidence || 0
    }

    return new Response(
      JSON.stringify({ 
        transcript, 
        confidence,
        language,
        wordCount: transcript.split(' ').length 
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