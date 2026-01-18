import { NextResponse } from 'next/server';
import { ApiError } from './errors';

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: unknown, statusCode?: number) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details && { details: error.details }),
      },
      { status: statusCode || error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: statusCode || 500 }
    );
  }

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
    },
    { status: statusCode || 500 }
  );
}

export function createdResponse<T>(data: T) {
  return successResponse(data, 201);
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}
