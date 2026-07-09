import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import { RegisterDto } from './dto/register';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("register")
	register(@Body() payload: RegisterDto) {
		return this.authService.register(payload);
	}

	@Post("login")
	login(@Body() payload: LoginDto) {
		return this.authService.login(payload);
	}

	@Post("logout")
	logout(@Req() req: Request){
		return this.authService.logout(req);
	}
}
