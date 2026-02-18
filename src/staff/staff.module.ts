import { Module } from "@nestjs/common";
import { StaffController } from "./staff.controller";
import { StaffService } from "./staff.service";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
