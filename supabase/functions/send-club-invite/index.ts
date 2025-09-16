import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { inviteId } = await req.json();
    
    console.log('Processing invite:', inviteId);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get invite details
    const { data: invite, error: inviteError } = await supabase
      .from('club_invites')
      .select(`
        *,
        profiles!inner(full_name, club_name)
      `)
      .eq('id', inviteId)
      .single();

    if (inviteError) {
      console.error('Error fetching invite:', inviteError);
      throw inviteError;
    }

    console.log('Invite details:', invite);

    // For now, we'll just return success
    // In a real implementation, you would integrate with an email service like Resend
    const emailData = {
      to: invite.email,
      subject: `Invito al club ${invite.profiles.club_name}`,
      html: `
        <h2>Sei stato invitato a unirti al club ${invite.profiles.club_name}!</h2>
        <p>Ciao ${invite.first_name},</p>
        <p>${invite.profiles.full_name} ti ha invitato a unirti al club ${invite.profiles.club_name} come ${invite.role}.</p>
        <p>Per accettare l'invito, registrati su RotaryManager e usa il codice: <strong>${invite.invite_token}</strong></p>
        <p>L'invito scade il ${new Date(invite.expires_at).toLocaleDateString('it-IT')}</p>
        <p>Grazie!</p>
      `
    };

    console.log('Email would be sent:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invite processed successfully',
        emailData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-club-invite function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});