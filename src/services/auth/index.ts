import supabase from "../supabase";
import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from "@supabase/supabase-js";

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if(error) {
    throw error;
  }

  return user;
}

export async function loginEmail(credentials: SignInWithPasswordCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  
  if(error) {
    throw error;
  }

  return data;
}

export async function signUp(credentials: SignUpWithPasswordCredentials) {
  const { data, error } = await supabase.auth.signUp(credentials);

  if(error) {
    throw error;
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if(error) {
    throw error;
  }
}