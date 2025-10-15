import { UserRole } from "@prisma/client";

export interface IJwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
