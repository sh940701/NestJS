import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import * as uuid from 'uuid'
import { EmailService } from '../email/email.service'
import { UserInfo } from './UserInfo'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from '../entity/user.entity'
import { DataSource, Repository } from 'typeorm'
import { ulid } from 'ulid'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
    private dataSource: DataSource,
    private authService: AuthService,
  ) {
  }

  async saveUserUsingQueryRunner(name: string, email: string, password: string) {
    const queryRunner = this.dataSource.createQueryRunner()

    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const isUserExist = await queryRunner.manager.findOne('User', {
        where: {
          email,
        },
      })

      if (isUserExist) {
        throw new UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다.')
      }

      const user = new UserEntity()
      user.id = ulid()
      user.name = name
      user.email = email
      user.password = password
      user.signupVerifyToken = uuid.v1()

      await queryRunner.manager.save(user)

      await queryRunner.commitTransaction()

      await this.sendMemberJoinEmail(email, user.signupVerifyToken)
    } catch (e) {
      await queryRunner.rollbackTransaction()
      throw e
    } finally {
      await queryRunner.release()
    }
  }

  //
  // async createUser(name: string, email: string, password: string) {
  //   const userExist = await this.checkUserExists(email)
  //
  //   if (userExist) {
  //     throw new UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다.')
  //   }
  //
  //
  //   // await this.saveUser(name, email, password)
  //   //
  //   // await this.sendMemberJoinEmail(email)
  // }

  private async checkUserExists(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    })

    return user !== undefined
  }

  private async saveUser(name: string, email: string, password: string, signupVerifyToken: string) {
    const user = new UserEntity()
    user.id = ulid()
    user.name = name
    user.email = email
    user.password = password
    user.signupVerifyToken = signupVerifyToken

    await this.usersRepository.save(user)

  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerification(email, signupVerifyToken)
  }

  async verifyEmail(signupVerifyToken: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { signupVerifyToken },
    })

    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다.')
    }

    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { email, password },
    })

    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다.')
    }

    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    throw new Error('Method not implemented')
  }

}
