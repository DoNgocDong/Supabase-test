import { Layout, Input, Button, List, Avatar, Typography, message, Popconfirm, Upload, UploadProps, Image } from 'antd';
import { SendOutlined, SearchOutlined, UserOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { FC, useCallback, useEffect, useState } from 'react';
import { AnyAction, connect, Dispatch, useModel } from '@umijs/max';
import { ChatState } from '@/models/chat';
import { PageHeader } from '@ant-design/pro-components';
import { UserInfo } from '@/services/user/user';
import services from '@/services';
import { MessageInfo } from '@/services/chat/chat';
import supabase from '@/services/supabase';
import { MsgNotiType } from '@/services/notification';
import { MsgType } from '@/services/chat';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { createOrGetConversation, createMessage, getMessages, recallMessage, uploadFile, deleteFile, downloadFile } = services.Chat;
const { createNotification } = services.Notifications;
const { callSendBrowserNoti } = services.PushNotification;

interface ChatModelProps {
  chat: ChatState;
  dispatch: (args: any) => Promise<Dispatch<AnyAction>>;
}

const ChatPage: FC<ChatModelProps> = ({ chat, dispatch }) => {
  const {initialState} = useModel('@@initialState');
  const [chatInput, setChatInput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const contextUser = initialState?.user;
  const MAX_FILE_SIZE_MB = 10;

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

    const conversation = await createOrGetConversation({
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

    const conversation = await createOrGetConversation({
      user1: chat.selectedUser.id,
      user2: contextUser.id
    });

    const message = await createMessage({
      conversation_id: conversation.conversation_id,
      sender_id: contextUser.id,
      receiver_id: chat.selectedUser.id,
      content: msg
    });

    if(message.receiver_id != contextUser.id) {
      await createNotification({
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        message: MsgNotiType.RECEIVE_MSG
      });
    }

    setChatInput('')
  };

  const handleRecallMessage = async (msg: MessageInfo) => {
    try {
      if(msg.type === MsgType.TEXT) {
        await recallMessage(msg.message_id);
        return;
      }

      await Promise.all([
        deleteFile(contextUser.id, msg.file_path),
        recallMessage(msg.message_id)
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || error?.response?.data || error?.message;
      message.error(msg || 'Unknown Error!');
    }
  }

  const handleBeforeUpload = async (file: File) => {
    const conversation = chat.selectedConversation;

    if(!conversation) return Upload.LIST_IGNORE;
    if(!chat.selectedUser) return;

    const isLt5M = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
    if (!isLt5M) {
      message.error('File phải nhỏ hơn 10MB!');
      return Upload.LIST_IGNORE;
    }

    const msgType = file.type.startsWith('image/') ? MsgType.IMAGE : MsgType.FILE;

    try {
      const fileUpload = await uploadFile(
        conversation.conversation_id,
        contextUser.id,
        file
      );

      console.log('fileUpload:', fileUpload);

      const msg = await createMessage({
        conversation_id: conversation.conversation_id,
        sender_id: contextUser.id,
        receiver_id: chat.selectedUser.id,
        type: msgType,
        file_type: file.type,
        file_url: fileUpload.publicUrl,
        file_path: fileUpload.filePath,
        file_name: file.name,
      });
  
      if(msg.receiver_id != contextUser.id) {
        await createNotification({
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          message: MsgNotiType.RECEIVE_FILE
        });
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || error?.response?.data || error?.message;
      message.error(msg || 'Unknown Error!');
    }
  
    return false;
  };

  useEffect(() => { 
    const conversation = chat.selectedConversation;
    if(!conversation) return;

    const loadMessages = async function(conversationId: string) {
      const messages = await getMessages(conversationId);
      setMessages(messages);
    }

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
        const newMsg = payload.new as MessageInfo;
        setMessages((prev) => [newMsg, ...prev]);

        // if(newMsg.receiver_id == contextUser.id) {
        //   callSendBrowserNoti(contextUser, newMsg.content || '')
        // }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.conversation_id}`,
      },
      (payload) => {
        const updateMsg = payload.new as MessageInfo;

        setMessages((prev) => {
          prev = prev.map((msg) => {
            if (msg.message_id === updateMsg.message_id) {
              return { ...msg, ...updateMsg };
            }
            return msg;
          });

          return [...prev];
        });
      }
    )
    .subscribe();

    loadMessages(conversation.conversation_id);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat.selectedConversation]);

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
                backgroundColor:
                  chat.selectedUser?.id === item.id ? '#e6f7ff' : undefined,
              }}
              onClick={async () => await handleSelectUser(item)}
            >
              <List.Item.Meta
                key={item.id}
                style={{ marginLeft: 15 }}
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
            icon: <UserOutlined />,
          }}
        />

        {/* Nội dung tin nhắn (Body) */}
        <Content
          key={chat.selectedConversation?.conversation_id}
          style={{
            flex: 1,
            padding: '10px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
          }}
        >
          {messages &&
            messages.map((msg) => {
              const isSender = msg.sender_id == contextUser.id;

              if (msg.recalled) {
                return (
                  <div
                    key={msg.message_id}
                    style={{
                      textAlign: isSender ? 'right' : 'left',
                      margin: '5px 0',
                    }}
                  >
                    <Text
                      italic
                      type="secondary"
                      style={{
                        background: '#f5f5f5',
                        padding: '4px 6px',
                        borderRadius: '10px',
                        display: 'inline-block',
                        maxWidth: '70%',
                        fontSize: '13px',
                        border: '1px dashed #bfbfbf',
                      }}
                    >
                      Tin nhắn đã thu hồi
                    </Text>
                  </div>
                );
              }

              return (
                <div
                  key={msg.message_id}
                  style={{
                    textAlign: isSender ? 'right' : 'left',
                    margin: '5px 0',
                  }}
                  onMouseEnter={() => setHoveredMessageId(msg.message_id)}
                  // onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {hoveredMessageId === msg.message_id && isSender && (
                    <Popconfirm
                      title="Bạn có chắc muốn thu hồi tin nhắn này?"
                      onConfirm={async () =>
                        await handleRecallMessage(msg)
                      }
                      okText="Đồng ý"
                      cancelText="Hủy"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        style={{
                          color: 'red',
                          fontSize: '12px',
                        }}
                      ></Button>
                    </Popconfirm>
                  )}

                  {msg.type === MsgType.TEXT && (
                    <Text
                      style={{
                        background:
                          msg.sender_id == contextUser.id
                            ? '#1677ff'
                            : '#e8e8e8',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        color:
                          msg.sender_id == contextUser.id ? 'white' : 'black',
                        display: 'inline-block',
                        maxWidth: '70%',
                      }}
                    >
                      {msg.content}
                    </Text>
                  )}

                  {msg.type === MsgType.IMAGE && (
                    <Image
                      src={msg.file_url}
                      alt={`${msg.file_name}`}
                      style={{
                        maxWidth: '200px',
                        borderRadius: '8px',
                      }}
                    />
                  )}

                  {msg.type === MsgType.FILE && (
                    <div
                      style={{
                        background: isSender ? '#d6f5dd' : '#e8e8e8',
                        padding: '8px 8px',
                        borderRadius: '8px',
                        display: 'inline-block',
                        maxWidth: '70%',
                      }}
                    >
                      <Button
                        type='link'
                        size='small'
                        onClick={() => window.open(msg.file_url)}
                        icon={<PaperClipOutlined />}
                        style={{ fontWeight: 500 }}
                      >
                        {msg.file_name}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
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
            <Upload
              disabled={chat.selectedConversation == null}
              beforeUpload={handleBeforeUpload}
              showUploadList={false}
              multiple={false}
              accept="*"
            >
              <Button
                type="text"
                icon={<PaperClipOutlined />}
                style={{ width: 40 }}
              />
            </Upload>
            <Input
              style={{ 
                width: 'calc(100% - 100px)',
                borderRadius: '15px',
                marginRight: '10px', 
              }}
              disabled={chat.selectedConversation == null}
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
