export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

/**
 * GET /api/test/hello
 * シンプルな接続テスト
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Hello! API is working!',
    timestamp: new Date().toISOString(),
  });
}
