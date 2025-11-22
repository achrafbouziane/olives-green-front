export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  mustChangePassword?: boolean;
}

// Combined Request Type for Create/Update
export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password?: string; // Only for create
}