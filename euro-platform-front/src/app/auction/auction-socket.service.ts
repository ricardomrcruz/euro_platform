import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import type { AuctionState } from './interfaces/auction.interface';

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
  state: AuctionState;
}

// Kept separate from the HTTP-only AuctionService -- this is purely a server -> client push
// channel for live updates, never used to mutate anything (bids/buy-now stay authenticated
// REST calls). Connects same-origin with no explicit URL, which works through both the
// nginx prod path and the ng-serve dev proxy (see nginx.conf / proxy.conf.json).
@Injectable({ providedIn: 'root' })
export class AuctionSocketService {
  private socket: Socket | null = null;

  private ensureConnected(): Socket {
    if (!this.socket) {
      this.socket = io();
    }
    return this.socket;
  }

  joinAuction(auctionId: number): void {
    this.ensureConnected().emit('joinAuction', auctionId);
  }

  leaveAuction(auctionId: number): void {
    this.socket?.emit('leaveAuction', auctionId);
  }

  onBidPlaced(): Observable<BidPlacedEvent> {
    return new Observable((subscriber) => {
      const socket = this.ensureConnected();
      const handler = (event: BidPlacedEvent) => subscriber.next(event);
      socket.on('bidPlaced', handler);
      return () => socket.off('bidPlaced', handler);
    });
  }

  onAuctionClosed(): Observable<AuctionClosedEvent> {
    return new Observable((subscriber) => {
      const socket = this.ensureConnected();
      const handler = (event: AuctionClosedEvent) => subscriber.next(event);
      socket.on('auctionClosed', handler);
      return () => socket.off('auctionClosed', handler);
    });
  }
}
