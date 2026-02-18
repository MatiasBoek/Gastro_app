import { Module } from "@nestjs/common";
import { ItemsController } from "./items.controller";
import { ItemsService } from "./items.service";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
