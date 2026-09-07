export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisteredUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}
