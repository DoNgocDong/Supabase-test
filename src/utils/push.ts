import services from "@/services";

const { getVapidKey } = services.PushNotification;

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push not supported');
    return;
  }

  const registration = await navigator.serviceWorker.register(
    '/sw.js',
    {
      scope: '/',
      type: 'module',
    }
  );

  const publicVapidKey = await fetch(
    'https://viywyymhxbmwgiadayfi.supabase.co/functions/v1/get-vapid-key', 
    {
      method: 'POST'
    })
    .then(res => res.json());

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  return subscription;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

