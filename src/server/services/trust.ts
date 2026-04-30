import 'server-only';

import type { ReportReason } from '@generated/prisma/client';
import { prisma } from '@/lib/db/prisma';
import { log } from '@/lib/log';

export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  reason: ReportReason,
  context?: string,
) {
  return prisma.report.create({
    data: { reporterId, reportedUserId, reason, description: context },
  });
}

export async function blockUser(blockerId: string, blockedId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: { blockerId, blockedId },
      update: {},
    });

    // Deactivate any match between them
    const [idA, idB] = [blockerId, blockedId].sort();
    await tx.match.updateMany({
      where: {
        OR: [
          { userAId: idA, userBId: idB },
          { userAId: idB, userBId: idA },
        ],
      },
      data: { active: false },
    });

    // Archive the shared conversation for both parties
    const match = await tx.match.findFirst({
      where: {
        OR: [
          { userAId: idA, userBId: idB },
          { userAId: idB, userBId: idA },
        ],
        conversationId: { not: null },
      },
      select: { conversationId: true },
    });

    if (match?.conversationId) {
      await tx.conversationParticipant.updateMany({
        where: { conversationId: match.conversationId },
        data: { archived: true },
      });
    }
  });

  log.info('user blocked', { blockerId, blockedId });
}
