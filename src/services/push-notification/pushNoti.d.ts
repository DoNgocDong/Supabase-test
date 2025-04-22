export interface PushNotificationKeys {
  p256dh: string;
  auth: string;
}

export interface PushNotificationInfo {
  id: string;
  user_id: string;
  endpoint: string;
  keys: PushNotificationKeys;
  created_at: string;
  updated_at: string;
}