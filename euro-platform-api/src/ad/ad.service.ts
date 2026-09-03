import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { VehicleFactoryService } from '../vehicle/vehicle-factory.service';
import { NotificationService } from '../notification/notification.service';
import { StorageService, SignedUpload } from '../storage/storage.service';
import type { RequestUser } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../auth/enums/user-role.enum';
import { AdStatus } from './enums/ad-status.enum';
import { AdRepository } from './ad.repository';
import { AdPhotoRepository } from './ad-photo.repository';
import { AdMessageRepository } from './ad-message.repository';
import { Ad } from './entities/ad.entity';
import { AdPhoto } from './entities/ad-photo.entity';
import { AdMessage } from './entities/ad-message.entity';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { UpdateAdContentDto } from './dto/update-ad-content.dto';
import { CreateAdPhotoDto } from './dto/create-ad-photo.dto';
import { RequestPhotoUploadUrlDto } from './dto/request-photo-upload-url.dto';
import { buildPhotoObjectKey } from './utils/photo-object-key.util';

// Cap on active (DRAFT/REVIEW/VALIDATED) ads per seller.
const MAX_ACTIVE_ADS_PER_SELLER = 5;

@Injectable()
export class AdService {
  constructor(
    private readonly adRepository: AdRepository,
    private readonly adPhotoRepository: AdPhotoRepository,
    private readonly adMessageRepository: AdMessageRepository,
    private readonly vehicleFactory: VehicleFactoryService,
    private readonly notificationService: NotificationService,
    private readonly storageService: StorageService,
  ) {}

  async createAd(sellerId: number, dto: CreateAdDto): Promise<Ad> {
    const activeCount = await this.adRepository.countActiveForSeller(sellerId);
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
      photos: [],
    });

    return this.adRepository.save(ad);
  }

  // Only DRAFT/REJECTED ads are editable (ad.canEdit()) -- replaces every field, including
  // the vehicle (a new Vehicle row is created via the same factory path as createAd; the old
  // one is left orphaned, same tolerance as elsewhere in this module).
  async updateAd(sellerId: number, adId: number, dto: UpdateAdDto): Promise<Ad> {
    const ad = await this.findOwnedOrThrow(adId, sellerId);
    if (!ad.canEdit()) {
      throw new ForbiddenException('Ad cannot be edited in its current status');
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

    ad.title = dto.title;
    ad.description = dto.description;
    ad.condition = dto.condition;
    ad.highlights = dto.highlights;
    ad.knownFlaws = dto.knownFlaws;
    ad.modifications = dto.modifications;
    ad.serviceHistory = dto.serviceHistory;
    ad.location = dto.location;
    ad.vehicle = vehicle;

    return this.adRepository.save(ad);
  }

  // The re-review counterpart to updateAd() -- only for a VALIDATED ad (ad.canEditContent()),
  // only touches content fields (never title/location/condition/vehicle), and always sends
  // the ad back to REVIEW as part of the same save, regardless of any live auction on it.
  async updateContent(sellerId: number, adId: number, dto: UpdateAdContentDto): Promise<Ad> {
    const ad = await this.findOwnedOrThrow(adId, sellerId);
    if (!ad.canEditContent()) {
      throw new ForbiddenException('Ad content cannot be edited in its current status');
    }

    ad.description = dto.description;
    ad.highlights = dto.highlights;
    ad.knownFlaws = dto.knownFlaws;
    ad.modifications = dto.modifications;
    ad.serviceHistory = dto.serviceHistory;
    ad.resubmitForReview();

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
    const saved = await this.adRepository.save(ad);
    this.notificationService.notifyAdValidated(saved.sellerId, saved.title);
    return saved;
  }

  async rejectAd(admin: RequestUser, adId: number, message: string): Promise<Ad> {
    const ad = await this.findByIdOrThrow(adId);
    ad.reject(message);
    const saved = await this.adRepository.save(ad);

    // Rejection reason also becomes the ad's first chat entry.
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
    if (!ad.canEdit() && !ad.canEditContent()) {
      throw new ForbiddenException('Ad cannot be edited in its current status');
    }

    const photo = this.adPhotoRepository.create({
      ad,
      url: dto.url,
      category: dto.category,
      caption: dto.caption,
      sortOrder: dto.sortOrder ?? 0,
      isPrimary: dto.isPrimary ?? false,
    });
    return this.adPhotoRepository.save(photo);
  }

  // Ownership/edit-state guard mirrors addPhoto() -- this only mints a place to upload to,
  // the actual DB row is still created via addPhoto() once the browser's GCS PUT succeeds.
  async requestPhotoUploadUrl(
    sellerId: number,
    adId: number,
    dto: RequestPhotoUploadUrlDto,
  ): Promise<SignedUpload & { objectKey: string }> {
    const ad = await this.findOwnedOrThrow(adId, sellerId);
    if (!ad.canEdit() && !ad.canEditContent()) {
      throw new ForbiddenException('Ad cannot be edited in its current status');
    }

    const existingCount = await this.adPhotoRepository.countForAd(adId);
    const objectKey = buildPhotoObjectKey(ad, existingCount + 1, dto.filename);
    const signed = await this.storageService.generateUploadUrl(objectKey, dto.contentType);
    return { ...signed, objectKey };
  }

  listPublic(): Promise<Ad[]> {
    return this.adRepository.findValidatedOrdered();
  }

  // Every status, not just VALIDATED -- unlike listPublic(), this is the seller's own view.
  findMine(sellerId: number): Promise<Ad[]> {
    return this.adRepository.findBySeller(sellerId);
  }

  findPending(): Promise<Ad[]> {
    return this.adRepository.findPendingReview();
  }

  // 404, not 403, for a non-owner/admin so we don't leak that a draft ad exists.
  async findVisible(id: number, currentUser?: RequestUser): Promise<Ad> {
    const ad = await this.adRepository.findByIdWithRelations(id);
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    if (ad.status !== AdStatus.VALIDATED && !this.isOwnerOrAdmin(ad, currentUser)) {
      throw new NotFoundException('Ad not found');
    }

    return ad;
  }

  // Chat thread is private (owner or admin only), unlike photos.
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
      throw new ForbiddenException("Not authorized to view this ad's messages");
    }

    return this.adMessageRepository.findByAdOrdered(adId);
  }

  private isOwnerOrAdmin(ad: Ad, currentUser?: RequestUser): boolean {
    return !!currentUser && (currentUser.id === ad.sellerId || currentUser.role === UserRole.ADMIN);
  }

  private async findByIdOrThrow(id: number): Promise<Ad> {
    const ad = await this.adRepository.findByIdWithRelations(id);
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
