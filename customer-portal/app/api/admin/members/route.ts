export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSpreadsheet, SpreadsheetType } from '@/lib/google/sheets';

/**
 * POST /api/admin/members
 * 新しい利用者（MEMBER）を登録
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      name,
      email,
      spreadsheetType, // 'entry', 'focus_simple', 'focus_normal'
      startDate,
      initials,
    } = body;

    // バリデーション
    if (!facilityId || !name) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // 施設の存在確認とプランタイプ取得
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) {
      return NextResponse.json(
        { error: '指定された施設が見つかりません' },
        { status: 404 }
      );
    }

    // メールアドレスの重複チェック（メールアドレスが指定されている場合）
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に使用されています' },
          { status: 409 }
        );
      }
    }

    // スプレッドシートタイプのデフォルト値設定
    let finalSpreadsheetType: SpreadsheetType | undefined = spreadsheetType;

    if (!finalSpreadsheetType) {
      // プランタイプに基づいてデフォルトを設定
      if (facility.planType === 'ENTRY') {
        finalSpreadsheetType = 'entry';
      } else {
        finalSpreadsheetType = 'focus_normal'; // FOCUS/FLEXIBLE のデフォルト
      }
    }

    // Googleスプレッドシートを作成
    let userSpreadsheetUrl = '';

    try {
      if (!facility.driveFolderUrl) {
        throw new Error('施設のドライブフォルダが設定されていません');
      }

      // URLからフォルダIDを抽出
      const folderIdMatch = facility.driveFolderUrl.match(/\/folders\/([a-zA-Z0-9-_]+)/);
      if (!folderIdMatch) {
        throw new Error('施設のドライブフォルダURLが無効です');
      }

      const facilityFolderId = folderIdMatch[1];

      // 利用者用スプレッドシートを作成
      const userSheet = await createUserSpreadsheet({
        userName: name,
        facilityName: facility.name,
        facilityFolderId,
        planType: facility.planType,
        spreadsheetType: finalSpreadsheetType,
      });

      userSpreadsheetUrl = userSheet.url;
    } catch (error) {
      console.error('Google Sheets operation failed:', error);
      // スプレッドシート作成失敗の場合は警告を返すが、登録は続行
    }

    // 利用者（MEMBER）を作成
    const member = await prisma.user.create({
      data: {
        facilityId,
        role: 'MEMBER',
        email: email || `${facilityId}-${Date.now()}@placeholder.local`, // 仮のメール
        name,
        initials,
        spreadsheetUrl: userSpreadsheetUrl,
        spreadsheetType: finalSpreadsheetType,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: '利用者を登録しました',
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        spreadsheetUrl: member.spreadsheetUrl,
        spreadsheetType: member.spreadsheetType,
        startDate: member.startDate,
      },
    });
  } catch (error) {
    console.error('Member registration error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '利用者登録中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/members
 * 利用者一覧を取得（施設IDでフィルタ可能）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    const where = facilityId
      ? { facilityId, role: 'MEMBER' as const }
      : { role: 'MEMBER' as const };

    const members = await prisma.user.findMany({
      where,
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            planType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      { error: '利用者一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
