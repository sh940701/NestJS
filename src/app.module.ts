import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { UsersController } from './users/users.controller';

@Module({
  imports: [UsersModule],
  controllers: [UsersController],
})
export class AppModule {
}
