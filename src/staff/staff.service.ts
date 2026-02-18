import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";

type CreatedItem = Prisma.OrderItemGetPayload<{ include: { dish: true } }>;

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

  async addItemsToVisit(
    visitId: string,
    data: { dishId: string; qty: number; unitPrice: string; notesStaff?: string },
  ) {
    if (!Number.isInteger(data.qty) || data.qty <= 0 || data.qty > 50) {
      throw new BadRequestException("qty inválida.");
    }

    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.status !== "OPEN") {
      throw new BadRequestException("Visita inexistente o cerrada.");
    }

    const order = await this.prisma.order.findFirst({
      where: { visitId: visit.id, status: "OPEN" },
    });
    if (!order) throw new BadRequestException("No hay order abierta.");

    // Crear N unidades (cada unidad = 1 OrderItem distinto)
    const ops: Prisma.PrismaPromise<CreatedItem>[] = Array.from({ length: data.qty }, () =>
      this.prisma.orderItem.create({
        data: {
          orderId: order.id,
          dishId: data.dishId,
          unitPrice: data.unitPrice,
          notesStaff: data.notesStaff,
          status: "ORDERED",
        },
        include: { dish: true },
      }),
    );

    const created = await this.prisma.$transaction(ops);

    // Notificar a la sala
    this.rt.emitVisitEvent(visit.id, "ORDER_ITEMS_ADDED", {
      items: created.map((it) => ({
        id: it.id,
        dishName: it.dish.name,
        unitPrice: it.unitPrice,
      })),
    });

    return { ok: true, createdCount: created.length };
  }
}
