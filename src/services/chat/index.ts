import supabase from "../supabase";
import {ConversationInfo, MessageInfo, ConversationDTO, MessageDTO} from './chat'

const messageDb = 'messages';
const conversationDb = 'conversations';

export enum MsgType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

export async function createOrGetConversation(dto: ConversationDTO) {
  const usersSet = [dto.user1, dto.user2].sort();
  const formattedArray = `{${usersSet.join(',')}}`;
  
  const { data: existing, error: queryError } = await supabase
    .from(conversationDb)
    .select('*')
    .eq('participants', formattedArray)
    .maybeSingle(); // chỉ lấy 1 nếu tồn tại

  if (queryError) {
    console.error('Error checking existing conversation:', queryError);
    throw queryError;
  }

  if (existing) {
    // Nếu đã tồn tại, không tạo mới
    return existing as ConversationInfo;
  }

  // Tạo mới nếu chưa có
  const { data, error } = await supabase
    .from(conversationDb)
    .insert({ participants: usersSet })
    .select()
    .single();

  if (error) {
    console.error('Error creating Conversation:', error);
    throw error;
  }

  return data as ConversationInfo;
}

export async function getConversationByParticipants(dto: ConversationDTO) {
  const usersSet = [dto.user1, dto.user2].sort();
  const formattedArray = `{${usersSet.join(',')}}`;
  
  const { data, error: queryError } = await supabase
    .from(conversationDb)
    .select('*')
    .eq('participants', formattedArray)
    .maybeSingle();

  if (queryError) {
    console.error('Error checking existing conversation:', queryError);
    throw queryError;
  }

  if (data) {
    return data as ConversationInfo;
  }
  
  return null;
}

export async function createMessage(dto: MessageDTO) {
  const { data, error } = await supabase
    .from(messageDb)
    .insert({ 
      conversation_id: dto.conversation_id ? dto.conversation_id : null,
      sender_id: dto.sender_id,
      receiver_id: dto.receiver_id,
      content: dto.content,
      type: dto.type ? dto.type : null,
      file_url: dto.file_url ? dto.file_url : null,
      file_path: dto.file_path ? dto.file_path : null,
      file_name: dto.file_name ? dto.file_name : null,
      file_type: dto.file_type ? dto.file_type : null,
    })
    .select()
    .single();

  if(error) {
    console.error('Error create Message:', error);
    throw error;
  }

  return data as MessageInfo;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from(messageDb)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false });

  if(error) {
    console.error('Error get Messages:', error);
    throw error;
  }

  return data as MessageInfo[];
}

export async function getMessageById(messageId: string) {
  const { data, error } = await supabase
    .from(messageDb)
    .select('*')
    .eq('message_id', messageId)
    .single();

  if(error) {
    console.error('Error get Message by ID:', error);
    throw error;
  }

  return data as MessageInfo;
}

export async function recallMessage(messageId: string) {
  const { error } = await supabase
    .from(messageDb)
    .update({ recalled: true })
    .eq('message_id', messageId);

  if(error) {
    console.error('Error Recall message:', error);
    throw error;
  }
}

export async function uploadFile(conversationId: string, userId: string, file: File) {
  const bucketName = `user-${userId}`;
  const filePath = `conversation_${conversationId}/${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(
      filePath, 
      file, 
      { 
        cacheControl: '3600',
        upsert: true 
      }
    )

  if (error) {
    console.error('Send file failure:', error);
    throw error;
  }

  return {
    filePath: data.path,
    publicUrl: getPublicUrl(bucketName, filePath),
  };
}

export async function deleteFile(userId: string, filePath: string) {
  const bucketName = `user-${userId}`;
  
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    console.error('Delete file failure:', error);
    throw error;
  }
}

export async function downloadFile(userId: string, filePath: string) {
  const bucketName = `user-${userId}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);

  if (error) {
    console.error('Download file failure:', error);
    throw error;
  }

  return data;
}

export function getPublicUrl(bucketName: string, filePath: string) {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
}