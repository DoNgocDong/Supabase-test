import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders as headers } from '../_shared/cors.ts';
import * as webPush from "jsr:@negrel/webpush@0.3.0";
import { encodeBase64Url } from "jsr:@std/encoding@0.224.0/base64url";
import { vapidKeys as rootKey } from "../_shared/vapid.ts";

// Read vapid.json file and import keys.
const vapidKeys = await webPush.importVapidKeys(rootKey, {
  extractable: false,
});

Deno.serve(async () => {
  const publicKey = encodeBase64Url(
    await crypto.subtle.exportKey(
      "raw",
      vapidKeys.publicKey,
    ),
  );

  return new Response(JSON.stringify(publicKey), { headers });
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-vapid-key' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
