import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { translations } from '../i18n/translations';

@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();
    
    const acceptLanguage = (request.headers['accept-language'] || 'en').split(',')[0].trim().toLowerCase();
    console.log('[I18N FILTER DEBUG] Raw Accept-Language:', request.headers['accept-language'], '-> Parsed:', acceptLanguage);
    const lang = acceptLanguage.startsWith('vi') ? 'vi' : 'en';
    
    // Fallback to vi if not found in requested lang, or just use key
    const currentDict = translations[lang] || translations['en'];

    // NestJS default behaviour structure is { statusCode: 400, message: 'some message', error: 'Bad Request' }
    // or just a string.
    const exceptionResponse = exception.getResponse() as any;
    
    let translatedMessage = exceptionResponse.message || exception.message;

    // Translate if it's an array of strings (e.g., class-validator errors)
    // or just a single string
    if (Array.isArray(translatedMessage)) {
      translatedMessage = translatedMessage.map((msg: string) => currentDict[msg] || msg);
    } else if (typeof translatedMessage === 'string') {
      translatedMessage = currentDict[translatedMessage] || translatedMessage;
    }

    if (typeof exceptionResponse === 'object') {
      response.status(status).send({
        ...exceptionResponse,
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
