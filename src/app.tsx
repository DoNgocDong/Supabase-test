import { history, RunTimeLayoutConfig, useAccess } from "@umijs/max";
import logoUrl from "@/assets/logo/KLB_logo.svg";
import Notification from "@/components/RightContent/Notification";
import ForbiddenPage from "./components/Errors/Forbidden";
import Footer from '@/components/Layouts/Footer';
import { LinkOutlined } from "@ant-design/icons";
import { getUser as getAuthUser } from "./services/auth";
import { getUser } from "./services/user";
import { User } from "@supabase/supabase-js";
import AvatarContent from "./components/RightContent/Avatar";
import { message } from "antd";
import { UserInfo } from "./services/user/user";

export async function getInitialState(): Promise<{ 
  user?: User,
  profile?: UserInfo
}> {
  let contextUser = undefined;
  let profile = undefined;

  try {
    const authUser = await getAuthUser();
    if(authUser) {
      profile = await getUser(authUser?.email);
      contextUser = authUser;
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
