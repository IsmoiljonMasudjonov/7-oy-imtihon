import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";


@Injectable()
export class RoleGuard implements CanActivate{
    constructor(private reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest()
        const roles = this.reflector.getAllAndOverride("roles", [context.getHandler(), context.getClass()])

        if (!roles.includes(req.user.role)){
            throw new ForbiddenException()
        }

        return true
    }
}