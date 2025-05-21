import { join } from 'path';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly notificationService: NotificationService) {}

  @SubscribeMessage('getNotifications')
  async handleNotifications(client: Socket, @MessageBody() userId: string) {
    const notifications =
      await this.notificationService.findAllNotificationsForUser(userId);
    client.emit('notifications', notifications);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, payload: { id: string }) {
    const updated = await this.notificationService.makeAsRead(payload.id);
    client.emit('notificationRead', updated);
  }
}
