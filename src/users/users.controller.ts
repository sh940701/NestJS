import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { UserLoginDto } from './dto/user-login.dto'
import { UserInfo } from './UserInfo'
import { UsersService } from './users.service'
import { AuthService } from '../auth/auth.service'
import { AuthGuard } from '../guard/authguard'

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<void> {
    const { name, email, password } = dto
    await this.usersService.saveUserUsingQueryRunner(name, email, password)
  }

  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<string> {
    const { signupVerifyToken } = dto

    return await this.usersService.verifyEmail(signupVerifyToken)
  }

  @Post('/login')
  async login(@Body() dto: UserLoginDto): Promise<string> {
    const { email, password } = dto

    return await this.usersService.login(email, password)
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUserInfo(@Headers() headers: any, @Param('id') userId: string): Promise<UserInfo> {
    return this.usersService.getUserInfo(userId)
  }

  @Get()
  findAll(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    console.log(offset, limit)

    // return this.usersService.findAll()
  }

}
