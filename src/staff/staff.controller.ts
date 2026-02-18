import { Body, Controller, Post, Param } from "@nestjs/common";
import { StaffService } from "./staff.service";

@Controller("staff")
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post("visits/:visitId/items")
  async addItems(
    @Param("visitId") visitId: string,
    @Body()
    body: { dishId: string; qty: number; unitPrice: string; notesStaff?: string },
  ) {
    return this.staffService.addItemsToVisit(visitId, body);
  }
}
