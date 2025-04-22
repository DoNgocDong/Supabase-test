import { history, RunTimeLayoutConfig, useAccess, useModel } from "@umijs/max";
import logoUrl from "@/assets/logo/KLB_logo.svg";
import Notification from "@/components/RightContent/Notification";
import ForbiddenPage from "./components/Errors/Forbidden";
import Footer from '@/components/Layouts/Footer';
import { LinkOutlined } from "@ant-design/icons";
import { getAuthUser } from "./services/auth";
import { User } from "@supabase/supabase-js";
import AvatarContent from "./components/RightContent/Avatar";
import { message } from "antd";
import { UserInfo } from "./services/user/user";
import { useEffect } from "react";
import { subscribeToPushNotifications } from "./utils/push";
import services from "./services";
import supabase from '@/services/supabase';
import { MessageInfo } from "./services/chat/chat";

const { saveSubscription, callSendBrowserNoti } = services.PushNotification;

export async function getInitialState(): Promise<{ 
  user?: User,
  profile?: UserInfo
}> {
  let contextUser = undefined;
  let profile = undefined;

  try {
    const auth = await getAuthUser();
    if(auth) {
      profile = auth.publicUser;
      contextUser = auth.authUser;
    }
  } catch (error) {
    contextUser = undefined;
    profile = undefined;
  }
  finally {
    return {
      user: contextUser,
      profile
    };
  }
}

export const layout: RunTimeLayoutConfig = () => {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    const channel = supabase
    .channel(`room_pushNotification`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const newMsg = payload.new as MessageInfo;

        if(newMsg.receiver_id == initialState?.user?.id) {
          callSendBrowserNoti(initialState?.user, newMsg.content || '')
        }
      }
    )
    .subscribe();

    const registerPushSubscription = async () => {
      if(initialState?.user) {
        subscribeToPushNotifications().then(async (subscription) => {
          if (subscription && initialState.user) {
            await saveSubscription(initialState.user.id, subscription);
          }
        });
      }
    }

    registerPushSubscription();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialState]);

  return {
    actionsRender: () => [<Notification key="doc" />],
    logo: <img src={logoUrl} alt="KLB logo" style={{ height: '32px' }} />,
    avatarProps: {
      render: () => {
        return <AvatarContent />
      },
    },
    menu: {
      locale: false,
    },
    contentStyle: {
      padding: 0,
    },
    layout: 'mix',
    links: [
      <a key="openapi" href="https://supabase.com/docs/guides/auth/passwords" target="_blank" rel="noopener noreferrer">
        <LinkOutlined />
        <span>OpenAPI Docs</span>
      </a>
    ],
    onPageChange: async (location) => {
      if(access.user && !PUBLIC_PAGE_PATH.some(item => location?.pathname?.includes(item))) {
        try {
          await getAuthUser();
        } catch (err) {
          message.error('Unauthenticated!');
          localStorage.clear();
          history.push('/login');
        }
      }
    },
    unAccessible: ForbiddenPage,
    // footerRender: () => <Footer />
  };
};
