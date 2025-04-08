export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          email: string
          name: boolean
          create_at: string
          role: UserRole
        }
        Insert: {
          email: string
          name: boolean
        }
        Update: {
          email: string
          name: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}