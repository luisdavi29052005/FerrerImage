/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
  // MOCK IMPLEMENTATION:
  // The original Supabase logic is commented out for development.
  // This mock function simulates a successful lead capture without needing a real database connection.
  console.log('Mock addLead called with:', lead);

  // Simulate a network delay for a more realistic user experience.
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a mock success response. The actual data structure isn't critical
  // for the landing page logic, as it only checks for success/failure.
  return [{ ...lead, id: 1, created_at: new Date().toISOString() }];

  /*
  // ORIGINAL SUPABASE LOGIC:
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
  */
};