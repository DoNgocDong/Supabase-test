import React, { useEffect } from 'react';
import { Result, Button } from 'antd';
import { GithubOutlined, HomeOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import services from '@/services';

const { getAuthUser } = services.Auth;

const GitHubLoginSuccess: React.FC = () => {
  const {initialState} = useModel('@@initialState');
  
  const handleBackHome = () => {
    history.push('/home', {
      from: '/oauth/callback'
    });
  };

  useEffect(() => {
    const loadAuth = async () => {
      try {
        await getAuthUser();
  
        console.log('Initstate:', initialState);
      } catch (error: any) {
        const msg = error?.response?.data?.message || error?.response?.data || error?.message || 'Unknow Error!';
        console.error(msg);
      }
    }

    loadAuth();
  }, []);  

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result
        status="success"
        title="Đăng nhập GitHub thành công!"
        subTitle="Chào mừng bạn quay trở lại hệ thống."
        icon={<GithubOutlined style={{ fontSize: 48, color: '#333' }} />}
        extra={[
          <Button type="primary" icon={<HomeOutlined />} onClick={handleBackHome} key="home">
            Quay về trang chủ
          </Button>
        ]}
      />
    </div>
  );
};

export default GitHubLoginSuccess;
