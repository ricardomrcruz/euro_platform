import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AdPhoto } from './entities/ad-photo.entity';

@Injectable()
export class AdPhotoRepository extends Repository<AdPhoto> {
  constructor(dataSource: DataSource) {
    super(AdPhoto, dataSource.createEntityManager());
  }

  countForAd(adId: number): Promise<number> {
    return this.count({ where: { ad: { id: adId } } });
  }
}
