import { Body, Controller, Param, Post } from "@nestjs/common";
import { ItemsService } from "./items.service";

@Controller("order-items")
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post(":id/claim")
  claim(@Param("id") id: string, @Body() body: { userId: string }) {
    return this.itemsService.claim(id, body.userId);
  }

  @Post(":id/unclaim")
  unclaim(@Param("id") id: string, @Body() body: { userId: string }) {
    return this.itemsService.unclaim(id, body.userId);
  }
}
