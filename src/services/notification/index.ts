import supabase from "../supabase";
import { NotiDTO, NotiInfo } from './noti'

const notiDb = 'notifications';

export enum MsgNotiType {
  RECEIVE_MSG = 'vừa gửi tin nhắn cho bạn',
  RECEIVE_FILE = 'vừa gửi cho bạn 1 file đính kèm'
}

export async function getUnseenNotification(receiverId: string) {
  const { data, error } = await supabase
    .from(notiDb)
    .select('*')
    .eq('receiver_id', receiverId)
    .eq('is_read', false)

  if(error) {
    console.error('Error get Notification: ', error);
    throw error;
  }

  return data as NotiInfo[];
}

export async function createNotification(dto: NotiDTO) {
  const {data: existing, error: queryError}: { data: NotiInfo | null, error: Error | null } = await supabase
    .from(notiDb)
    .select('*')
    .eq('receiver_id', dto.receiver_id)
    .eq('message', dto.message)
    .eq('is_read', false)
    .maybeSingle();
  
  if (queryError) {
    console.error('Error check noti: ', queryError);
    throw queryError;
  }

  if (existing) {
    const senders = new Set(existing.sender_id);
    senders.delete(dto.sender_id);
    senders.add(dto.sender_id);

    const updateData = {
      sender_id: [...senders]
    }
    
    const { data, error } = await supabase
      .from(notiDb)
      .update(updateData)
      .eq('receiver_id', dto.receiver_id)
      .eq('message', dto.message)
      .eq('is_read', false)
      .select()
      .single();

    if (error) {
      console.error('Update noti Error: ', error);
      throw error;
    }

    return data as NotiInfo;
  }

  const insertData = {
    sender_id: [dto.sender_id],
    receiver_id: dto.receiver_id,
    message: dto.message
  };

  const { data, error } = await supabase
    .from(notiDb)
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating Notification:', error);
    throw error;
  }

  return data as NotiInfo;
}

export async function seenNotification(receiverId: string) {
  const unseenNoti = await getUnseenNotification(receiverId);
  const notiIds = unseenNoti.map(el => el.noti_id);

  const { error } = await supabase
    .from(notiDb)
    .update({ is_read: true })
    .in('noti_id', notiIds);

  if (error) {
    console.error('Error creating Notification:', error);
    throw error;
  }
}