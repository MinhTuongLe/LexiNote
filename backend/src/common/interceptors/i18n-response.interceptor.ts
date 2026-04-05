import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { translations } from '../i18n/translations';

@Injectable()
export class I18nResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const acceptLanguage = (request.headers['accept-language'] || 'en').split(',')[0].trim().toLowerCase();
    const lang = acceptLanguage.startsWith('vi') ? 'vi' : 'en';
    const currentDict = translations[lang] || translations['en'];

    return next.handle().pipe(
      map(data => {
        return this.translateData(data, currentDict);
      }),
    );
  }

  private translateData(data: any, dict: Record<string, string>): any {
    if (typeof data === 'string') {
      return dict[data] || data;
    }
    if (Array.isArray(data)) {
      return data.map(item => this.translateData(item, dict));
    }
    if (data !== null && typeof data === 'object') {
      const translatedObj: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          translatedObj[key] = this.translateData(data[key], dict);
        }
      }
      return translatedObj;
    }
    return data;
  }
}
