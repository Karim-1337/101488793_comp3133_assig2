export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
  profilePictureUrl?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
