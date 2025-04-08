import supabase from "../supabase";
import {ConversationInfo, MessageInfo, ConversationDTO, MessageDTO} from './chat'

const messageDb = 'messages';
const conversationDb = 'conversations';

export async function createConversation(dto: ConversationDTO) {
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
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data as ConversationInfo;
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
    console.error('Error create conversation:', error);
    throw error;
  }

  return data as MessageInfo;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
  .from(messageDb)
  .select('*')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: false });;

  if(error) {
    console.error('Error create conversation:', error);
    throw error;
  }

  return data as MessageInfo[];
}