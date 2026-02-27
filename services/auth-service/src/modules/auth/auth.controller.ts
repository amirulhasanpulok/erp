import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAuth } from './decorators/current-auth.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { AuthService } from './auth.service';
import { JwtAuthPayload } from './types/jwt-auth-payload.type';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOkResponse({ type: AuthResponseDto })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOkResponse({ type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: LogoutDto): Promise<{ status: string }> {
    await this.authService.logout(dto.refreshToken);
    return { status: 'logged_out' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  profile(@CurrentAuth() auth: JwtAuthPayload): JwtAuthPayload {
    return auth;
  }
}

