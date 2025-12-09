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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      community_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          staff_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          staff_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          staff_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_verses: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          user_id: string
          verse: number
          verse_reference: string
          verse_text: string
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          user_id: string
          verse: number
          verse_reference: string
          verse_text: string
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          user_id?: string
          verse?: number
          verse_reference?: string
          verse_text?: string
        }
        Relationships: []
      }
      message_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          audio_url: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          published_at: string | null
          title: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          title: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          title?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          category: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          is_anonymous: boolean
          is_public: boolean
          request_pastoral_counselling: boolean
          status: string
          title: string
          updated_at: string
          user_id: string
          wants_contact: boolean
        }
        Insert: {
          category: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          is_anonymous?: boolean
          is_public?: boolean
          request_pastoral_counselling?: boolean
          status?: string
          title: string
          updated_at?: string
          user_id: string
          wants_contact?: boolean
        }
        Update: {
          category?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          is_anonymous?: boolean
          is_public?: boolean
          request_pastoral_counselling?: boolean
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          wants_contact?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          quiz_completed: boolean
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          quiz_completed?: boolean
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          quiz_completed?: boolean
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      quiz_entries: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: number
          created_at: string
          id: string
          options: Json
          order_number: number
          podcast_title: string | null
          podcast_url: string | null
          question: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          id?: string
          options: Json
          order_number: number
          podcast_title?: string | null
          podcast_url?: string | null
          question: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          id?: string
          options?: Json
          order_number?: number
          podcast_title?: string | null
          podcast_url?: string | null
          question?: string
        }
        Relationships: []
      }
      signups: {
        Row: {
          created_at: string
          email: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_quiz_completion: {
        Row: {
          completed_at: string
          id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      user_quiz_responses: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_answer: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          id: string
          published_at: string | null
          thumbnail_url: string | null
          title: string
          youtube_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          youtube_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          youtube_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_prayer_requests: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_anonymous: boolean | null
          is_public: boolean | null
          request_pastoral_counselling: boolean | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          is_public?: boolean | null
          request_pastoral_counselling?: boolean | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          is_public?: boolean | null
          request_pastoral_counselling?: boolean | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "staff" | "user"
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
      app_role: ["admin", "moderator", "staff", "user"],
    },
  },
} as const
