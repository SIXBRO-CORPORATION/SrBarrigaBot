import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import {AppModule} from './app.module.js';
import {GlobalExceptionFilter} from "./web/commons/global.exception.filter.js";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import {config as appConfig} from './security/configuration/env.js';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const config = new DocumentBuilder()
      .setTitle("Sr. Barriga Bot API")
      .setDescription("API Configuração de Bot de Whatsapp")
      .setBasePath("api")
      .setVersion("1.0")
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
  }));
  app.enableCors({
        origin: appConfig.corsOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
