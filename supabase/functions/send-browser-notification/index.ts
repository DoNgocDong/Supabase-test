import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "jsr:@supabase/supabase-js@2.49.4";
import * as webPush from "jsr:@negrel/webpush@0.3.0";
import { vapidKeys as rootKey } from "../_shared/vapid.ts";

const supabase = createClient(Deno.env.get('SB_URI')!, Deno.env.get('SB_SERVICE_ROLE_KEY')!);

// Read vapid.json file and import keys.
const vapidKeys = await webPush.importVapidKeys(rootKey, {
  extractable: false,
});

const appServer = await webPush.ApplicationServer.new({
  contactInformation: 'mailto:ngocdong2110.2003@gmail.com',
  vapidKeys: vapidKeys
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { user_id, payload } = await req.json();

    const { senderName, message } = payload;
  
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single();
  
    if (error || !data) {
      return new Response('No subscription found', { status: 404 });
    }
  
    const subscription = {
      endpoint: data.endpoint,
      keys: data.keys
    };

    const subscriber = appServer.subscribe(subscription);

    await subscriber.pushTextMessage(
      JSON.stringify({
        title: `🔔 Thông báo mới đến từ ${senderName}`,
        body: message
      }),
      {}
    );

    return new Response("Notification sent", {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-browser-notification' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
