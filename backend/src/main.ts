import 'dotenv/config'; // Add this at the top
import { NestFactory } from '@nestjs/core';

// Global BigInt serialization fix for Fastify/JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import { I18nExceptionFilter } from './common/filters/i18n-exception.filter';
import { I18nResponseInterceptor } from './common/interceptors/i18n-response.interceptor';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Set Global Prefix to match Sails.js /api paths
  app.setGlobalPrefix('api');

  // Enable Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable Global I18n translations
  app.useGlobalFilters(new I18nExceptionFilter());
  app.useGlobalInterceptors(new I18nResponseInterceptor());

  // 🚀 Performance: Enable Response Compression (Gzip, Brotli)
  await app.register(compression, { encodings: ['gzip', 'deflate'] });

  // 🛡️ Security: Add Helmet headers (HSTS, CSP, XSS protection, etc.)
  // await app.register(helmet, { ... });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('LexiNote API')
    .setDescription('The LexiNote API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Match Sails.js default port for easy switching
  const port = process.env.PORT || 1337;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://127.0.0.1:${port}`);
}
bootstrap();
// Trigger rebuild
