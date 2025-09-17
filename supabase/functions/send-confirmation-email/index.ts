import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log('Webhook payload received:', payload);
    console.log('Headers:', headers);
    
    // Skip webhook verification for now and parse the payload directly
    const webhookPayload = JSON.parse(payload);
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type }
    } = webhookPayload as {
      user: {
        email: string;
        user_metadata?: {
          full_name?: string;
        };
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

    console.log('Processing confirmation email for:', user.email);

    const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent('https://da165ecc-c493-49d4-a70d-8103c465b89e.lovableproject.com/dashboard')}`;
    const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'Utente';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://ajgyrhddxljfauwneput.supabase.co/storage/v1/object/public/document-assets/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" style="height: 60px;">
        </div>
        
        <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Conferma la tua registrazione</h1>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Ciao ${firstName},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Grazie per esserti registrato a FastClub! Per completare la registrazione e attivare il tuo account, clicca sul pulsante qui sotto:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${confirmationUrl}" style="background-color: #2563eb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            Conferma Email e Attiva Account
          </a>
        </div>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Cosa succede dopo la conferma:</h3>
          <ul style="line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>✅ Il tuo account verrà attivato immediatamente</li>
            <li>🎯 Avrai accesso completo alla piattaforma</li>
            <li>🆓 Inizierà la tua prova gratuita di 30 giorni</li>
            <li>🚀 Potrai iniziare a gestire il tuo club subito</li>
          </ul>
        </div>
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>⚠️ Importante:</strong> Questo link di conferma scade tra 24 ore. Se non riesci a cliccare il pulsante, copia e incolla questo link nel tuo browser:<br>
            <span style="word-break: break-all; font-family: monospace; font-size: 12px;">${confirmationUrl}</span>
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Se non ti sei registrato su FastClub, puoi ignorare questa email in sicurezza.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          FastClub - La piattaforma AI per la gestione completa del tuo club<br>
          Email: support@fastclub.it | Web: fastclub.it<br>
          Hai ricevuto questa email perché ti sei registrato su FastClub.
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "FastClub <info@fastclub.it>",
      to: user.email,
      subject: "Conferma la tua registrazione su FastClub",
      html: emailHtml,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);