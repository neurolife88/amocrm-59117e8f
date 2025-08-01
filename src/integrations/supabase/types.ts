export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cities_directory: {
        Row: {
          airport_code: string | null
          city_name: string
          created_at: string | null
          id: number
          railway_station_name: string | null
          updated_at: string | null
        }
        Insert: {
          airport_code?: string | null
          city_name: string
          created_at?: string | null
          id?: number
          railway_station_name?: string | null
          updated_at?: string | null
        }
        Update: {
          airport_code?: string | null
          city_name?: string
          created_at?: string | null
          id?: number
          railway_station_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clinics_directory: {
        Row: {
          address_chinese: string | null
          address_english: string | null
          created_at: string | null
          full_name: string
          id: number
          short_name: string
          updated_at: string | null
        }
        Insert: {
          address_chinese?: string | null
          address_english?: string | null
          created_at?: string | null
          full_name: string
          id?: number
          short_name: string
          updated_at?: string | null
        }
        Update: {
          address_chinese?: string | null
          address_english?: string | null
          created_at?: string | null
          full_name?: string
          id?: number
          short_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          amocrm_contact_id: number
          birthday: string | null
          city: string | null
          country: string | null
          created_at: string | null
          deal_id: number | null
          first_name: string | null
          id: number
          last_name: string | null
          passport_number: string | null
          position: string | null
          preferred_name: string | null
          timezone: string | null
          updated_at: string | null
          work_email: string | null
          work_phone: string | null
        }
        Insert: {
          amocrm_contact_id: number
          birthday?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deal_id?: number | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          passport_number?: string | null
          position?: string | null
          preferred_name?: string | null
          timezone?: string | null
          updated_at?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Update: {
          amocrm_contact_id?: number
          birthday?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deal_id?: number | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          passport_number?: string | null
          position?: string | null
          preferred_name?: string | null
          timezone?: string | null
          updated_at?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "super_admin_master_view"
            referencedColumns: ["deal_id"]
          },
        ]
      }
      contacts_oll: {
        Row: {
          amocrm_contact_id: number
          birthday: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          deal_id: number | null
          email: string | null
          full_name: string | null
          id: number
          phone: string | null
          position: string | null
          timezone: string | null
        }
        Insert: {
          amocrm_contact_id: number
          birthday?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          deal_id?: number | null
          email?: string | null
          full_name?: string | null
          id?: number
          phone?: string | null
          position?: string | null
          timezone?: string | null
        }
        Update: {
          amocrm_contact_id?: number
          birthday?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          deal_id?: number | null
          email?: string | null
          full_name?: string | null
          id?: number
          phone?: string | null
          position?: string | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_oll_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals_oll"
            referencedColumns: ["amocrm_deal_id"]
          },
        ]
      }
      deals: {
        Row: {
          clinic_name: string | null
          country: string | null
          created_at: string | null
          deal_name: string | null
          id: number
          lead_id: string | null
          pipeline_name: string | null
          status_name: string | null
          updated_at: string | null
          visa_city: string | null
        }
        Insert: {
          clinic_name?: string | null
          country?: string | null
          created_at?: string | null
          deal_name?: string | null
          id: number
          lead_id?: string | null
          pipeline_name?: string | null
          status_name?: string | null
          updated_at?: string | null
          visa_city?: string | null
        }
        Update: {
          clinic_name?: string | null
          country?: string | null
          created_at?: string | null
          deal_name?: string | null
          id?: number
          lead_id?: string | null
          pipeline_name?: string | null
          status_name?: string | null
          updated_at?: string | null
          visa_city?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_clinic_name_fkey"
            columns: ["clinic_name"]
            isOneToOne: false
            referencedRelation: "clinics_directory"
            referencedColumns: ["short_name"]
          },
        ]
      }
      deals_oll: {
        Row: {
          amocrm_deal_id: number
          created_at: string | null
          id: number
          name: string | null
        }
        Insert: {
          amocrm_deal_id: number
          created_at?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          amocrm_deal_id?: number
          created_at?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      tickets_from_treatment: {
        Row: {
          created_at: string | null
          deal_id: number | null
          departure_city: string | null
          departure_datetime: string | null
          departure_flight_number: string | null
          id: number
          return_transport_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id?: number | null
          departure_city?: string | null
          departure_datetime?: string | null
          departure_flight_number?: string | null
          id?: number
          return_transport_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: number | null
          departure_city?: string | null
          departure_datetime?: string | null
          departure_flight_number?: string | null
          id?: number
          return_transport_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_from_treatment_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: true
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_from_treatment_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: true
            referencedRelation: "super_admin_master_view"
            referencedColumns: ["deal_id"]
          },
          {
            foreignKeyName: "tickets_from_treatment_departure_city_fkey"
            columns: ["departure_city"]
            isOneToOne: false
            referencedRelation: "cities_directory"
            referencedColumns: ["city_name"]
          },
        ]
      }
      tickets_to_china: {
        Row: {
          airport_code: string | null
          apartment_number: string | null
          arrival_city: string | null
          arrival_datetime: string | null
          created_at: string | null
          deal_id: number | null
          flight_number: string | null
          id: number
          passengers_count: string | null
          terminal: string | null
          transport_type: string | null
          updated_at: string | null
        }
        Insert: {
          airport_code?: string | null
          apartment_number?: string | null
          arrival_city?: string | null
          arrival_datetime?: string | null
          created_at?: string | null
          deal_id?: number | null
          flight_number?: string | null
          id?: number
          passengers_count?: string | null
          terminal?: string | null
          transport_type?: string | null
          updated_at?: string | null
        }
        Update: {
          airport_code?: string | null
          apartment_number?: string | null
          arrival_city?: string | null
          arrival_datetime?: string | null
          created_at?: string | null
          deal_id?: number | null
          flight_number?: string | null
          id?: number
          passengers_count?: string | null
          terminal?: string | null
          transport_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_to_china_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: true
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_to_china_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: true
            referencedRelation: "super_admin_master_view"
            referencedColumns: ["deal_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          clinic_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clinic_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clinic_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visas: {
        Row: {
          corridor_end_date: string | null
          corridor_start_date: string | null
          created_at: string | null
          deal_id: number | null
          entries_count: string | null
          id: number
          updated_at: string | null
          visa_days: number | null
          visa_type: string | null
        }
        Insert: {
          corridor_end_date?: string | null
          corridor_start_date?: string | null
          created_at?: string | null
          deal_id?: number | null
          entries_count?: string | null
          id?: number
          updated_at?: string | null
          visa_days?: number | null
          visa_type?: string | null
        }
        Update: {
          corridor_end_date?: string | null
          corridor_start_date?: string | null
          created_at?: string | null
          deal_id?: number | null
          entries_count?: string | null
          id?: number
          updated_at?: string | null
          visa_days?: number | null
          visa_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visas_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: true
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visas_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: true
            referencedRelation: "super_admin_master_view"
            referencedColumns: ["deal_id"]
          },
        ]
      }
    }
    Views: {
      super_admin_master_view: {
        Row: {
          amocrm_contact_id: number | null
          apartment_number: string | null
          arrival_city: string | null
          arrival_datetime: string | null
          arrival_flight_number: string | null
          arrival_terminal: string | null
          arrival_transport_type: string | null
          clinic_address_chinese: string | null
          clinic_address_english: string | null
          clinic_full_name: string | null
          clinic_name: string | null
          days_until_visa_expires: unknown | null
          deal_country: string | null
          deal_created_at: string | null
          deal_id: number | null
          deal_name: string | null
          deal_updated_at: string | null
          departure_airport_code: string | null
          departure_city: string | null
          departure_datetime: string | null
          departure_flight_number: string | null
          departure_transport_type: string | null
          lead_id: string | null
          passengers_count: string | null
          patient_birthday: string | null
          patient_city: string | null
          patient_country: string | null
          patient_email: string | null
          patient_first_name: string | null
          patient_full_name: string | null
          patient_last_name: string | null
          patient_passport: string | null
          patient_phone: string | null
          patient_preferred_name: string | null
          patient_status: string | null
          pipeline_name: string | null
          status_name: string | null
          visa_city: string | null
          visa_corridor_end: string | null
          visa_corridor_start: string | null
          visa_days: number | null
          visa_entries_count: string | null
          visa_expiry_date: string | null
          visa_status: string | null
          visa_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_clinic_name_fkey"
            columns: ["clinic_name"]
            isOneToOne: false
            referencedRelation: "clinics_directory"
            referencedColumns: ["short_name"]
          },
          {
            foreignKeyName: "tickets_from_treatment_departure_city_fkey"
            columns: ["departure_city"]
            isOneToOne: false
            referencedRelation: "cities_directory"
            referencedColumns: ["city_name"]
          },
        ]
      }
    }
    Functions: {
      get_current_user_clinic: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "super_admin" | "director" | "coordinator"
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
      app_role: ["super_admin", "director", "coordinator"],
    },
  },
} as const
