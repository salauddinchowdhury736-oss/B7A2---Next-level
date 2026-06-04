export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: 'contributor' | 'maintainer';
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
  created_at: string;
  updated_at: string;
}

export type SafeUser = Omit<UserRecord, 'password'>;
