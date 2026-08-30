import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AdMessage } from './entities/ad-message.entity';

@Injectable()
export class AdMessageRepository extends Repository<AdMessage> {
  constructor(dataSource: DataSource) {
    super(AdMessage, dataSource.createEntityManager());
  }

  findByAdOrdered(adId: number): Promise<AdMessage[]> {
    return this.find({ where: { ad: { id: adId } }, order: { createdAt: 'ASC' } });
  }
}
