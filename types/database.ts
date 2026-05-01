export type UserRole = "owner" | "caregiver" | "viewer";
export type StoolConsistency = "liquida" | "blanda" | "normal" | "dura";
export type CheckStatus = "pendiente" | "dada" | "saltada";
export type SupplyStatus = "suficiente" | "pronto_se_acaba" | "urgente";
export type ReminderType = "meal" | "medication" | "supply" | "vet" | "custom";

type Timestamp = string;
type UUID = string;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: UUID;
          full_name: string | null;
          avatar_url: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id: UUID;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      households: {
        Row: {
          id: UUID;
          name: string;
          invite_code: string;
          created_by: UUID | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          name: string;
          invite_code?: string;
          created_by?: UUID | null;
          created_at?: Timestamp;
        };
        Update: {
          name?: string;
          invite_code?: string;
        };
      };
      household_members: {
        Row: {
          id: UUID;
          household_id: UUID;
          user_id: UUID;
          role: UserRole;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          user_id: UUID;
          role: UserRole;
          created_at?: Timestamp;
        };
        Update: {
          role?: UserRole;
        };
      };
      pets: {
        Row: {
          id: UUID;
          household_id: UUID;
          name: string;
          species: string | null;
          breed: string | null;
          birthdate: string | null;
          photo_url: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          name: string;
          species?: string | null;
          breed?: string | null;
          birthdate?: string | null;
          photo_url?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          name?: string;
          species?: string | null;
          breed?: string | null;
          birthdate?: string | null;
          photo_url?: string | null;
        };
      };
      stool_logs: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          photo_url: string | null;
          consistency: StoolConsistency;
          color: string | null;
          has_blood: boolean;
          has_mucus: boolean;
          strong_smell: boolean;
          notes: string | null;
          occurred_at: Timestamp;
          created_by: UUID | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          photo_url?: string | null;
          consistency: StoolConsistency;
          color?: string | null;
          has_blood?: boolean;
          has_mucus?: boolean;
          strong_smell?: boolean;
          notes?: string | null;
          occurred_at: Timestamp;
          created_by?: UUID | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["stool_logs"]["Insert"]>;
      };
      symptom_logs: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          type: string;
          severity: string | null;
          notes: string | null;
          occurred_at: Timestamp;
          created_by: UUID | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          type: string;
          severity?: string | null;
          notes?: string | null;
          occurred_at: Timestamp;
          created_by?: UUID | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["symptom_logs"]["Insert"]>;
      };
      meals: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          name: string;
          food_type: string | null;
          quantity: string | null;
          preparation: string | null;
          notes: string | null;
          active: boolean;
          created_by: UUID | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          name: string;
          food_type?: string | null;
          quantity?: string | null;
          preparation?: string | null;
          notes?: string | null;
          active?: boolean;
          created_by?: UUID | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["meals"]["Insert"]>;
      };
      meal_schedules: {
        Row: {
          id: UUID;
          meal_id: UUID;
          household_id: UUID;
          pet_id: UUID;
          time_of_day: string;
          days_of_week: number[];
          reminder_minutes_before: number;
          active: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          meal_id: UUID;
          household_id: UUID;
          pet_id: UUID;
          time_of_day: string;
          days_of_week: number[];
          reminder_minutes_before?: number;
          active?: boolean;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["meal_schedules"]["Insert"]>;
      };
      meal_checks: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          meal_id: UUID;
          schedule_id: UUID;
          scheduled_at: Timestamp;
          completed_at: Timestamp | null;
          status: CheckStatus;
          completed_by: UUID | null;
          notes: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          meal_id: UUID;
          schedule_id: UUID;
          scheduled_at: Timestamp;
          completed_at?: Timestamp | null;
          status?: CheckStatus;
          completed_by?: UUID | null;
          notes?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["meal_checks"]["Insert"]>;
      };
      medications: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          name: string;
          dosage: string | null;
          frequency: string | null;
          instructions: string | null;
          start_date: string | null;
          end_date: string | null;
          prescription_photo_url: string | null;
          active: boolean;
          created_by: UUID | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          name: string;
          dosage?: string | null;
          frequency?: string | null;
          instructions?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          prescription_photo_url?: string | null;
          active?: boolean;
          created_by?: UUID | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["medications"]["Insert"]>;
      };
      medication_schedules: {
        Row: {
          id: UUID;
          medication_id: UUID;
          household_id: UUID;
          pet_id: UUID;
          time_of_day: string;
          days_of_week: number[];
          reminder_minutes_before: number;
          active: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          medication_id: UUID;
          household_id: UUID;
          pet_id: UUID;
          time_of_day: string;
          days_of_week: number[];
          reminder_minutes_before?: number;
          active?: boolean;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["medication_schedules"]["Insert"]>;
      };
      medication_checks: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          medication_id: UUID;
          schedule_id: UUID;
          scheduled_at: Timestamp;
          completed_at: Timestamp | null;
          status: CheckStatus;
          completed_by: UUID | null;
          notes: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          medication_id: UUID;
          schedule_id: UUID;
          scheduled_at: Timestamp;
          completed_at?: Timestamp | null;
          status?: CheckStatus;
          completed_by?: UUID | null;
          notes?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["medication_checks"]["Insert"]>;
      };
      supplies: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          name: string;
          category: string | null;
          purchase_date: string | null;
          estimated_runout_date: string | null;
          quantity: string | null;
          price: number | null;
          store: string | null;
          photo_url: string | null;
          notes: string | null;
          status: SupplyStatus;
          created_by: UUID | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          name: string;
          category?: string | null;
          purchase_date?: string | null;
          estimated_runout_date?: string | null;
          quantity?: string | null;
          price?: number | null;
          store?: string | null;
          photo_url?: string | null;
          notes?: string | null;
          status?: SupplyStatus;
          created_by?: UUID | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["supplies"]["Insert"]>;
      };
      vet_visits: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          visit_date: string;
          vet_name: string | null;
          reason: string | null;
          diagnosis: string | null;
          treatment: string | null;
          weight: number | null;
          notes: string | null;
          created_by: UUID | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          visit_date: string;
          vet_name?: string | null;
          reason?: string | null;
          diagnosis?: string | null;
          treatment?: string | null;
          weight?: number | null;
          notes?: string | null;
          created_by?: UUID | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["vet_visits"]["Insert"]>;
      };
      vaccines: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          name: string;
          applied_at: string | null;
          next_due_date: string | null;
          document_url: string | null;
          notes: string | null;
          created_by: UUID | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          name: string;
          applied_at?: string | null;
          next_due_date?: string | null;
          document_url?: string | null;
          notes?: string | null;
          created_by?: UUID | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["vaccines"]["Insert"]>;
      };
      documents: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          type: string | null;
          title: string;
          file_url: string;
          notes: string | null;
          created_by: UUID | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          type?: string | null;
          title: string;
          file_url: string;
          notes?: string | null;
          created_by?: UUID | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      push_subscriptions: {
        Row: {
          id: UUID;
          household_id: UUID;
          user_id: UUID;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          user_id: UUID;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["push_subscriptions"]["Insert"]>;
      };
      reminders: {
        Row: {
          id: UUID;
          household_id: UUID;
          pet_id: UUID;
          type: ReminderType;
          related_id: UUID | null;
          title: string;
          body: string | null;
          remind_at: Timestamp;
          sent_at: Timestamp | null;
          status: "pending" | "sent" | "cancelled";
          created_by: UUID | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: UUID;
          household_id: UUID;
          pet_id: UUID;
          type: ReminderType;
          related_id?: UUID | null;
          title: string;
          body?: string | null;
          remind_at: Timestamp;
          sent_at?: Timestamp | null;
          status?: "pending" | "sent" | "cancelled";
          created_by?: UUID | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["reminders"]["Insert"]>;
      };
    };
  };
}
