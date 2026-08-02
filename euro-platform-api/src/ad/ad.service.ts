import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { VehicleFactoryService } from '../vehicle/vehicle-factory.service';
import type { RequestUser } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../auth/enums/user-role.enum';
import { Ad } from './entities/ad.entity';
import { AdPhoto } from './entities/ad-photo.entity';
import { AdMessage } from './entities/ad-message.entity';
import { AdStatus } from './enums/ad-status.enum';
import { CreateAdDto } from './dto/create-ad.dto';
import { CreateAdPhotoDto } from './dto/create-ad-photo.dto';

// Design doc 6.2.1.2 "limite atteinte": a cap on how many ads a seller can have active at
// once, not a VIN-lookup fallback (see VehicleFactoryService.resolveByVin for that one).
const MAX_ACTIVE_ADS_PER_SELLER = 5;
const ACTIVE_STATUSES = [AdStatus.DRAFT, AdStatus.REVIEW, AdStatus.VALIDATED];

const AD_RELATIONS = {
  vehicle: { make: true, model: true, trim: true },
  photos: true,
} as const;

@Injectable()
export class AdService {
  constructor(
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,
    @InjectRepository(AdPhoto)
    private readonly adPhotoRepository: Repository<AdPhoto>,
    @InjectRepository(AdMessage)
    private readonly adMessageRepository: Repository<AdMessage>,
    private readonly vehicleFactory: VehicleFactoryService,
  ) {}

  async createAd(sellerId: number, dto: CreateAdDto): Promise<Ad> {
    const activeCount = await this.adRepository.count({
      where: { sellerId, status: In(ACTIVE_STATUSES) },
    });
    if (activeCount >= MAX_ACTIVE_ADS_PER_SELLER) {
      throw new ForbiddenException(
        `Active ad limit reached (max ${MAX_ACTIVE_ADS_PER_SELLER} per seller)`,
      );
    }

    const vehicle = await this.vehicleFactory.createVehicle({
      makeId: dto.makeId,
      modelId: dto.modelId,
      trimId: dto.trimId,
      vin: dto.vin,
      year: dto.year,
      exteriorColor: dto.exteriorColor,
      interiorColor: dto.interiorColor,
      mileage: dto.mileage,
      numberOfOwners: dto.numberOfOwners,
      plateCountry: dto.plateCountry,
    });

    const ad = this.adRepository.create({
      title: dto.title,
      description: dto.description,
      condition: dto.condition,
      highlights: dto.highlights,
      knownFlaws: dto.knownFlaws,
      modifications: dto.modifications,
      serviceHistory: dto.serviceHistory,
      location: dto.location,
      sellerId,
      vehicle,
    });

    return this.adRepository.save(ad);
  }

  async submitAd(sellerId: number, adId: number): Promise<Ad> {
    const ad = await this.findOwnedOrThrow(adId, sellerId);
    ad.submit();
    return this.adRepository.save(ad);
  }

  async validateAd(adId: number): Promise<Ad> {
    const ad = await this.findByIdOrThrow(adId);
    ad.validate();
    return this.adRepository.save(ad);
  }

  async rejectAd(admin: RequestUser, adId: number, message: string): Promise<Ad> {
    const ad = await this.findByIdOrThrow(adId);
    ad.reject(message);
    const saved = await this.adRepository.save(ad);

    // The rejection reason becomes the first chat entry too, so the admin isn't typing the
    // same explanation twice and the thread has continuity from the moment of rejection.
    await this.adMessageRepository.save(
      this.adMessageRepository.create({
        ad: saved,
        message,
        senderId: admin.id,
        senderRole: admin.role,
      }),
    );

    return saved;
  }

  async addPhoto(sellerId: number, adId: number, dto: CreateAdPhotoDto): Promise<AdPhoto> {
    const ad = await this.findOwnedOrThrow(adId, sellerId);
    if (!ad.canEdit()) {
      throw new ForbiddenException('Ad cannot be edited in its current status');
    }

    const photo = this.adPhotoRepository.create({
      ad,
      url: dto.url,
      caption: dto.caption,
      sortOrder: dto.sortOrder ?? 0,
      isPrimary: dto.isPrimary ?? false,
    });
    return this.adPhotoRepository.save(photo);
  }

  listPublic(): Promise<Ad[]> {
    return this.adRepository.find({
      where: { status: AdStatus.VALIDATED },
      relations: AD_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  // Public read: a validated ad is visible to anyone; a non-validated one only to its
  // owner or an admin. Returns 404 rather than 403 for anything else, so we don't leak
  // the existence of other sellers' drafts.
  async findVisible(id: number, currentUser?: RequestUser): Promise<Ad> {
    const ad = await this.adRepository.findOne({ where: { id }, relations: AD_RELATIONS });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    if (ad.status !== AdStatus.VALIDATED && !this.isOwnerOrAdmin(ad, currentUser)) {
      throw new NotFoundException('Ad not found');
    }

    return ad;
  }

  // Chat thread is private (owner or any admin), unlike public photos -- same access rule
  // used for both posting and reading it.
  async addMessage(currentUser: RequestUser, adId: number, text: string): Promise<AdMessage> {
    const ad = await this.findByIdOrThrow(adId);
    if (!this.isOwnerOrAdmin(ad, currentUser)) {
      throw new ForbiddenException('Not authorized to message on this ad');
    }

    return this.adMessageRepository.save(
      this.adMessageRepository.create({
        ad,
        message: text,
        senderId: currentUser.id,
        senderRole: currentUser.role,
      }),
    );
  }

  async listMessages(currentUser: RequestUser, adId: number): Promise<AdMessage[]> {
    const ad = await this.findByIdOrThrow(adId);
    if (!this.isOwnerOrAdmin(ad, currentUser)) {
      throw new ForbiddenException('Not authorized to view this ad\'s messages');
    }

    return this.adMessageRepository.find({
      where: { ad: { id: adId } },
      order: { createdAt: 'ASC' },
    });
  }

  private isOwnerOrAdmin(ad: Ad, currentUser?: RequestUser): boolean {
    return !!currentUser && (currentUser.id === ad.sellerId || currentUser.role === UserRole.ADMIN);
  }

  private async findByIdOrThrow(id: number): Promise<Ad> {
    const ad = await this.adRepository.findOne({ where: { id }, relations: AD_RELATIONS });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    return ad;
  }

  private async findOwnedOrThrow(id: number, sellerId: number): Promise<Ad> {
    const ad = await this.findByIdOrThrow(id);
    if (ad.sellerId !== sellerId) {
      throw new ForbiddenException('Not the owner of this ad');
    }
    return ad;
  }
}
