export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      firefly_state: {
        Row: {
          energy: number
          last_updated_day: number
          profile_id: string
        }
        Insert: {
          energy?: number
          last_updated_day?: number
          profile_id: string
        }
        Update: {
          energy?: number
          last_updated_day?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "firefly_state_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          a_profile_id: string
          b_profile_id: string
          status: string
        }
        Insert: {
          a_profile_id: string
          b_profile_id: string
          status?: string
        }
        Update: {
          a_profile_id?: string
          b_profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_a_profile_id_fkey"
            columns: ["a_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_b_profile_id_fkey"
            columns: ["b_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_assignments: {
        Row: {
          game_id: string
          grade_band: Database["public"]["Enums"]["grade_band"] | null
          group_id: string | null
          id: string
        }
        Insert: {
          game_id: string
          grade_band?: Database["public"]["Enums"]["grade_band"] | null
          group_id?: string | null
          id?: string
        }
        Update: {
          game_id?: string
          grade_band?: Database["public"]["Enums"]["grade_band"] | null
          group_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_assignments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          duration_ms: number
          ended_at: string | null
          game_id: string
          id: string
          max_score: number
          profile_id: string
          raw: Json | null
          score: number
          started_at: string
        }
        Insert: {
          duration_ms?: number
          ended_at?: string | null
          game_id: string
          id?: string
          max_score?: number
          profile_id: string
          raw?: Json | null
          score?: number
          started_at?: string
        }
        Update: {
          duration_ms?: number
          ended_at?: string | null
          game_id?: string
          id?: string
          max_score?: number
          profile_id?: string
          raw?: Json | null
          score?: number
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          manifest: Json
          min_app_version: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id: string
          manifest: Json
          min_app_version?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          manifest?: Json
          min_app_version?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          member_role: Database["public"]["Enums"]["member_role"]
          profile_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          member_role: Database["public"]["Enums"]["member_role"]
          profile_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          member_role?: Database["public"]["Enums"]["member_role"]
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          join_code: string | null
          name: string
          owner_id: string
          type: Database["public"]["Enums"]["group_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          join_code?: string | null
          name: string
          owner_id: string
          type: Database["public"]["Enums"]["group_type"]
        }
        Update: {
          created_at?: string
          id?: string
          join_code?: string | null
          name?: string
          owner_id?: string
          type?: Database["public"]["Enums"]["group_type"]
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          id: string
          sort_order: number
          subject_id: string
          title: string
        }
        Insert: {
          id?: string
          sort_order?: number
          subject_id: string
          title: string
        }
        Update: {
          id?: string
          sort_order?: number
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery: {
        Row: {
          profile_id: string
          score: number
          subject_id: string
        }
        Insert: {
          profile_id: string
          score?: number
          subject_id: string
        }
        Update: {
          profile_id?: string
          score?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          display_name: string
          grade_band: Database["public"]["Enums"]["grade_band"] | null
          id: string
          role: Database["public"]["Enums"]["profile_role"]
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          display_name: string
          grade_band?: Database["public"]["Enums"]["grade_band"] | null
          id: string
          role?: Database["public"]["Enums"]["profile_role"]
        }
        Update: {
          avatar?: string | null
          created_at?: string
          display_name?: string
          grade_band?: Database["public"]["Enums"]["grade_band"] | null
          id?: string
          role?: Database["public"]["Enums"]["profile_role"]
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: number
          choices: Json
          difficulty: number
          explanation: string | null
          id: string
          lesson_id: string
          stem: string
        }
        Insert: {
          answer: number
          choices: Json
          difficulty?: number
          explanation?: string | null
          id?: string
          lesson_id: string
          stem: string
        }
        Update: {
          answer?: number
          choices?: Json
          difficulty?: number
          explanation?: string | null
          id?: string
          lesson_id?: string
          stem?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      review_items: {
        Row: {
          box: number
          due_day: number
          item_id: string
          profile_id: string
        }
        Insert: {
          box?: number
          due_day: number
          item_id: string
          profile_id: string
        }
        Update: {
          box?: number
          due_day?: number
          item_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          current: number
          last_active_day: number | null
          longest: number
          profile_id: string
        }
        Insert: {
          current?: number
          last_active_day?: number | null
          longest?: number
          profile_id: string
        }
        Update: {
          current?: number
          last_active_day?: number | null
          longest?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          grade_band: Database["public"]["Enums"]["grade_band"]
          id: string
          name: string
        }
        Insert: {
          grade_band: Database["public"]["Enums"]["grade_band"]
          id?: string
          name: string
        }
        Update: {
          grade_band?: Database["public"]["Enums"]["grade_band"]
          id?: string
          name?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          profile_id: string
          source: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          profile_id: string
          source: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          profile_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      shares_group_with: { Args: { target: string }; Returns: boolean }
    }
    Enums: {
      grade_band: "tieu-hoc" | "thcs"
      group_type: "family" | "class"
      member_role: "student" | "guardian" | "teacher"
      profile_role: "student" | "guardian" | "teacher" | "admin"
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
      grade_band: ["tieu-hoc", "thcs"],
      group_type: ["family", "class"],
      member_role: ["student", "guardian", "teacher"],
      profile_role: ["student", "guardian", "teacher", "admin"],
    },
  },
} as const

