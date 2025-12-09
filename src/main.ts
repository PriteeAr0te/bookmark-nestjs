import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// console.log(process.env.PORT);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = 5000;
  console.log(`app is running on port: ${port}`);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  await app.listen(port);
}
bootstrap();
