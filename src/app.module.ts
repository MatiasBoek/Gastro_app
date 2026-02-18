import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { VisitsModule } from "./visits/visits.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { StaffModule } from "./staff/staff.module";
import { ItemsModule } from "./items/items.module";

@Module({
  imports: [PrismaModule, RealtimeModule, VisitsModule, StaffModule, ItemsModule],
})
export class AppModule {}
