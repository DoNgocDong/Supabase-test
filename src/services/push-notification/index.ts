import { User } from "@supabase/supabase-js";
import supabase from "../supabase";

const pushNotificationDb = 'push_subscriptions';

export async function saveSubscription(userId: string, subscription: PushSubscription) {
  const {error} = await supabase
    .from(pushNotificationDb)
    .upsert({
      user_id: userId,
      endpoint: subscription.toJSON().endpoint,
      keys: subscription.toJSON().keys,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .select()
    .single();

  if (error) {
    console.error('Error Save Subscription:', error);
    throw error;
  }
}

export async function callSendBrowserNoti(user: User, message: string) {
  const { error } = await supabase
    .functions
    .invoke('send-browser-notification', {
      body: JSON.stringify({
        user_id: user.id,
        payload: {
          senderName: user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.email,
          message: message
        }
      })
    });

  if (error) {
    console.error('Error Send Browser Noti:', error);
    throw error;
  }
}

export async function getVapidKey() {
  const { data, error } = await supabase
    .functions
    .invoke('get-vapid-key');

  if (error) {
    console.error('Error Get VapidKey:', error);
    throw error;
  }

  return data as string;
}