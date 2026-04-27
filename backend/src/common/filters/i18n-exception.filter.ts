import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { translations } from '../i18n/translations';

@Catch()
export class I18nExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    
    // Log ALL errors to a file for debugging
    const fs = require('fs');
    fs.appendFileSync('error.log', `\n[${new Date().toISOString()}] ${request.url}\n${exception.stack || exception}\n`);

    const acceptLanguage = (request.headers['accept-language'] || 'en').split(',')[0].trim().toLowerCase();
    const lang = acceptLanguage.startsWith('vi') ? 'vi' : 'en';
    
    const currentDict = translations[lang] || translations['en'];

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : { message: 'Internal server error' };
    
    let translatedMessage = (exceptionResponse as any).message || exception.message;

    if (Array.isArray(translatedMessage)) {
      translatedMessage = translatedMessage.map((msg: string) => currentDict[msg] || msg);
    } else if (typeof translatedMessage === 'string') {
      translatedMessage = currentDict[translatedMessage] || translatedMessage;
    }

    if (typeof exceptionResponse === 'object') {
      response.status(status).send({
        ...(exceptionResponse as object),
        message: translatedMessage,
      });
    } else {
      response.status(status).send({
        statusCode: status,
        message: translatedMessage,
      });
    }
  }
}
