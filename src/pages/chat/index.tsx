import { lazy, Suspense, FC } from "react";
import { Spin } from "antd";

const ChatPage = lazy( () => import('@/components/Chat') );

const UserPage: FC = () => {
  return(
    <Suspense fallback={ <Spin size="large" /> }>
      <ChatPage />
    </Suspense>
  );
}

export default UserPage;