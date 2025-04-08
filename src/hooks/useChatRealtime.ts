import { useEffect, useRef, useState } from 'react';
import supabase from '@/services/supabase';
import { MessageInfo } from '@/services/chat/chat';
import services from '@/services';
import { useModel } from '@umijs/max';

const { getMessages, createConversation } = services.Chat;

const useChatRealtime = (receiverId = '') => {
  const {initialState} = useModel('@@initialState');
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const channelRef = useRef<any>(null);

  const contextUser = initialState?.user;
  if(!contextUser) return;

  useEffect(() => {

    const fetchMessages = async () => {
      const conversation = await createConversation({
        user1: receiverId,
        user2: contextUser.id
      });

      const data = await getMessages(conversation.conversation_id);
      console.log(data)
      setMessages(data);
    };

    fetchMessages();

    // Lắng nghe sự kiện INSERT vào bảng messages của cuộc trò chuyện này
    const subscription = supabase
      .channel(`chat_${receiverId ? receiverId : 'myself'}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `receiver_id=eq.${receiverId}` 
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as MessageInfo]);
        }
      )
      .subscribe();

    channelRef.current = subscription;

    return () => {
      if (channelRef.current) {
        supabase.channel(`chat_${receiverId ? receiverId : 'myself'}`).unsubscribe();
      }
    };
  }, [receiverId]);

  return messages;
};

export default useChatRealtime;
