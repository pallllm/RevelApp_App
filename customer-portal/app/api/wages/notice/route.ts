import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isStaffOrAbove } from '@/lib/auth/verify';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/utils/response';
import {
  generateNoticePdf,
  generateNoticeNumber,
  NoticeData,
  GameBreakdown,
} from '@/lib/services/notice-generator';

/**
 * GET /api/wages/notice?year=2025&month=12
 * 報酬決定通知書PDFを生成してダウンロード
 */
export async function GET(request: NextRequest) {
  try {
    // 認証
    const user = await verifyAuth(request);

    // スタッフ以上の権限チェック
    if (!isStaffOrAbove(user)) {
      return errorResponse(new Error('Permission denied'), 403);
    }

    // URLパラメータから年月を取得
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');

    if (!year || !month) {
      return errorResponse(
        new Error('year and month parameters are required'),
        400
      );
    }

    // 施設情報を取得
    const facility = await prisma.facility.findUnique({
      where: { id: user.facilityId },
    });

    if (!facility) {
      return errorResponse(new Error('Facility not found'), 404);
    }

    // 対象の工賃レコードを取得
    const monthlyWage = await prisma.monthlyWage.findUnique({
      where: {
        facilityId_year_month: {
          facilityId: user.facilityId,
          year,
          month,
        },
      },
      include: {
        memberMonthlyWages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                continuationMonths: true,
              },
            },
          },
        },
      },
    });

    if (!monthlyWage) {
      return errorResponse(
        new Error('Wage record not found. Please calculate wages first.'),
        404
      );
    }

    // 繰越金情報を取得
    const carryover = await prisma.wageCarryover.findUnique({
      where: {
        facilityId_year_month: {
          facilityId: user.facilityId,
          year,
          month,
        },
      },
    });

    // 前月の繰越金を取得
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const previousCarryover = await prisma.wageCarryover.findUnique({
      where: {
        facilityId_year_month: {
          facilityId: user.facilityId,
          year: prevYear,
          month: prevMonth,
        },
      },
    });

    // 繰越金額の計算
    const carryoverFromPrevious = previousCarryover?.amount || 0;
    const carryoverToNext = carryover?.amount || 0;
    const paymentAmount = monthlyWage.totalAmount + carryoverFromPrevious - carryoverToNext;

    // 対象月の期間を計算
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 各メンバーのゲームプレイ内訳を取得
    const memberIds = monthlyWage.memberMonthlyWages.map((mw) => mw.user.id);
    const gamePlayRecords = await prisma.gamePlayRecord.findMany({
      where: {
        userId: { in: memberIds },
        playedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        game: {
          select: {
            name: true,
            level: true,
          },
        },
      },
    });

    // メンバーごとのゲーム内訳を集計
    const memberGameBreakdowns = new Map<string, GameBreakdown[]>();
    for (const mw of monthlyWage.memberMonthlyWages) {
      const userPlays = gamePlayRecords.filter((r) => r.userId === mw.user.id);
      const gameMap = new Map<string, GameBreakdown>();

      for (const play of userPlays) {
        const key = `${play.game.name}-${play.game.level}`;
        if (!gameMap.has(key)) {
          gameMap.set(key, {
            gameName: play.game.name,
            gameLevel: play.game.level,
            playCount: 0,
            amount: 0,
          });
        }
        const breakdown = gameMap.get(key)!;
        breakdown.playCount += 1;
      }

      // 金額は合計から按分（正確な計算はwage-calculatorで行われるが、ここでは概算）
      const totalPlays = userPlays.length;
      const breakdowns = Array.from(gameMap.values());
      if (totalPlays > 0) {
        const amountPerPlay = mw.amount / totalPlays;
        for (const breakdown of breakdowns) {
          breakdown.amount = Math.round(amountPerPlay * breakdown.playCount);
        }
      }

      memberGameBreakdowns.set(mw.user.id, breakdowns);
    }

    // 報酬決定通知書データを構築
    const noticeData: NoticeData = {
      noticeNumber: generateNoticeNumber(facility.id, year, month),
      issueDate: new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      targetYear: year,
      targetMonth: month,
      facilityName: facility.name,
      members: monthlyWage.memberMonthlyWages.map((mw) => ({
        name: mw.user.name,
        playCount: mw.playCount,
        amount: mw.amount,
        gameBreakdown: memberGameBreakdowns.get(mw.user.id) || [],
      })),
      totalAmount: monthlyWage.totalAmount,
      carryoverFromPrevious,
      carryoverToNext,
      paymentAmount,
      paymentDate: monthlyWage.paymentDate
        ? new Date(monthlyWage.paymentDate).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : undefined,
    };

    // PDF生成
    const pdfBuffer = await generateNoticePdf(noticeData);

    // PDFレスポンスを返す
    const filename = `notice_${year}${String(month).padStart(2, '0')}_${facility.name}.pdf`;

    // BufferをUint8Arrayに変換
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Notice generation error:', error);
    return errorResponse(error);
  }
}
