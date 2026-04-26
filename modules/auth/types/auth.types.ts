export interface LoginRequest {
  mobile: string
  password: string
}

export interface AuthApiUser {
  user_id: number
  first_name: string
  last_name: string
  mobile: string
  email: string
  role: string
}

export interface LoginResponse {
  accessToken?: string
  access_token?: string
  refresh_token?: string
  user?: AuthApiUser
  data?: {
    accessToken?: string
    access_token?: string
    user?: AuthApiUser
  }
}
