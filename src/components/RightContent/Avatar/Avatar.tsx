import { LoginOutlined, LogoutOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons';
import { useModel, history, useAccess } from '@umijs/max';
import { Avatar, Dropdown, MenuProps, Modal, Space, Typography } from 'antd';
import { FC } from 'react';
import services from "@/services";

const { logout } = services.Auth;

const AvatarContent: FC = () => {
  const { initialState } = useModel('@@initialState');
  const access = useAccess();

  const handleLogout = async () => {     
    await logout();
  
    history.push('/login');
    window.location.reload();
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        Modal.confirm({ 
          title: 'Are you sure to Log out?', 
          onOk: handleLogout, 
        });
      }
    }
  ]

  if(access.user) {
    menuItems.unshift(
      {
        key: 'profile',
        icon: <ProfileOutlined />,
        label: 'Profile',
        onClick: () => history.push('/profile'),
      },
      { 
        type: 'divider' 
      },
    )
  }

  // Nếu user đã đăng nhập, hiển thị Avatar + Logout
  if (initialState?.user) {
    const username = initialState?.user?.email?.split('@')[0];
    return (
      <Dropdown menu={{ items: menuItems }}>
        <Space size={'large'} style={{ cursor: 'pointer' }}>
          <Typography.Text>{username || 'Unknow'}</Typography.Text>
          <Avatar
            style={{ backgroundColor: '#f59056' }}
            size={35}
            src={ initialState.profile?.avatar || undefined }
            icon={<UserOutlined />}
          />
        </Space>

      </Dropdown>
    );
  }

  // Nếu chưa đăng nhập, hiển thị nút Login
  return (
    <a onClick={() => history.push('/login')} style={{ marginRight: 20 }}>
      <LoginOutlined /> Đăng nhập
    </a>
  );
};

export default AvatarContent;
