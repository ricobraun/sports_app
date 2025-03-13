export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          is_admin: boolean
          profile_picture: string | null
          total_predictions: number
          correct_predictions: number
          created_at: string
          last_active: string
        }
        Insert: {
          id: string
          name: string
          email: string
          is_admin?: boolean
          profile_picture?: string | null
          total_predictions?: number
          correct_predictions?: number
          created_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          is_admin?: boolean
          profile_picture?: string | null
          total_predictions?: number
          correct_predictions?: number
          created_at?: string
          last_active?: string
        }
      }
      tournaments: {
        Row: {
          id: number
          name: string
          start_date: string
          end_date: string
          format: string | null
          category: string | null
          total_matches: number | null
          location: string | null
          created_at: string
        }
        Insert: {
          id: number
          name: string
          start_date: string
          end_date: string
          format?: string | null
          category?: string | null
          total_matches?: number | null
          location?: string | null
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          start_date?: string
          end_date?: string
          format?: string | null
          category?: string | null
          total_matches?: number | null
          location?: string | null
          is_featured?: boolean
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: number
          name: string
          code: string
          ranking: number | null
          created_at: string
        }
        Insert: {
          id: number
          name: string
          code: string
          ranking?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          code?: string
          ranking?: number | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          tournament_id: number
          name: string
          status: string
          date: string
          team1_id: number
          team2_id: number
          format: string | null
          venue: string | null
          winner_id: number | null
          team1_score: string | null
          team2_score: string | null
          created_at: string
        }
        Insert: {
          id: number
          tournament_id: number
          name: string
          status: string
          date: string
          team1_id: number
          team2_id: number
          format?: string | null
          venue?: string | null
          winner_id?: number | null
          team1_score?: string | null
          team2_score?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          tournament_id?: number
          name?: string
          status?: string
          date?: string
          team1_id?: number
          team2_id?: number
          format?: string | null
          venue?: string | null
          winner_id?: number | null
          team1_score?: string | null
          team2_score?: string | null
          created_at?: string
        }
      }
      pools: {
        Row: {
          id: string
          name: string
          admin_id: string
          tournament_id: number
          invite_code: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          admin_id: string
          tournament_id: number
          invite_code: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          admin_id?: string
          tournament_id?: number
          invite_code?: string
          is_public?: boolean
          created_at?: string
        }
      }
      pool_members: {
        Row: {
          id: string
          pool_id: string
          user_id: string
          points: number
          rank: number | null
          previous_rank: number | null
          joined_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          user_id: string
          points?: number
          rank?: number | null
          previous_rank?: number | null
          joined_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          user_id?: string
          points?: number
          rank?: number | null
          previous_rank?: number | null
          joined_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          pool_id: string
          match_id: number
          user_id: string
          prediction: string
          confidence: number
          points: number
          settled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          match_id: number
          user_id: string
          prediction: string
          confidence?: number
          points?: number
          settled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          match_id?: number
          user_id?: string
          prediction?: string
          confidence?: number
          points?: number
          settled?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          type: string
          read: boolean
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          type: string
          read?: boolean
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          type?: string
          read?: boolean
          related_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_prediction_points: {
        Args: {
          prediction_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}