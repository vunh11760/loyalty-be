import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, body } = this.normalize(exception);

    this.logger.warn(
      `${request.method} ${request.url} ${statusCode} - ${JSON.stringify(body)}`,
    );
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error) {
      this.logger.error(exception.stack);
    }

    response.status(statusCode).json(body);
  }

  private normalize(exception: unknown): { statusCode: number; body: Record<string, unknown> } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as { message?: string | string[] }).message
          : exception.message;
      return {
        statusCode: status,
        body: {
          statusCode: status,
          error: (res as { error?: string })?.error ?? exception.name,
          message: Array.isArray(message) ? message : message,
        },
      };
    }

    if (exception instanceof Error) {
      const isProd = process.env.NODE_ENV === 'production';
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: isProd
            ? 'An unexpected error occurred.'
            : exception.message,
        },
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
      },
    };
  }
}
