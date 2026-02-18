import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("room:join")
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    await client.join(data.room);
    return { ok: true, room: data.room };
  }

  emitVisitEvent(visitId: string, event: string, payload: any) {
    this.server.to(`visit:${visitId}`).emit(event, payload);
  }
}