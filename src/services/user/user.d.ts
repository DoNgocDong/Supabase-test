export interface UserDTO {
  id: string,
  email: string;
  name: string;
  avatar?: string;
  dob?: Date;
  address?: string;
  provider?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  dob: Date;
  gender: string;
  address: string;
  created_at: string;
}