export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string;
          role: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          action: string;
          actor: string | null;
          created_at: string;
          diff: Json | null;
          entity: string;
          entity_id: string | null;
          id: number;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor?: string | null;
          created_at?: string;
          diff?: Json | null;
          entity: string;
          entity_id?: string | null;
          id?: number;
        };
        Update: {
          action?: string;
          actor?: string | null;
          created_at?: string;
          diff?: Json | null;
          entity?: string;
          entity_id?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      notification_queue: {
        Row: {
          attempts: number;
          channel: string;
          created_at: string;
          id: number;
          idempotency_key: string;
          kind: string;
          last_error: string | null;
          payload: NonNullable<Json>;
          scheduled_for: string;
          sent_at: string | null;
          status: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          attempts?: number;
          channel?: string;
          created_at?: string;
          id?: number;
          idempotency_key: string;
          kind: string;
          last_error?: string | null;
          payload?: NonNullable<Json>;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          attempts?: number;
          channel?: string;
          created_at?: string;
          id?: number;
          idempotency_key?: string;
          kind?: string;
          last_error?: string | null;
          payload?: NonNullable<Json>;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_settings: {
        Row: {
          created_at: string;
          deadline_days: number[];
          digest_frequency: string;
          email_enabled: boolean;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          deadline_days?: number[];
          digest_frequency?: string;
          email_enabled?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deadline_days?: number[];
          digest_frequency?: string;
          email_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          age_max: number | null;
          age_min: number | null;
          application_url: string;
          city: string | null;
          country: string | null;
          created_at: string;
          created_by: string | null;
          currency: string | null;
          deadline_date: string | null;
          deadline_type: string;
          duration_months: number | null;
          education_levels: string[];
          fields_of_study: string[];
          funding_details: string | null;
          funding_type: string;
          gpa_scale: number | null;
          id: string;
          is_demo: boolean;
          is_featured: boolean;
          is_hybrid: boolean;
          is_remote: boolean;
          is_verified: boolean;
          language_requirements: NonNullable<Json>;
          last_verified_at: string | null;
          min_gpa: number | null;
          nationality_countries: string[];
          nationality_rule: string;
          organization_id: string | null;
          region: string | null;
          required_documents: string[];
          saves_count: number;
          search_text: string | null;
          search_vector: unknown;
          slug: string;
          source_url: string;
          start_date: string | null;
          status: string;
          stipend_amount: number | null;
          type: string;
          updated_at: string;
          uzbekistan_eligible: boolean;
          views_count: number;
        };
        ComputedFields: never;
        Insert: {
          age_max?: number | null;
          age_min?: number | null;
          application_url: string;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string | null;
          deadline_date?: string | null;
          deadline_type?: string;
          duration_months?: number | null;
          education_levels?: string[];
          fields_of_study?: string[];
          funding_details?: string | null;
          funding_type?: string;
          gpa_scale?: number | null;
          id?: string;
          is_demo?: boolean;
          is_featured?: boolean;
          is_hybrid?: boolean;
          is_remote?: boolean;
          is_verified?: boolean;
          language_requirements?: NonNullable<Json>;
          last_verified_at?: string | null;
          min_gpa?: number | null;
          nationality_countries?: string[];
          nationality_rule?: string;
          organization_id?: string | null;
          region?: string | null;
          required_documents?: string[];
          saves_count?: number;
          search_text?: string | null;
          search_vector?: unknown;
          slug: string;
          source_url: string;
          start_date?: string | null;
          status?: string;
          stipend_amount?: number | null;
          type: string;
          updated_at?: string;
          uzbekistan_eligible?: boolean;
          views_count?: number;
        };
        Update: {
          age_max?: number | null;
          age_min?: number | null;
          application_url?: string;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string | null;
          deadline_date?: string | null;
          deadline_type?: string;
          duration_months?: number | null;
          education_levels?: string[];
          fields_of_study?: string[];
          funding_details?: string | null;
          funding_type?: string;
          gpa_scale?: number | null;
          id?: string;
          is_demo?: boolean;
          is_featured?: boolean;
          is_hybrid?: boolean;
          is_remote?: boolean;
          is_verified?: boolean;
          language_requirements?: NonNullable<Json>;
          last_verified_at?: string | null;
          min_gpa?: number | null;
          nationality_countries?: string[];
          nationality_rule?: string;
          organization_id?: string | null;
          region?: string | null;
          required_documents?: string[];
          saves_count?: number;
          search_text?: string | null;
          search_vector?: unknown;
          slug?: string;
          source_url?: string;
          start_date?: string | null;
          status?: string;
          stipend_amount?: number | null;
          type?: string;
          updated_at?: string;
          uzbekistan_eligible?: boolean;
          views_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunities_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_translations: {
        Row: {
          benefits: string | null;
          created_at: string;
          description_md: string | null;
          how_to_apply: string | null;
          locale: string;
          opportunity_id: string;
          short_summary: string | null;
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          benefits?: string | null;
          created_at?: string;
          description_md?: string | null;
          how_to_apply?: string | null;
          locale: string;
          opportunity_id: string;
          short_summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          benefits?: string | null;
          created_at?: string;
          description_md?: string | null;
          how_to_apply?: string | null;
          locale?: string;
          opportunity_id?: string;
          short_summary?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_translations_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          logo_url: string | null;
          name: string;
          updated_at: string;
          website: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name: string;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name?: string;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          citizenship: string;
          created_at: string;
          date_of_birth: string | null;
          education_level: string | null;
          fields_of_study: string[];
          full_name: string | null;
          funding_need: string;
          gpa: number | null;
          gpa_scale: number | null;
          graduation_year: number | null;
          interested_countries: string[];
          interested_regions: string[];
          interested_types: string[];
          language_certificates: NonNullable<Json>;
          onboarding_completed_at: string | null;
          preferred_locale: string;
          theme: string;
          university: string | null;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          avatar_url?: string | null;
          citizenship?: string;
          created_at?: string;
          date_of_birth?: string | null;
          education_level?: string | null;
          fields_of_study?: string[];
          full_name?: string | null;
          funding_need?: string;
          gpa?: number | null;
          gpa_scale?: number | null;
          graduation_year?: number | null;
          interested_countries?: string[];
          interested_regions?: string[];
          interested_types?: string[];
          language_certificates?: NonNullable<Json>;
          onboarding_completed_at?: string | null;
          preferred_locale?: string;
          theme?: string;
          university?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          citizenship?: string;
          created_at?: string;
          date_of_birth?: string | null;
          education_level?: string | null;
          fields_of_study?: string[];
          full_name?: string | null;
          funding_need?: string;
          gpa?: number | null;
          gpa_scale?: number | null;
          graduation_year?: number | null;
          interested_countries?: string[];
          interested_regions?: string[];
          interested_types?: string[];
          language_certificates?: NonNullable<Json>;
          onboarding_completed_at?: string | null;
          preferred_locale?: string;
          theme?: string;
          university?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          opportunity_id: string;
          reason: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          opportunity_id: string;
          reason: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          opportunity_id?: string;
          reason?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_opportunities: {
        Row: {
          created_at: string;
          opportunity_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          opportunity_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          opportunity_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_opportunities_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_searches: {
        Row: {
          alert_frequency: string;
          created_at: string;
          filters: NonNullable<Json>;
          id: string;
          last_sent_at: string | null;
          name: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          alert_frequency?: string;
          created_at?: string;
          filters: NonNullable<Json>;
          id?: string;
          last_sent_at?: string | null;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          alert_frequency?: string;
          created_at?: string;
          filters?: NonNullable<Json>;
          id?: string;
          last_sent_at?: string | null;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      suggestions: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          status: string;
          updated_at: string;
          url: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          status?: string;
          updated_at?: string;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          status?: string;
          updated_at?: string;
          url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tracker_entries: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          opportunity_id: string;
          reminder_date: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          opportunity_id: string;
          reminder_date?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          opportunity_id?: string;
          reminder_date?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tracker_entries_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          },
        ];
      };
      user_events: {
        Row: {
          created_at: string;
          event: string;
          id: number;
          opportunity_id: string | null;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          event: string;
          id?: number;
          opportunity_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          event?: string;
          id?: number;
          opportunity_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_events_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      archive_expired: { Args: Record<PropertyKey, never>; Returns: number };
      is_admin: { Args: { p_user_id?: string }; Returns: boolean };
      is_iso_country_list: { Args: { p_countries: string[] }; Returns: boolean };
      is_staff: { Args: { p_user_id?: string }; Returns: boolean };
      refresh_opportunity_search: { Args: { p_opportunity_id: string }; Returns: undefined };
      search_opportunities: {
        Args: { p_params?: Json };
        Returns: {
          city: string;
          country: string;
          deadline_date: string;
          deadline_type: string;
          funding_type: string;
          id: string;
          is_demo: boolean;
          is_featured: boolean;
          is_hybrid: boolean;
          is_remote: boolean;
          is_verified: boolean;
          organization_name: string;
          region: string;
          saves_count: number;
          short_summary: string;
          slug: string;
          title: string;
          total_count: number;
          type: string;
          views_count: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
