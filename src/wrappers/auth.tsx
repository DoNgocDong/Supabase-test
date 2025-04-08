import { useModel, history, Outlet } from '@umijs/max';
import { message } from 'antd';
import { useEffect } from 'react';

export default () => {
  const { initialState } = useModel('@@initialState'); // Lấy user từ initialState

  useEffect(() => {
    if (!initialState?.user && !PUBLIC_PAGE_PATH.some(item => history.location?.pathname?.includes(item))) {
      message.error('You are not login');
      history.push('/login');
    }
  }, [initialState?.user]);

  return <Outlet></Outlet>; 
}