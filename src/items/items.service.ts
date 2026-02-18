import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

  async claim(itemId: string, userId: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: { include: { visit: true } }, dish: true },
    });
    if (!item || item.status !== "ORDERED") throw new BadRequestException("Item inválido.");
    if (item.claimedByUserId) throw new BadRequestException("Item ya reclamado.");

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { claimedByUserId: userId, claimedAt: new Date() },
    });

    this.rt.emitVisitEvent(item.order.visitId, "ITEM_CLAIMED", {
      itemId,
      userId,
    });

    return { ok: true, itemId: updated.id };
  }

  async unclaim(itemId: string, userId: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: { include: { visit: true } } },
    });
    if (!item) throw new BadRequestException("Item inválido.");
    if (item.claimedByUserId !== userId) {
      throw new BadRequestException("No podés devolver un item que no reclamaste.");
    }

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { claimedByUserId: null, claimedAt: null },
    });

    this.rt.emitVisitEvent(item.order.visitId, "ITEM_UNCLAIMED", {
      itemId,
      userId,
    });

    return { ok: true };
  }
}
