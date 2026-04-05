import 'dotenv/config'; // Add this at the top
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
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

  // 🛡️ Security: Add Helmet headers (HSTS, CSP, XSS protection, etc.)
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  // 🛡️ Security: Enable CORS with tighter origins
  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all in dev if no origins specified, or if origin matches
      if (!isProd) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }
      }
      
      if (origin && allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        const error = new Error(`Origin ${origin} not allowed by CORS`);
        callback(error, false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Accept-Language, x-custom-lang',
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
