import {
  Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginMedecinDto, LoginPatientDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('medecin/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  loginMedecin(@Body() dto: LoginMedecinDto) {
    return this.authService.loginMedecin(dto);
  }

  @Post('patient/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  loginPatient(@Body() dto: LoginPatientDto) {
    return this.authService.loginPatient(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return { user };
  }
}
