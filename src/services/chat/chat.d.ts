export enum MsgStatus {
  SENT = 'sent',
  SEEN = 'seen',
}

export interface ConversationDTO {
  user1: string;
  user2: string;
}

export interface MessageDTO {
  conversation_id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
}

export interface ConversationInfo {
  conversation_id: string;
  participants: Array<string>
  created_at: string
} 

export interface MessageInfo {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: MsgStatus;
  created_at: string;
}