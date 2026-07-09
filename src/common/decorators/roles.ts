import { SetMetadata } from "@nestjs/common";
import { Roles } from "@prisma/client";

export const RolesGuard = (...roles: Roles[]) => SetMetadata("roles", roles)