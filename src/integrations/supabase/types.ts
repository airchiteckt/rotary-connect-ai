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
      budgets: {
        Row: {
          allocated_amount: number
          category: string
          created_at: string
          id: string
          name: string
          notes: string | null
          period_end: string
          period_start: string
          spent_amount: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_amount: number
          category: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          period_end: string
          period_start: string
          spent_amount?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_amount?: number
          category?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          spent_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      club_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          first_name: string
          id: string
          invite_token: string
          last_name: string
          permissions: Database["public"]["Enums"]["app_section"][] | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          first_name: string
          id?: string
          invite_token: string
          last_name: string
          permissions?: Database["public"]["Enums"]["app_section"][] | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          first_name?: string
          id?: string
          invite_token?: string
          last_name?: string
          permissions?: Database["public"]["Enums"]["app_section"][] | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      club_members: {
        Row: {
          club_owner_id: string
          created_at: string
          id: string
          joined_at: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_owner_id: string
          created_at?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_owner_id?: string
          created_at?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          responsible_person: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          responsible_person: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          responsible_person?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      member_fees: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          fee_type: string
          id: string
          member_id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          fee_type?: string
          id?: string
          member_id: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          fee_type?: string
          id?: string
          member_id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_member_fees_member_id"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_member_fees_transaction_id"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      member_permissions: {
        Row: {
          club_owner_id: string
          created_at: string
          id: string
          is_responsible: boolean
          section: Database["public"]["Enums"]["app_section"]
          updated_at: string
          user_id: string
        }
        Insert: {
          club_owner_id: string
          created_at?: string
          id?: string
          is_responsible?: boolean
          section: Database["public"]["Enums"]["app_section"]
          updated_at?: string
          user_id: string
        }
        Update: {
          club_owner_id?: string
          created_at?: string
          id?: string
          is_responsible?: boolean
          section?: Database["public"]["Enums"]["app_section"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          created_at: string
          current_position: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          membership_start_date: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_position?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          membership_start_date: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_position?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          membership_start_date?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      position_history: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          member_id: string
          notes: string | null
          position: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          member_id: string
          notes?: string | null
          position: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          position?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prefecture_events: {
        Row: {
          ceremony_type: string | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          location: string | null
          notes: string | null
          participants: number | null
          protocol_document_url: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ceremony_type?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          location?: string | null
          notes?: string | null
          participants?: number | null
          protocol_document_url?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ceremony_type?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          participants?: number | null
          protocol_document_url?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      presidency_projects: {
        Row: {
          assigned_to: string | null
          budget: number | null
          commission_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          notes: string | null
          priority: string | null
          progress: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          budget?: number | null
          commission_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          progress?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          budget?: number | null
          commission_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          progress?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presidency_projects_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          bonus_months: number | null
          club_name: string | null
          club_slug: string | null
          created_at: string
          default_footer_data: string | null
          default_location: string | null
          default_logo_url: string | null
          full_name: string
          header_text: string | null
          id: string
          president_name: string | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          role: string | null
          secretary_name: string | null
          subscription_type: string | null
          trial_start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string | null
          bonus_months?: number | null
          club_name?: string | null
          club_slug?: string | null
          created_at?: string
          default_footer_data?: string | null
          default_location?: string | null
          default_logo_url?: string | null
          full_name: string
          header_text?: string | null
          id?: string
          president_name?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          role?: string | null
          secretary_name?: string | null
          subscription_type?: string | null
          trial_start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string | null
          bonus_months?: number | null
          club_name?: string | null
          club_slug?: string | null
          created_at?: string
          default_footer_data?: string | null
          default_location?: string | null
          default_logo_url?: string | null
          full_name?: string
          header_text?: string | null
          id?: string
          president_name?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          role?: string | null
          secretary_name?: string | null
          subscription_type?: string | null
          trial_start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      protocols: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_template: boolean | null
          status: string
          title: string
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_template?: boolean | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_template?: boolean | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          version?: number | null
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
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          member_id: string | null
          notes: string | null
          payment_method: string | null
          reference_number: string | null
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_method?: string | null
          reference_number?: string | null
          transaction_date?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_method?: string | null
          reference_number?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vip_guests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          organization: string | null
          phone: string | null
          protocol_notes: string | null
          special_requirements: string | null
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization?: string | null
          phone?: string | null
          protocol_notes?: string | null
          special_requirements?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization?: string | null
          phone?: string | null
          protocol_notes?: string | null
          special_requirements?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waiting_list: {
        Row: {
          city: string
          club_name: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          city: string
          club_name: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          updated_at?: string
        }
        Update: {
          city?: string
          club_name?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_club_invite: {
        Args: { invite_token_param: string }
        Returns: boolean
      }
      auto_confirm_invited_user: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      calculate_club_price: {
        Args: { member_count: number }
        Returns: number
      }
      calculate_next_meeting_dates: {
        Args: { months_ahead?: number; user_uuid: string }
        Returns: {
          location: string
          meeting_date: string
          meeting_time: string
          meeting_type: string
        }[]
      }
      generate_club_slug: {
        Args: { club_name_input: string }
        Returns: string
      }
      generate_document_number: {
        Args: { doc_type: string; user_uuid: string }
        Returns: string
      }
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_club_member_count: {
        Args: { club_owner_uuid: string }
        Returns: number
      }
      get_club_owner_id: {
        Args: { user_uuid: string }
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
      handle_referral_signup: {
        Args: { new_user_id: string; referral_code_input: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_trial_valid: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      user_has_section_permission: {
        Args: {
          club_owner_uuid: string
          section_name: string
          user_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_section:
        | "dashboard"
        | "segreteria"
        | "tesoreria"
        | "presidenza"
        | "prefettura"
        | "direttivo"
        | "comunicazione"
        | "soci"
        | "commissioni"
        | "organigramma"
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
    Enums: {
      app_section: [
        "dashboard",
        "segreteria",
        "tesoreria",
        "presidenza",
        "prefettura",
        "direttivo",
        "comunicazione",
        "soci",
        "commissioni",
        "organigramma",
      ],
    },
  },
} as const
