import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          text: string;
          dimension: string;
          weight: number;
        };
        Insert: {
          id?: string;
          text: string;
          dimension: string;
          weight: number;
        };
        Update: {
          id?: string;
          text?: string;
          dimension?: string;
          weight?: number;
        };
      };
      parties: {
        Row: {
          id: string;
          name: string;
          description: string;
          coordinates: number[];
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          coordinates: number[];
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          coordinates?: number[];
        };
      };
    };
  };
} 