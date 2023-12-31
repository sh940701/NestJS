import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { EmailModule } from '../email/email.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../entity/user.entity'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule, EmailModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {
}
