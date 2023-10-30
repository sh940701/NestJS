import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { loggerFunc } from './middleware/logger.middleware'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }))
  app.use(loggerFunc)
  await app.listen(3000)
}

bootstrap()
