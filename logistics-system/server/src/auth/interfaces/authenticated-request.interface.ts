import { Request } from 'express';

interface UserInterface {
  id: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserInterface;
}
