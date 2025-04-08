import { User } from "@supabase/supabase-js";
import { UserRole } from "./libs/schema";
import { UserInfo } from "./services/user/user";

export default function access(initialState: { 
  user?: User,
  profile?: UserInfo
}){
  if(!initialState.profile) {
    return {
      admin: false,
      user: false
    }
  }

  const { role } = initialState.profile;
  
  const admin = !!(
    role == UserRole.ADMIN
  );

  const user = !!(
    role == UserRole.USER
  );

  return {
    admin, user
  };
};
