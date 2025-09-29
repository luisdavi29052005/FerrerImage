/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqidbjoxzweinrcywlxf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxaWRiam94endlaW5yY3l3bHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjk5NjcsImV4cCI6MjA3NDc0NTk2N30.oAHJ-trf0V5wANBH1MGtPy2DYgn2tp9tSayZ9BHgi5k";

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase URL and/or Anon Key are not set in environment variables. Lead capture will not work.');
}

interface Lead {
  name: string;
  email: string;
}

export const addLead = async (lead: Lead) => {
  if (!supabase) {
    // This error will be caught by the form submission logic in LandingPage.tsx
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('leads')
    .insert([
      { 
        name: lead.name,
        email: lead.email,
        created_at: new Date().toISOString() 
      }
    ])
    .select();

  if (error) {
    console.error('Error adding lead to Supabase:', error);
    throw error;
  }

  return data;
};
