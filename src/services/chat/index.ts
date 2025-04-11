import supabase from "../supabase";
import {ConversationInfo, MessageInfo, ConversationDTO, MessageDTO} from './chat'

const messageDb = 'messages';
const conversationDb = 'conversations';

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
    content: dto.content
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