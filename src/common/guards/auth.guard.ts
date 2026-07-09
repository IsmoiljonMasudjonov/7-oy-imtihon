import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { GenerateToken } from "src/core/utils/jwt";


@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private generateToken: GenerateToken){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        try {
            const req = context.switchToHttp().getRequest()
            let token = req.headers.authorization

            if (!token){
                throw new UnauthorizedException()
            }
            token = req.headers.authorization.split(" ")[1]

            const user = await this.generateToken.verifyToken(token)
            req["user"] = user

            return true
        } catch (error) {
            throw new BadRequestException("Jwt expired");
        }
    }
}