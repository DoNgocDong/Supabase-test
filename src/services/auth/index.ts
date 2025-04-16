import {
  Provider,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';
import supabase from '../supabase';
import { UserDTO, UserInfo } from '../user/user';

import { getUser, addUser, createUserBucket } from '../user';

export async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();


  if (error) {
    throw error;
  }

  if (!user) {
    return null;
  }

  let publicUser: UserInfo | null = null;
  try {
    publicUser = await getUser(user.email);
  } catch (error) {
    if(!publicUser) {
      const userDTO: UserDTO = {
        id: user.id,
        email: user.user_metadata.email,
        name: user.user_metadata.full_name,
        avatar: user.user_metadata.avatar_url,
        provider: user.app_metadata.provider,
      };
      const [newUser] = await Promise.all([
        addUser(userDTO), 
        createUserBucket(user.id)
      ]);

      publicUser = newUser;
    }
  }

  return {
    authUser: user,
    publicUser
  };
}

export async function loginEmail(credentials: SignInWithPasswordCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    throw error;
  }

  return data;
}

export async function loginOAuth(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'http://localhost:3000/oauth/callback',
    },
  });

  if (error) {
    throw error;
  }
}

export async function signUp(credentials: SignUpWithPasswordCredentials) {
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    throw error;
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
