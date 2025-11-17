import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// console.log(process.env.PORT);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = 5000;
  console.log(`app is running on port: ${port}`);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  await app.listen(port);
}
bootstrap();
