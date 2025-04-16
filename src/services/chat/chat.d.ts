import { MsgType } from "./";

export enum MsgStatus {
  SENT = 'sent',
  SEEN = 'seen',
}

export interface ConversationDTO {
  user1: string;
  user2: string;
}

export interface MessageDTO {
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type?: MsgType;
  file_url?: string;
  file_name?: string;
  file_type?: string;
}

export interface ConversationInfo {
  conversation_id: string;
  participants: Array<string>
  created_at: string
} 

export interface MessageInfo {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: MsgType;
  file_url: string;
  file_name: string;
  file_type: string;
  status: MsgStatus;
  created_at: string;
  recalled: boolean;
}