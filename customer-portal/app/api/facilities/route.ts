import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AuthenticationError, NotFoundError } from '@/lib/utils/errors';

/**
 * GET /api/facilities
 * 現在ログイン中のユーザーの事業所情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // 事業所情報を取得
    const facility = await prisma.facility.findUnique({
      where: { id: user.facilityId },
      include: {
        users: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            initials: true,
            role: true,
            startDate: true,
          },
        },
        facilityGames: {
          include: {
            game: true,
          },
        },
      },
    });

    if (!facility) {
      throw new NotFoundError('Facility');
    }

    return successResponse({
      facility: {
        id: facility.id,
        name: facility.name,
        planType: facility.planType,
        address: facility.address,
        phone: facility.phone,
        email: facility.email,
        memberCount: facility.users.length,
        members: facility.users,
        games: facility.facilityGames.map((fg) => ({
          id: fg.game.id,
          name: fg.game.name,
          level: fg.game.level,
          isBackup: fg.isBackup,
          imageUrl: fg.game.imageUrl,
          manualUrl: fg.game.manualUrl,
          videoUrl: fg.game.videoUrl,
        })),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/facilities
 * 事業所情報を更新（スタッフのみ）
 */
export async function PATCH(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // スタッフ権限チェック
    if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
      throw new AuthenticationError('Only staff members can update facility information');
    }

    // リクエストボディ取得
    const body = await request.json();
    const { name, address, phone, email, bankName, bankBranch, bankAccountType, bankAccountNumber } = body;

    // 事業所情報を更新
    const updatedFacility = await prisma.facility.update({
      where: { id: user.facilityId },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(bankName !== undefined && { bankName }),
        ...(bankBranch !== undefined && { bankBranch }),
        ...(bankAccountType !== undefined && { bankAccountType }),
        ...(bankAccountNumber !== undefined && { bankAccountNumber }),
      },
    });

    return successResponse({
      facility: updatedFacility,
      message: 'Facility information updated successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}
