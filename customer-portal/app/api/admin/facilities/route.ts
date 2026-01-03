import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createFolder, getFolderUrl } from '@/lib/google/drive';
import { createFacilityManagementSheet } from '@/lib/google/sheets';

/**
 * POST /api/admin/facilities
 * 新しい施設を登録
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      planType,
      email,
      password,
      address,
      phone,
      latitude,
      longitude,
      bankName,
      bankBranch,
      bankAccountType,
      bankAccountNumber,
    } = body;

    // バリデーション
    if (!name || !planType || !email || !password) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // プランタイプの検証
    const validPlanTypes = ['FOCUS', 'ENTRY', 'FLEXIBLE'];
    if (!validPlanTypes.includes(planType)) {
      return NextResponse.json(
        { error: '無効なプランタイプです' },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 409 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // Googleドライブにフォルダを作成
    let driveFolderUrl = '';
    let facilitySpreadsheetUrl = '';

    try {
      const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
      if (!parentFolderId) {
        throw new Error('GOOGLE_DRIVE_PARENT_FOLDER_ID is not set');
      }

      // 施設フォルダを作成
      const folderId = await createFolder(name, parentFolderId);
      driveFolderUrl = await getFolderUrl(folderId);

      // 施設管理シートを作成
      const managementSheet = await createFacilityManagementSheet(name, folderId);
      facilitySpreadsheetUrl = managementSheet.url;
    } catch (error) {
      console.error('Google Drive/Sheets operation failed:', error);
      // Google APIエラーの場合は警告を返すが、施設登録は続行
      // 後で手動でフォルダ・シートを作成できる
    }

    // トランザクションで施設とユーザー（STAFF）を作成
    const result = await prisma.$transaction(async (tx) => {
      // 施設を作成
      const facility = await tx.facility.create({
        data: {
          name,
          planType,
          address,
          phone,
          email,
          latitude,
          longitude,
          driveFolderUrl,
          spreadsheetUrl: facilitySpreadsheetUrl,
          bankName,
          bankBranch,
          bankAccountType,
          bankAccountNumber,
        },
      });

      // 施設のログインアカウント（STAFF）を作成
      const staffUser = await tx.user.create({
        data: {
          facilityId: facility.id,
          role: 'STAFF',
          email,
          password: hashedPassword,
          name: `${name} 管理者`,
          status: 'ACTIVE',
        },
      });

      return { facility, staffUser };
    });

    return NextResponse.json({
      success: true,
      message: '施設を登録しました',
      facility: {
        id: result.facility.id,
        name: result.facility.name,
        planType: result.facility.planType,
        driveFolderUrl: result.facility.driveFolderUrl,
        spreadsheetUrl: result.facility.spreadsheetUrl,
      },
      staffUser: {
        id: result.staffUser.id,
        email: result.staffUser.email,
        name: result.staffUser.name,
      },
    });
  } catch (error) {
    console.error('Facility registration error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '施設登録中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/facilities
 * 施設一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        users: {
          where: { role: 'STAFF' },
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ facilities });
  } catch (error) {
    console.error('Failed to fetch facilities:', error);
    return NextResponse.json(
      { error: '施設一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
