import { SignUpDTO } from '@/services/auth/auth';
import { MailOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { history, Link } from '@umijs/max';
import { Button, Card, Checkbox, Form, Input, message, Result, Tooltip } from 'antd';
import { FC, useState } from 'react';
import services from '@/services';
import { AuthError, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { UserDTO } from '@/services/user/user';

const { signUp } = services.Auth;
const { addUser, createUserBucket } = services.Users;

const RegisterPage: FC = () => {
  const [form] = Form.useForm();
  const [mail, setMail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [animate, setAnimate] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const onFinish = async (data: SignUpDTO) => {
    setLoading(true); 

    const signUpDTO: SignUpWithPasswordCredentials = {
      email: data.email,
      password: data.password
    }

    try {
      const authUser = await signUp(signUpDTO);

      if(!authUser.user) {
        throw new Error('create Auth user ERR');
      }

      const userDTO: UserDTO = {
        id: authUser.user.id,
        email: data.email,
        name: data.nickname
      }
      await Promise.all([
        addUser(userDTO),
        createUserBucket(authUser.user.id)
      ]);

      setMail(data.email);
      setIsSubmitted(true);
    } catch (error: AuthError | any) {
      const msg = error?.response?.data?.message || error?.response?.data || error?.message || 'Unknow Error!';
      form.resetFields();
      message.error(msg); 
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to right,rgb(199, 103, 55),rgb(215, 162, 96))',
      }}
    >
      <Card
        title="Register Account"
        variant="borderless"
        style={{ 
          width: '600px',
          maxWidth: '80%',
          maxHeight: '100%',
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          background: 'rgba(216, 183, 150, 0.8)',
          transform: animate ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease-in-out',
        }}
        onMouseEnter={() => setAnimate(true)}
        onMouseLeave={() => setAnimate(false)}
      >
         {isSubmitted ? ( // ✅ Hiển thị thông báo nếu đăng ký thành công
          <Result
            icon={<MailOutlined style={{ color: '#2575fc' }} />}
            title="Verify Your Email!"
            subTitle={`We have sent a verification link to ${mail}. Please check inbox and confirm email to complete your registration within 60 minutes.`}
            extra={[
              <Button type="primary" onClick={() => history.push('/home')}>
                Go Home
              </Button>,
              <Link to="/login">
                <Button key="login">Back to Login</Button>
              </Link>,
            ]}
          />
        ) : (
          <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={onFinish}
          scrollToFirstError
          style={{maxHeight: '100%'}}
        >
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input your E-mail!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
              {
                min: 6,
                message: 'Minimum length is 6!',
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    'The two passwords that you entered do not match!',
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="nickname"
            label={
              <span>
                Nickname&nbsp;
                <Tooltip title="What do you want others to call you?">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input your nickname!',
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject('Should accept agreement'),
              },
            ]}
          >
            <Checkbox>
              I have read the <a href="">agreement</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              block 
              type="primary" 
              htmlType="submit"
              loading={loading}
              disabled={loading}
              style={{
                background: '#fc8825',
                border: 'none',
                fontSize: '16px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#d26203')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fc8825')}
            >
              Register  
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center' }}>
            Already have an account? <Link to={'/login'}>Sign in</Link>
          </Form.Item>
        </Form>
        )}
      </Card>
    </div>
  );
};

export default RegisterPage;
