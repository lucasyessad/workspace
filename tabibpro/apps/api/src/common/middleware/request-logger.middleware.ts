import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const ms = Date.now() - start;
      // Ne pas logger les health checks
      if (originalUrl === '/health') return;
      this.logger.log(`${method} ${originalUrl} ${statusCode} — ${ms}ms — ${ip}`);
    });

    next();
  }
}
