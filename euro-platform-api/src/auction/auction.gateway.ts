import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface BidPlacedEvent {
  auctionId: number;
  amount: number;
  bidderName: string;
  timestamp: string;
  currentHighestBid: number;
  bidsCount: number;
}

export interface AuctionClosedEvent {
  auctionId: number;
  state: string;
}

// No connection-time auth: watching an auction's live updates is exactly as public as
// GET /auctions/:id already is (@Public()). Only *placing* a bid needs auth, and that still
// goes through the authenticated REST endpoints in BidService -- this gateway is purely
// server -> client push, never a mutation path, so it stays unauthenticated by design.
@WebSocketGateway({ cors: { origin: true } })
export class AuctionGateway {
  @WebSocketServer()
  private server!: Server;

  private room(auctionId: number): string {
    return `auction:${auctionId}`;
  }

  @SubscribeMessage('joinAuction')
  handleJoinAuction(@ConnectedSocket() client: Socket, @MessageBody() auctionId: number): void {
    client.join(this.room(auctionId));
  }

  @SubscribeMessage('leaveAuction')
  handleLeaveAuction(@ConnectedSocket() client: Socket, @MessageBody() auctionId: number): void {
    client.leave(this.room(auctionId));
  }

  emitBidPlaced(auctionId: number, payload: BidPlacedEvent): void {
    this.server.to(this.room(auctionId)).emit('bidPlaced', payload);
  }

  emitAuctionClosed(auctionId: number, payload: AuctionClosedEvent): void {
    this.server.to(this.room(auctionId)).emit('auctionClosed', payload);
  }
}
