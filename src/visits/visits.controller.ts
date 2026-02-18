import { Body, Controller, Post } from "@nestjs/common";
import { VisitsService } from "./visits.service";

@Controller("visits")
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post("join")
  async join(@Body() body: { qrToken: string; userId: string }) {
    return this.visitsService.joinVisit(body.qrToken, body.userId);
  }
}
