import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
  HomeOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider, message, Space, theme } from 'antd';
import logoUrl from "@/assets/logo/KLB_logo.svg";
import { useCallback, type CSSProperties, type FC } from 'react';
import { history, Link } from '@umijs/max';
import services from '@/services';
import { AuthError, SignInWithPasswordCredentials } from '@supabase/supabase-js';

const { loginEmail } = services.Auth;

const iconStyles: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '18px',
  verticalAlign: 'middle',
  cursor: 'pointer',
};


const Page: FC = () => {
  const { token } = theme.useToken();

  const handleLogin = useCallback(async (credentials: SignInWithPasswordCredentials) => {
    try { 
      const data = await loginEmail(credentials);

      message.success('Đăng nhập thành công!'); 
      
      history.push('/home'); 
      window.location.reload()
    } catch (error: AuthError | any) { 
      const msg = error?.response?.data?.message || error?.response?.data || error?.message || 'Unknow Error!';
      message.error(msg); 
    } 
  }, []);

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: '100vh',
      }}
    >
      <LoginFormPage
        logo={<img src={logoUrl} alt="KLB logo" style={{ height: '32px' }} />}
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="Supabase - Todos"
        containerStyle={{
          backgroundColor: 'rgba(216, 183, 150, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
        subTitle="Ngân Hàng Thương mại Cổ Phần Kiên Long"
        activityConfig={{
          style: {
            boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)',
            color: 'white',
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(4px)',
          },
          title: 'Todos website',
          subTitle: 'Client for Supabase platform',
          action: (
            <Button
              onClick={() => history.push('/home')}
              size="large"
              style={{
                borderRadius: 20,
                background: token.colorBgElevated,
                color: 'black',
                width: '100%',
              }}
            >
              <HomeOutlined /> Home
            </Button>
          ),
        }}
        actions={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Divider plain>
              <span
                style={{
                  color: 'black',
                  fontWeight: 'normal',
                  fontSize: 14,
                }}
              >
                Hoặc đăng nhập bằng
              </span>
            </Divider>
            <Space align="center" size={24}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid ' + token.colorText,
                  borderRadius: '50%',
                }}
              >
                <FacebookOutlined style={{ ...iconStyles, color: '#121413' }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid ' + token.colorText,
                  borderRadius: '50%',
                }}
              >
                <GoogleOutlined style={{ ...iconStyles, color: '#121413' }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid ' + token.colorText,
                  borderRadius: '50%',
                }}
              >
                <GithubOutlined style={{ ...iconStyles, color: '#121413' }} />
              </div>
            </Space>  
            <Divider plain>
              <span
                style={{
                  color: 'black',
                  fontWeight: 'normal',
                  fontSize: 14,
                }}
              >
                Don't have an account? <Link to={'/register'}>Sign up</Link>
              </span>
            </Divider>  
          </div>
        }
        onFinish={handleLogin}
      >
        <>
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: (
                <UserOutlined
                  style={{
                    color: token.colorText,
                  }}
                  className={'prefixIcon'}
                />
              ),
            }}
            placeholder={'Email'}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập email!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: (
                <LockOutlined
                  style={{
                    color: token.colorText,
                  }}
                  className={'prefixIcon'}
                />
              ),
            }}
            placeholder={'password'}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập password!',
              },
            ]}
          />
        </>
      </LoginFormPage>
    </div>
  );
};

export default () => (
  <ProConfigProvider>
    <Page />
  </ProConfigProvider>
);
