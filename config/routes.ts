export default [
  {
    path: '/',
    redirect: '/home'
  },
  {
    name: 'Home',
    path: '/home',
    component: './Home',
    icon: 'HomeOutlined',
  },
  {
    path: '/login',
    component: './auth/login.tsx',
    layout: false,
    hideInMenu: true
  },
  {
    path: '/register',
    component: './auth/register.tsx',
    layout: false,
    hideInMenu: true
  },
  {
    name: 'Chat',
    path: '/chat',
    component: './chat',
    icon: 'MessageOutlined',
    wrappers: ['@/wrappers/auth'],
  },
  {
    name: 'Profile',
    path: '/profile',
    component: './user/profile',
    icon: 'InfoOutlined',
    hideInMenu: true,
    wrappers: ['@/wrappers/auth'],
    access: 'user',
  },
];
