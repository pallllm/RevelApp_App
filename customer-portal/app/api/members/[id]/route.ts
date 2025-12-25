import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/members/[id]
 * 利用者情報を更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, initials, startDate } = body;
    const memberId = params.id;

    // バリデーション
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // 利用者が存在するか確認
    const existingMember = await prisma.user.findUnique({
      where: { id: memberId }
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // メールアドレスの重複チェック（自分以外）
    if (email !== existingMember.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // 利用者情報を更新
    const updatedMember = await prisma.user.update({
      where: { id: memberId },
      data: {
        name,
        email,
        initials: initials || null,
        startDate: startDate ? new Date(startDate) : null,
      },
    });

    return NextResponse.json({
      member: {
        id: updatedMember.id,
        name: updatedMember.name,
        email: updatedMember.email,
        initials: updatedMember.initials,
        role: updatedMember.role,
        startDate: updatedMember.startDate?.toISOString(),
        status: updatedMember.status,
      }
    });

  } catch (error) {
    console.error('Failed to update member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/members/[id]
 * 利用者を削除（ステータスをCANCELLEDに変更）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = params.id;

    // 利用者が存在するか確認
    const existingMember = await prisma.user.findUnique({
      where: { id: memberId }
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // ステータスをCANCELLEDに変更（論理削除）
    const deletedMember = await prisma.user.update({
      where: { id: memberId },
      data: {
        status: 'CANCELLED',
        cancellationDate: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Member cancelled successfully',
      member: {
        id: deletedMember.id,
        status: deletedMember.status,
      }
    });

  } catch (error) {
    console.error('Failed to delete member:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}
