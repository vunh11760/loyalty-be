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

    try {
      const { statusCode, body } = this.normalize(exception);

      this.logger.warn(
        `${request.method} ${request.url} ${statusCode} - ${JSON.stringify(body)}`,
      );
      if (
        statusCode === HttpStatus.INTERNAL_SERVER_ERROR &&
        exception instanceof Error
      ) {
        this.logger.error(exception.stack);
      }

      response.status(statusCode).json(body);
    } catch (filterError) {
      this.logger.error('Exception filter failed', filterError);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
      });
    }
  }

  private normalize(
    exception: unknown,
  ): { statusCode: number; body: Record<string, unknown> } {
    if (exception instanceof HttpException) {
      try {
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
      } catch {
        return {
          statusCode: exception.getStatus(),
          body: {
            statusCode: exception.getStatus(),
            error: 'Error',
            message: exception.message,
          },
        };
      }
    }

    const msg = this.getExceptionMessage(exception);
    const msgLower = msg.toLowerCase();
    const isProfilesTableMissing =
      msgLower.includes('schema cache') ||
      msgLower.includes('could not find the table') ||
      (msgLower.includes('profiles') &&
        (msgLower.includes('cache') ||
          msgLower.includes('table') ||
          msgLower.includes('relation')));

    if (isProfilesTableMissing) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        body: {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Profiles table missing',
          message:
            'Create the table in Supabase: Dashboard → SQL Editor → run supabase/create-profiles-table.sql',
        },
      };
    }

    const isProd = process.env.NODE_ENV === 'production';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: isProd ? 'An unexpected error occurred.' : msg,
      },
    };
  }

  private getExceptionMessage(exception: unknown): string {
    if (exception instanceof Error) return exception.message ?? '';
    if (typeof exception === 'object' && exception !== null && 'message' in exception) {
      const m = (exception as { message?: unknown }).message;
      return typeof m === 'string' ? m : String(m);
    }
    return String(exception);
  }
}
