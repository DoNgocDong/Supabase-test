import { Avatar, Card, Descriptions, Typography, Space, message, DescriptionsProps, Badge, Upload, Image, GetProp, UploadProps, UploadFile } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styles from './index.less';
import dayjs from 'dayjs';
import services from '@/services';
import { useModel } from '@umijs/max';
import { useState } from 'react';

const { Title } = Typography;
const { uploadAvatarStorages, updateAvatar } = services.Users;

const ProfilePage: React.FC = () => {
  const { initialState, refresh } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);

  const user = initialState?.user;
  const profile = initialState?.profile;

  if(!user) return <div>Load User Error!</div>;

  if (!profile) return <div>Loading...</div>;

  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    try {
      const imgUrl = await uploadAvatarStorages(user.id, file as File);
      await updateAvatar(user.id, imgUrl);

      message.success('Avatar updated successfully');
      await refresh();
      profile.avatar = imgUrl;
      onSuccess?.('ok');
    } catch (error) {
      message.error('Upload failed');
      onError?.(new Error('Upload failed'));
    } finally {
      setLoading(false);
    }
  };

  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'ID',
      children: profile.id,
      span: 3,
      style: { textAlign: 'center' }
    },
    {
      key: '2',
      label: 'Email',
      children: profile.email,
    },
    {
      key: '3',
      label: 'SĐT',
      children: user.phone,
    },
    {
      key: '4',
      label: 'Giới tính',
      children: profile.gender,
    },
    {
      key: '5',
      label: 'Ngày sinh',
      children: (profile.dob) ? dayjs(profile.dob.toLocaleString()).format('DD-MM-YYYY') : null,
    },
    {
      key: '6',
      label: 'Địa chỉ',
      children: profile.address,
    },
    {
      key: '7',
      label: 'Ngày tạo tài khoản',
      children: (profile.created_at) ? dayjs(profile.created_at.toLocaleString()).format('DD-MM-YYYY') : null,
    },
    {
      key: '8',
      label: 'Role',
      children: profile.role,
    },
  ];

  return (
    <div className={styles.profileContainer}>
      <Card className={styles.profileCard}>
        {/* Avatar + Họ Tên */}
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Upload
            showUploadList={false}
            accept="image/*"
            listType='picture-circle'
            customRequest={handleUpload}
          >
            <Avatar size={100} src={profile.avatar || undefined} icon={<UserOutlined />} />
          </Upload>
          <Title level={3}>{profile.name}</Title>
        </Space>

        {/* Thông tin chi tiết */}
        <Descriptions layout="vertical" bordered items={items} style={{ marginTop: 20, alignItems: 'center' }}/>
      </Card>
    </div>
  );
};

export default ProfilePage;
