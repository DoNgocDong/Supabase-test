import { Layout, Input, Button, List, Avatar, Typography, message } from 'antd';
import { SendOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { FC, useCallback, useEffect, useState } from 'react';
import { AnyAction, connect, Dispatch, useModel } from '@umijs/max';
import { ChatState } from '@/models/chat';
import { PageHeader } from '@ant-design/pro-components';
import { UserInfo } from '@/services/user/user';
// import useChatRealtime from '@/hooks/useChatRealTime';
import services from '@/services';
import { MessageInfo } from '@/services/chat/chat';
import supabase from '@/services/supabase';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { createConversation, createMessage, getMessages } = services.Chat;

interface ChatModelProps {
  chat: ChatState;
  dispatch: (args: any) => Promise<Dispatch<AnyAction>>;
}

const ChatPage: FC<ChatModelProps> = ({ chat, dispatch }) => {
  const {initialState} = useModel('@@initialState');
  const [chatInput, setChatInput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<MessageInfo[]>([]);

  const contextUser = initialState?.user;

  if(!contextUser) return <div>No User active!</div>

  const handleFindUsers = useCallback(async (name: string) => {
    try {
      await dispatch({ type: 'chat/findUsers', payload: name });
      setUserInput('');
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || error?.response?.data || error?.message;
      message.error(msg || 'Unknown Error!');
      return false;
    }
  }, []);

  const handleSelectUser = useCallback(async (user: UserInfo) => {
    await dispatch({ type: 'chat/setSelectedUser', payload: user });

    const conversation = await createConversation({
      user1: contextUser.id,
      user2: user.id,
    });

    await dispatch({ type: 'chat/setSelectedConversation', payload: conversation });

    const data = await getMessages(conversation.conversation_id);
    setMessages(data);
  }, []);

  const handleSendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    if(!chat.selectedUser) return;

    const conversation = await createConversation({
      user1: chat.selectedUser.id,
      user2: contextUser.id
    });

    await createMessage({
      conversation_id: conversation.conversation_id,
      sender_id: contextUser.id,
      receiver_id: chat.selectedUser.id,
      content: msg
    });

    setChatInput('')
  };

  useEffect(() => { 
    const conversation = chat.setSelectedConversation;
    if(!conversation) return;

    const channel = supabase
    .channel(`room${conversation.conversation_id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.conversation_id}`,
      },
      (payload) => {
        setMessages((prev) => [payload.new as MessageInfo, ...prev]);
      }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat.setSelectedConversation]);

  return (
    <Layout style={{ height: '93vh' }}>
      {/* Sidebar bên trái */}
      <Sider width={'20%'} style={{ background: '#f0f2f5', padding: '10px' }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          allowClear
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ marginBottom: '10px' }}
          onPressEnter={async () => await handleFindUsers(userInput)}
        />

        <List
          itemLayout="horizontal"
          dataSource={chat.users}
          renderItem={(item) => (
            <List.Item 
              key={item.id}
              style={{
                cursor: 'pointer',
                backgroundColor: chat.selectedUser?.id === item.id ? '#e6f7ff' : undefined,
              }}
              onClick={async () => await handleSelectUser(item)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={item.avatar || undefined}
                    icon={<UserOutlined />}
                  />
                }
                title={<Text strong>{item.name}</Text>}
                // description={item.lastMessage}
              />
            </List.Item>
          )}
        />
      </Sider>

      {/* Nội dung chính (content) */}
      <Layout style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <PageHeader
          title={chat.selectedUser?.name || 'Chọn một cuộc trò chuyện'}
          avatar={{
            src: chat.selectedUser?.avatar, 
            icon:<UserOutlined />
          }}
        />

        {/* Nội dung tin nhắn (Body) */}
        <Content
          style={{
            flex: 1,
            padding: '10px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
          }}
        >
          {messages && messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                textAlign: (msg.sender_id == contextUser.id) ? 'right' : 'left',
                margin: '5px 0',
              }}
            >
              <Text
                style={{
                  background: (msg.sender_id == contextUser.id) ? '#1677ff' : '#e8e8e8',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: (msg.sender_id == contextUser.id) ? 'white' : 'black',
                  display: 'inline-block',
                  maxWidth: '70%',
                }}
              >
                {msg.content}
              </Text>
            </div>
          ))}
        </Content>

        {/* Footer luôn cố định */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#fff',
            padding: '10px',
            borderTop: '1px solid #ddd',
          }}
        >
          <Input.Group compact>
            <Input
              style={{ width: 'calc(100% - 50px)' }}
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPressEnter={async () => await handleSendMessage(chatInput)}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={async () => await handleSendMessage(chatInput)}
            />
          </Input.Group>
        </div>
      </Layout>
    </Layout>
  );
};

export default connect(
  ( {chat}: {chat: ChatState} ) => (
    {chat}
  )
)(ChatPage);
