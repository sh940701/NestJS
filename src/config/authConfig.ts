import { registerAs } from '@nestjs/config'
import * as process from 'process'

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_TOKEN_SECRET,
}))
