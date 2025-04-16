import supabase from "../supabase";
import { UserDTO, UserInfo } from "./user";

const userdb = 'users';

export async function addUser(userInfo: UserDTO) {
  const { data, error } = await supabase
    .from(userdb)
    .insert({ 
      id: userInfo.id ? userInfo.id : null,
      email: userInfo.email, 
      name: userInfo.name,
      avatar: userInfo.avatar ? userInfo.avatar : null,
      provider: userInfo.provider ? userInfo.provider : null, 
    })
    .select()
    .single();
  
  if(error) {
    console.error('Error addUser:', error);
    throw error;
  }

  return data as UserInfo;
}

export async function updateAvatar(userId: string, filePath: string) {
  const { data, error } = await supabase
  .from(userdb)
  .update({ 
    avatar: filePath 
  })
  .eq('id', userId)
  .select()
  .single();
        
  if(error) {
    console.error('Error addUser:', error);
    throw error;
  }

  return data as UserInfo;
}

export async function getUser(email = "") {
  const { data, error } = await supabase
    .from(userdb)
    .select('*')
    .eq('email', email)
    .single();

  if(error || !data) {
    console.error('Error getUser:', error);
    throw error;
  }

  return data as UserInfo;
}

export async function findUserByName(name: string) {
  const { data, error } = await supabase
    .from(userdb)
    .select('*')
    .ilike('name', `%${name}%`)

  if(error) {
    console.error('Error findUser by name:', error);
    throw error;
  }

  return data as UserInfo[];
}

export async function findUserById(id: string) {
  const { data, error } = await supabase
    .from(userdb)
    .select('*')
    .eq('id', id)
    .single();

  if(error) {
    console.error('Error findUser by ID:', error);
    throw error;
  }

  return data as UserInfo;
}

export async function createUserBucket(userId: string) {
  const bucketName = `user-${userId}`;

  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: false,
  });

  if (error) {
    console.error('Error creating bucket:', error);
    throw error;
  }

  return bucketName;
}

export async function uploadAvatarStorages(userId: string, file: File) {
  const filePath = `user_${userId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(
      filePath, 
      file, 
      { 
        upsert: true 
      }
    )

  if (error) {
    console.error('Upload failed:', error);
    throw error;
  }

  return getUrl(data.path);
}

async function getUrl(filePath: string) {
  const { data,  } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  
    return data.publicUrl;
}