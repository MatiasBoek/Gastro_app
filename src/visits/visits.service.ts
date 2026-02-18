import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async joinVisit(qrToken: string, userId: string) {
    const table = await this.prisma.table.findUnique({
      where: { qrToken },
      include: { restaurant: true },
    });
    if (!table || !table.isActive) {
      throw new BadRequestException("QR inválido o mesa inactiva.");
    }

    // Buscar visita abierta para esa mesa
    let visit = await this.prisma.visit.findFirst({
      where: { tableId: table.id, status: "OPEN" },
    });

    // Si no existe, crearla
    if (!visit) {
      visit = await this.prisma.visit.create({
        data: {
          restaurantId: table.restaurantId,
          tableId: table.id,
          status: "OPEN",
        },
      });

      // Crear una order abierta para esa visita (simplifica MVP)
      await this.prisma.order.create({
        data: { visitId: visit.id, status: "OPEN" },
      });
    }

    // Agregar participante si no está
    await this.prisma.visitParticipant.upsert({
      where: { visitId_userId: { visitId: visit.id, userId } },
      update: {},
      create: { visitId: visit.id, userId },
    });

    // Traer estado actual: participantes + items sin reclamar
    const participants = await this.prisma.visitParticipant.findMany({
      where: { visitId: visit.id },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });

    const order = await this.prisma.order.findFirst({
      where: { visitId: visit.id, status: "OPEN" },
    });

    const unclaimedItems = order
      ? await this.prisma.orderItem.findMany({
          where: { orderId: order.id, status: "ORDERED", claimedByUserId: null },
          include: { dish: true },
          orderBy: { id: "asc" },
        })
      : [];

    return {
      visit,
      restaurant: table.restaurant,
      table: { id: table.id, label: table.label },
      participants: participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
      })),
      unclaimedItems: unclaimedItems.map((it) => ({
        id: it.id,
        dishName: it.dish.name,
        unitPrice: it.unitPrice,
      })),
    };
  }
}
