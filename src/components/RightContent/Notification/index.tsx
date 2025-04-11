import { NotiInfo } from '@/services/notification/noti';
import supabase from '@/services/supabase';
import { BellOutlined, ExclamationCircleFilled, UserOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Avatar, Badge, List, Popover, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import services from '@/services';
import { UserInfo } from '@/services/user/user';

const { getUnseenNotification, seenNotification } = services.Notifications;
const { findUserById } = services.Users;

const Notification: FC = () => {
  const {initialState} = useModel('@@initialState');
  const contextUser = initialState?.user;
  if(!contextUser) return;

  const [open, setOpen] = useState(false);
  const [notiHighlight, setHighLight] = useState(false);
  const [notifications, setNotifications] = useState<NotiInfo[]>([]);
  const [senderMap, setSenderMap] = useState<Record<string, UserInfo[]>>({});

  const handleOpenChange = async (open: boolean) => {
    if(open) {
      setOpen(open);
      setHighLight(false);
    }
    else {
      setOpen(open);
      await seenNotification(contextUser.id);
    }
  }

  useEffect(() => {
    const loadSenderMap = async function(notifications: NotiInfo[]) {
      const senderIdMap: Record<string, string[]> = {};
      notifications.map(noti => {
        senderIdMap[noti.noti_id] = noti.sender_id
      });

      const map: Record<string, UserInfo[]> = {};
      await Promise.all(
        notifications.map(async (noti) => {
          map[noti.noti_id] = await Promise.all(
            senderIdMap[noti.noti_id].map(async (id) => await findUserById(id))
          );
        })
      );
      setSenderMap(map);
    }

    const loadNotifications = async function(receiverId: string) {
      const unseenNotis = await getUnseenNotification(receiverId);
      setNotifications(unseenNotis);

      if(unseenNotis.length > 0) {
        setHighLight(true);
        await loadSenderMap(unseenNotis);
      }
    }

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${contextUser.id}`
        },
        async (payload) => {
          const newPayload = payload.new as NotiInfo;

          if(!newPayload.is_read) {
            const list = notifications.filter(noti => noti.noti_id != newPayload.noti_id);
            list.unshift(newPayload);
            await loadSenderMap(list);
            setNotifications(list);
            setHighLight(true);
          }
          else {
            const list = (notifications.length > 0) ? notifications.map(noti => {
              if(noti.noti_id == newPayload.noti_id) {
                noti.is_read = true;
              }
              return noti;
            }) : [newPayload];

            setNotifications(list);
            setHighLight(false);
          }
        }
      )
      .subscribe();

    loadNotifications(contextUser.id);
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const content = (
    <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => {
          const senders = senderMap[item.noti_id];
          const countSender = senders.length;
          const lastSender = senders[senders.length - 1];

          return (
            <List.Item 
              key={item.noti_id}
              style={{ cursor: 'pointer', padding: '8px 12px' }}
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    count={item.is_read ? 0 : <ExclamationCircleFilled style={{ color: 'hwb(205 6% 9%)' }}/>}
                  >
                    <Avatar
                      src={lastSender.avatar || undefined}
                      icon={<UserOutlined />}
                    />
                  </Badge>
                }
                title={
                  <Typography.Text strong>
                    {countSender === 1
                      ? lastSender.name
                      : `${lastSender.name} và ${countSender - 1} người khác`}
                  </Typography.Text>
                }
                description={<Typography.Text>{item.message}</Typography.Text>}
              />
            </List.Item>
          )
        }}
      />
    </div>
  );

  return (
    <Popover
      content={content}
      title={<Typography.Text strong>Thông báo</Typography.Text>}
      trigger="click"
      placement="bottom"
      open={open}
      onOpenChange={(open) => handleOpenChange(open)}
    >
      <Badge dot={notiHighlight} offset={[-8, 8]}>
        <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
      </Badge>
    </Popover>
  );
};

export default Notification;
