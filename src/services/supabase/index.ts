import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  REACT_APP_SUPABASE_URI, 
  REACT_APP_SUPABASE_API_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

export default supabase;