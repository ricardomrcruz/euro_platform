import { Injectable } from '@nestjs/common';
import { DataSource, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { AuctionState } from './enums/auction-state.enum';
import { SearchAuctionsDto } from './dto/search-auctions.dto';

const FINISHED_STATES = [AuctionState.SOLD, AuctionState.EXPIRED] as const;

// Mirrors AD_RELATIONS in ad.repository.ts so auction responses carry the same vehicle/photo
// data the ad endpoints already return -- needed by the frontend homepage/detail pages.
const AUCTION_RELATIONS = {
  ad: { vehicle: { make: true, model: true, trim: true }, photos: true },
} as const;

@Injectable()
export class AuctionRepository extends Repository<Auction> {
  constructor(dataSource: DataSource) {
    super(Auction, dataSource.createEntityManager());
  }

  findLive(): Promise<Auction[]> {
    return this.find({
      where: { state: AuctionState.LIVE },
      relations: AUCTION_RELATIONS,
      order: { endDate: 'ASC' },
    });
  }

  findByIdWithRelations(id: number): Promise<Auction | null> {
    return this.findOne({ where: { id }, relations: AUCTION_RELATIONS });
  }

  findExpiredLive(): Promise<Auction[]> {
    return this.find({
      where: { state: AuctionState.LIVE, endDate: LessThanOrEqual(new Date()) },
      relations: AUCTION_RELATIONS,
    });
  }

  findExistingForAd(adId: number): Promise<Auction | null> {
    return this.findOne({ where: { ad: { id: adId } } });
  }

  // Most-recently-ended first -- callers append this after findLive() results.
  findFinishedSince(cutoff: Date): Promise<Auction[]> {
    return this.find({
      where: FINISHED_STATES.map((state) => ({ state, endDate: MoreThanOrEqual(cutoff) })),
      relations: AUCTION_RELATIONS,
      order: { endDate: 'DESC' },
    });
  }

  // Live auctions first (soonest-ending first), then every finished match (most-recently-
  // ended first) -- same ordering as the unfiltered browse feed, just with filters applied.
  searchAuctions(filters: SearchAuctionsDto): Promise<Auction[]> {
    const qb = this.createQueryBuilder('auction')
      .leftJoinAndSelect('auction.ad', 'ad')
      .leftJoinAndSelect('ad.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.make', 'make')
      .leftJoinAndSelect('vehicle.model', 'model')
      .leftJoinAndSelect('vehicle.trim', 'trim')
      .leftJoinAndSelect('ad.photos', 'photos');

    if (filters.q) {
      qb.andWhere('(ad.title ILIKE :q OR ad.description ILIKE :q)', { q: `%${filters.q}%` });
    }
    if (filters.make) {
      qb.andWhere('make.name ILIKE :make', { make: filters.make });
    }
    if (filters.model) {
      qb.andWhere('model.name ILIKE :model', { model: filters.model });
    }
    if (filters.trim) {
      qb.andWhere('trim.name ILIKE :trim', { trim: filters.trim });
    }
    if (filters.yearMin != null) {
      qb.andWhere('vehicle.year >= :yearMin', { yearMin: filters.yearMin });
    }
    if (filters.yearMax != null) {
      qb.andWhere('vehicle.year <= :yearMax', { yearMax: filters.yearMax });
    }
    if (filters.mileageMin != null) {
      qb.andWhere('vehicle.mileage >= :mileageMin', { mileageMin: filters.mileageMin });
    }
    if (filters.mileageMax != null) {
      qb.andWhere('vehicle.mileage <= :mileageMax', { mileageMax: filters.mileageMax });
    }
    if (filters.horsepowerMin != null) {
      qb.andWhere('vehicle.horsepower >= :horsepowerMin', { horsepowerMin: filters.horsepowerMin });
    }
    if (filters.horsepowerMax != null) {
      qb.andWhere('vehicle.horsepower <= :horsepowerMax', { horsepowerMax: filters.horsepowerMax });
    }
    if (filters.fiscalPowerMin != null) {
      qb.andWhere('vehicle.fiscalPower >= :fiscalPowerMin', { fiscalPowerMin: filters.fiscalPowerMin });
    }
    if (filters.fiscalPowerMax != null) {
      qb.andWhere('vehicle.fiscalPower <= :fiscalPowerMax', { fiscalPowerMax: filters.fiscalPowerMax });
    }
    if (filters.fuelType) {
      qb.andWhere('vehicle.fuelType = :fuelType', { fuelType: filters.fuelType });
    }
    if (filters.transmission) {
      qb.andWhere('vehicle.transmission = :transmission', { transmission: filters.transmission });
    }
    if (filters.drivetrain) {
      qb.andWhere('vehicle.drivetrain = :drivetrain', { drivetrain: filters.drivetrain });
    }
    if (filters.bodyType) {
      qb.andWhere('model.bodyType = :bodyType', { bodyType: filters.bodyType });
    }
    if (filters.color) {
      qb.andWhere('vehicle.exteriorColor = :color', { color: filters.color });
    }
    if (filters.condition) {
      qb.andWhere('ad.condition = :condition', { condition: filters.condition });
    }
    if (filters.numberOfDoors != null) {
      qb.andWhere('vehicle.numberOfDoors = :numberOfDoors', { numberOfDoors: filters.numberOfDoors });
    }
    if (filters.numberOfSeats != null) {
      qb.andWhere('vehicle.numberOfSeats = :numberOfSeats', { numberOfSeats: filters.numberOfSeats });
    }
    if (filters.priceMin != null) {
      qb.andWhere('COALESCE(auction.currentHighestBid, auction.reservePrice) >= :priceMin', {
        priceMin: filters.priceMin,
      });
    }
    if (filters.priceMax != null) {
      qb.andWhere('COALESCE(auction.currentHighestBid, auction.reservePrice) <= :priceMax', {
        priceMax: filters.priceMax,
      });
    }

    qb.orderBy(`CASE WHEN auction.state = '${AuctionState.LIVE}' THEN 0 ELSE 1 END`, 'ASC')
      .addOrderBy(`CASE WHEN auction.state = '${AuctionState.LIVE}' THEN auction.endDate END`, 'ASC')
      .addOrderBy(`CASE WHEN auction.state != '${AuctionState.LIVE}' THEN auction.endDate END`, 'DESC');

    return qb.getMany();
  }
}
