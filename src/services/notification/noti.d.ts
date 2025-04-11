export interface NotiInfo {
  noti_id: string;
  sender_id: Array<string>;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotiDTO {
  sender_id: string;
  receiver_id: string;
  message: string;
}