export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          category: string
          club_name: string | null
          created_at: string
          district: string | null
          email: string
          full_name: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          club_name?: string | null
          created_at?: string
          district?: string | null
          email: string
          full_name: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          club_name?: string | null
          created_at?: string
          district?: string | null
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      district_events: {
        Row: {
          created_at: string
          descrizione: string | null
          giorni_consecutivi: number | null
          giorno: number | null
          id: string
          luogo: string | null
          mese: number | null
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descrizione?: string | null
          giorni_consecutivi?: number | null
          giorno?: number | null
          id?: string
          luogo?: string | null
          mese?: number | null
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descrizione?: string | null
          giorni_consecutivi?: number | null
          giorno?: number | null
          id?: string
          luogo?: string | null
          mese?: number | null
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          settings: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          ai_summary: string | null
          background_template: string | null
          content: Json
          created_at: string
          document_number: string | null
          generated_pdf_url: string | null
          id: string
          logo_url: string | null
          signature_url: string | null
          status: string | null
          template_url: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          background_template?: string | null
          content: Json
          created_at?: string
          document_number?: string | null
          generated_pdf_url?: string | null
          id?: string
          logo_url?: string | null
          signature_url?: string | null
          status?: string | null
          template_url?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          background_template?: string | null
          content?: Json
          created_at?: string
          document_number?: string | null
          generated_pdf_url?: string | null
          id?: string
          logo_url?: string | null
          signature_url?: string | null
          status?: string | null
          template_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body: string
          created_at: string
          document_id: string | null
          id: string
          recipient_categories: string[]
          sent_at: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          document_id?: string | null
          id?: string
          recipient_categories: string[]
          sent_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          document_id?: string | null
          id?: string
          recipient_categories?: string[]
          sent_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      flyers: {
        Row: {
          additional_images: string[] | null
          created_at: string
          description: string
          format: string
          generated_image_url: string | null
          id: string
          logo_urls: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_images?: string[] | null
          created_at?: string
          description: string
          format: string
          generated_image_url?: string | null
          id?: string
          logo_urls?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_images?: string[] | null
          created_at?: string
          description?: string
          format?: string
          generated_image_url?: string | null
          id?: string
          logo_urls?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          club_name: string | null
          created_at: string
          default_footer_data: string | null
          default_location: string | null
          default_logo_url: string | null
          full_name: string
          header_text: string | null
          id: string
          president_name: string | null
          role: string | null
          secretary_name: string | null
          subscription_type: string | null
          trial_start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_name?: string | null
          created_at?: string
          default_footer_data?: string | null
          default_location?: string | null
          default_logo_url?: string | null
          full_name: string
          header_text?: string | null
          id?: string
          president_name?: string | null
          role?: string | null
          secretary_name?: string | null
          subscription_type?: string | null
          trial_start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_name?: string | null
          created_at?: string
          default_footer_data?: string | null
          default_location?: string | null
          default_logo_url?: string | null
          full_name?: string
          header_text?: string | null
          id?: string
          president_name?: string | null
          role?: string | null
          secretary_name?: string | null
          subscription_type?: string | null
          trial_start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_meetings: {
        Row: {
          created_at: string
          frequency_type: string
          frequency_value: Json
          id: string
          is_active: boolean
          location: string | null
          meeting_time: string
          meeting_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency_type: string
          frequency_value: Json
          id?: string
          is_active?: boolean
          location?: string | null
          meeting_time?: string
          meeting_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency_type?: string
          frequency_value?: Json
          id?: string
          is_active?: boolean
          location?: string | null
          meeting_time?: string
          meeting_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_meeting_dates: {
        Args: { months_ahead?: number; user_uuid: string }
        Returns: {
          location: string
          meeting_date: string
          meeting_time: string
          meeting_type: string
        }[]
      }
      generate_document_number: {
        Args: { doc_type: string; user_uuid: string }
        Returns: string
      }
      get_district_events_for_month: {
        Args: { target_month?: number; user_uuid: string }
        Returns: {
          data_evento: string
          descrizione: string
          luogo: string
          nome: string
        }[]
      }
      is_trial_valid: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
