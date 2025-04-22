import { defineConfig } from '@umijs/max';
import routes from './routes';

export default defineConfig({
  define: {
    REACT_APP_SUPABASE_URI: process.env.REACT_APP_SUPABASE_URI,
    REACT_APP_SUPABASE_API_KEY: process.env.REACT_APP_SUPABASE_API_KEY,
    PUBLIC_VAPID_KEY: process.env.PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY: process.env.PRIVATE_VAPID_KEY,
    PUBLIC_PAGE_PATH: ['login', 'home', 'register']
  },
  icons: {},
  hash: true,
  antd: {},
  access: {},
  mako: {},
  model: {},
  dva: {},
  initialState: {},
  request: {},
  layout: {
    title: 'Supabase - Client',
    siderWidth: '10%'
  },
  favicons: [
    '/favicon.svg'
  ],
  locale: {
    default: 'vi-VN',
    antd: true,
  },
  routes,
  npmClient: 'pnpm',
});
