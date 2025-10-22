import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'confirmation' | 'notification' | 'campaign' | 'clubInvite' | 'support';
  to: string | string[];
  subject?: string;
  data?: Record<string, any>;
}

const emailTemplates = {
  welcome: {
    subject: (data: any) => `Benvenuto in FastClub, ${data.firstName || 'Socio'}!`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://ajgyrhddxljfauwneput.supabase.co/storage/v1/object/public/document-assets/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" style="height: 60px;">
        </div>
        
        <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Benvenuto in FastClub!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Ciao ${data.firstName || 'Socio'},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Grazie per esserti iscritto alla waiting list di FastClub! Siamo entusiasti di averti con noi.
        </p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Cosa puoi aspettarti da FastClub:</h3>
          <ul style="line-height: 1.8;">
            <li>📋 Gestione completa dei documenti del club</li>
            <li>🤖 Generazione AI di verbali e programmi</li>
            <li>👥 Sistema di gestione soci integrato</li>
            <li>📊 Dashboard con analytics avanzate</li>
            <li>📱 Interfaccia responsive per tutti i dispositivi</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Ti terremo aggiornato sui progressi e sarai tra i primi a ricevere l'accesso quando sarà disponibile.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://fastclub.lovableproject.com" style="background-color: hsl(210, 100%, 45%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Scopri di più su FastClub
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          FastClub - La piattaforma AI per la gestione completa del tuo club<br>
          Email: info@fastclub.it | Web: www.fastclub.it<br>
          Hai ricevuto questa email perché ti sei iscritto alla waiting list di FastClub.
        </p>
      </div>
    `
  },
  
  confirmation: {
    subject: (data: any) => data.subject || 'Conferma da FastClub',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://ajgyrhddxljfauwneput.supabase.co/storage/v1/object/public/document-assets/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" style="height: 60px;">
        </div>
        
        <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">${data.title || 'Conferma'}</h1>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0;">
            ${data.message || 'La tua richiesta è stata elaborata con successo.'}
          </p>
        </div>
        
        ${data.action ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || '#'}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ${data.action}
            </a>
          </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          FastClub - La piattaforma digitale per il tuo club
        </p>
      </div>
    `
  },
  
  notification: {
    subject: (data: any) => data.subject || 'Notifica da FastClub',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://ajgyrhddxljfauwneput.supabase.co/storage/v1/object/public/document-assets/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" style="height: 60px;">
        </div>
        
        <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">${data.title || 'Notifica'}</h1>
        
        <div style="font-size: 16px; line-height: 1.6;">
          ${data.content || data.message || 'Hai una nuova notifica da FastClub.'}
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          FastClub - La piattaforma digitale per il tuo club
        </p>
      </div>
    `
  },
  
  clubInvite: {
    subject: (data: any) => `Invito al club ${data.clubName || 'FastClub'}`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://ajgyrhddxljfauwneput.supabase.co/storage/v1/object/public/document-assets/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" style="height: 60px;">
        </div>
        
        <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Sei stato invitato su FastClub!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Ciao ${data.firstName || 'Caro collega'},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          <strong>${data.inviterName || 'Un amministratore'}</strong> ti ha invitato a unirti al club <strong>${data.clubName || 'FastClub'}</strong> come <strong>${data.role || 'membro'}</strong>.
        </p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Per accettare l'invito:</h3>
          <ol style="line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Registrati su FastClub usando questo link</li>
            <li>Completa la registrazione con la stessa email (${data.email})</li>
            <li>Il tuo account verrà automaticamente collegato al club</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${data.registrationUrl || 'https://fastclub.lovableproject.com/auth?tab=signup'}" style="background-color: hsl(210, 100%, 45%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            Registrati su FastClub
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>⚠️ Importante:</strong> Questo invito scade il ${data.expiresAt ? new Date(data.expiresAt).toLocaleDateString('it-IT', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : '7 giorni'}. Non perdere l'opportunità di unirti al team!
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          FastClub - La piattaforma AI per la gestione completa del tuo club<br>
          Email: info@fastclub.it | Web: www.fastclub.it<br>
          Hai ricevuto questa email perché sei stato invitato a unirti a ${data.clubName || 'un club'} su FastClub.
        </p>
      </div>
    `
  },

  campaign: {
    subject: (data: any) => data.subject || 'Aggiornamenti da FastClub',
    html: (data: any) => data.html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://ajgyrhddxljfauwneput.supabase.co/storage/v1/object/public/document-assets/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" style="height: 60px;">
        </div>
        
        <div style="font-size: 16px; line-height: 1.6;">
          ${data.content || 'Contenuto della campagna email.'}
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          FastClub - La piattaforma digitale per il tuo club
        </p>
      </div>
    `
  },

  support: {
    subject: (data: any) => `[TICKET SUPPORTO] ${data.subject || 'Richiesta di supporto'}`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://ajgyrhddxljfauwneput.supabase.co/storage/v1/object/public/document-assets/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" style="height: 60px;">
        </div>
        
        <h1 style="color: #dc2626; text-align: center; margin-bottom: 30px;">🎫 Nuovo Ticket di Supporto</h1>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <h3 style="color: #b91c1c; margin-top: 0;">Dettagli del Ticket</h3>
          <p><strong>Tipo:</strong> ${data.type || 'Non specificato'}</p>
          <p><strong>Priorità:</strong> ${data.priority || 'Media'}</p>
          <p><strong>Oggetto:</strong> ${data.subject || 'Non specificato'}</p>
          <p><strong>Email utente:</strong> ${data.userEmail || 'Non disponibile'}</p>
          <p><strong>Nome utente:</strong> ${data.userName || 'Non disponibile'}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Descrizione del Problema</h3>
          <p style="font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${data.description || 'Nessuna descrizione fornita'}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          FastClub - Sistema di Supporto Tecnico<br>
          Ticket generato automaticamente dalla piattaforma
        </p>
      </div>
    `
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set');
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { type, to, subject, data = {} }: EmailRequest = await req.json();

    console.log('Received email request:', { type, to: Array.isArray(to) ? `${to.length} recipients` : to, data });

    if (!type || !to) {
      throw new Error('Missing required fields: type and to');
    }

    if (!emailTemplates[type]) {
      throw new Error(`Invalid email type: ${type}`);
    }

    const template = emailTemplates[type];
    const emailSubject = subject || template.subject(data);
    const emailHtml = template.html(data);

    const recipients = Array.isArray(to) ? to : [to];

    // Send emails (Resend supports bulk sending)
    // Using onboarding@resend.dev as fallback if custom domain is not verified
    const emailResponse = await resend.emails.send({
      from: "FastClub <onboarding@resend.dev>",
      to: recipients,
      subject: emailSubject,
      html: emailHtml,
      reply_to: "info@fastclub.it"
    });

    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse,
      recipients: recipients.length 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error);
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