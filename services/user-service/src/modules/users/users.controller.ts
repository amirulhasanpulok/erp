import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAccessGuard } from './auth/jwt-access.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Promise<Record<string, unknown>> {
    return this.usersService.create(dto);
  }

  @Get()
  list(@Query() query: ListUsersDto): Promise<Record<string, unknown>[]> {
    return this.usersService.list(query.outletId);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<Record<string, unknown>> {
    return this.usersService.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<Record<string, unknown>> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string): Promise<{ status: string }> {
    return this.usersService.deactivate(id);
  }
}

