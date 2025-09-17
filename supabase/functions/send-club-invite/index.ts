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
      .select('*')
      .eq('id', inviteId)
      .single();

    if (inviteError) {
      console.error('Error fetching invite:', inviteError);
      throw inviteError;
    }

    // Get club owner profile details
    const { data: ownerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, club_name')
      .eq('user_id', invite.user_id)
      .single();

    if (profileError) {
      console.error('Error fetching owner profile:', profileError);
      throw profileError;
    }

    console.log('Invite details:', invite);
    console.log('Owner profile:', ownerProfile);

    // Call the send-email function to send the club invite email
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'clubInvite',
        to: invite.email,
        data: {
          firstName: invite.first_name,
          lastName: invite.last_name,
          email: invite.email,
          clubName: ownerProfile.club_name,
          inviterName: ownerProfile.full_name,
          role: invite.role,
          expiresAt: invite.expires_at,
          registrationUrl: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'https://fastclub.it'}/auth?invite=${invite.invite_token}`
        }
      }
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    console.log('Club invite email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Club invite email sent successfully'
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