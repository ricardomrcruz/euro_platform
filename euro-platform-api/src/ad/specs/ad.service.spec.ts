// @ts-nocheck
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdService } from '../ad.service';
import { Ad } from '../entities/ad.entity';
import { AdStatus } from '../enums/ad-status.enum';
import { UserRole } from '../../auth/enums/user-role.enum';
import type { RequestUser } from '../../auth/interfaces/authenticated-request.interface';

function buildAd(overrides: Partial<Ad> = {}): Ad {
  const ad = new Ad();
  ad.id = 1;
  ad.sellerId = 10;
  ad.status = AdStatus.DRAFT;
  Object.assign(ad, overrides);
  return ad;
}

function buildUser(overrides: Partial<RequestUser> = {}): RequestUser {
  return {
    id: 10,
    email: 'seller@example.com',
    role: UserRole.CLIENT,
    ...overrides,
  };
}

function buildHarness() {
  const adRepository = {
    countActiveForSeller: jest.fn().mockResolvedValue(0),
    findByIdWithRelations: jest.fn(),
    create: jest.fn((data: Partial<Ad>) => Object.assign(new Ad(), data)),
    save: jest.fn((ad: Ad) => Promise.resolve(ad)),
  };
  const adPhotoRepository = {
    countForAd: jest.fn(),
    findByIdForAd: jest.fn(),
    remove: jest.fn(),
  };
  const adMessageRepository = {
    create: jest.fn((data: unknown) => data),
    save: jest.fn((m: unknown) => Promise.resolve(m)),
    findByAdOrdered: jest.fn(),
  };
  const vehicleFactory = {
    createVehicle: jest.fn().mockResolvedValue({ id: 1 }),
  };
  const notificationService = { notifyAdValidated: jest.fn() };
  const storageService = {};

  const service = new AdService(
    adRepository as never,
    adPhotoRepository as never,
    adMessageRepository as never,
    vehicleFactory as never,
    notificationService as never,
    storageService as never,
  );

  return {
    service,
    adRepository,
    adPhotoRepository,
    adMessageRepository,
    notificationService,
  };
}

describe('AdService.createAd', () => {
  it('throws ForbiddenException once the seller is at the active-ad cap', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.countActiveForSeller.mockResolvedValue(5);

    await expect(service.createAd(10, { title: 'x' } as never)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows creating when below the cap', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.countActiveForSeller.mockResolvedValue(4);

    await expect(
      service.createAd(10, { title: 'x' } as never),
    ).resolves.toBeDefined();
    expect(adRepository.save).toHaveBeenCalled();
  });
});

describe('AdService ownership guards', () => {
  it('updateAd throws ForbiddenException for a non-owner (not the ad-cannot-be-edited message)', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ sellerId: 10 }),
    );

    await expect(service.updateAd(999, 1, {} as never)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('updateAd throws ForbiddenException when the owner tries to edit a non-editable ad', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ sellerId: 10, status: AdStatus.REVIEW }),
    );

    await expect(service.updateAd(10, 1, {} as never)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws NotFoundException when the ad does not exist at all', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(null);

    await expect(service.updateAd(10, 1, {} as never)).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('AdService.findVisible', () => {
  it('returns a VALIDATED ad to anyone, including an anonymous visitor', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ status: AdStatus.VALIDATED }),
    );

    await expect(service.findVisible(1, undefined)).resolves.toBeDefined();
  });

  it('404s (not 403) a DRAFT ad for an anonymous visitor, to avoid leaking its existence', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ status: AdStatus.DRAFT }),
    );

    await expect(service.findVisible(1, undefined)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('404s a DRAFT ad for a logged-in user who is not the owner or an admin', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ status: AdStatus.DRAFT, sellerId: 10 }),
    );

    await expect(
      service.findVisible(1, buildUser({ id: 999, role: UserRole.CLIENT })),
    ).rejects.toThrow(NotFoundException);
  });

  it('shows a DRAFT ad to its own owner', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ status: AdStatus.DRAFT, sellerId: 10 }),
    );

    await expect(
      service.findVisible(1, buildUser({ id: 10 })),
    ).resolves.toBeDefined();
  });

  it('shows a DRAFT ad to an admin', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ status: AdStatus.DRAFT, sellerId: 10 }),
    );

    await expect(
      service.findVisible(1, buildUser({ id: 999, role: UserRole.ADMIN })),
    ).resolves.toBeDefined();
  });
});

describe('AdService chat thread privacy', () => {
  it('blocks a non-owner, non-admin from reading messages', async () => {
    const { service, adRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ sellerId: 10 }),
    );

    await expect(
      service.listMessages(buildUser({ id: 999, role: UserRole.CLIENT }), 1),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows the owner to read messages', async () => {
    const { service, adRepository, adMessageRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ sellerId: 10 }),
    );
    adMessageRepository.findByAdOrdered.mockResolvedValue([]);

    await expect(
      service.listMessages(buildUser({ id: 10 }), 1),
    ).resolves.toEqual([]);
  });
});

describe('AdService.rejectAd', () => {
  it('records the rejection reason as a chat message from the admin', async () => {
    const { service, adRepository, adMessageRepository } = buildHarness();
    adRepository.findByIdWithRelations.mockResolvedValue(
      buildAd({ status: AdStatus.REVIEW }),
    );
    const admin = buildUser({ id: 1, role: UserRole.ADMIN });

    await service.rejectAd(admin, 1, 'Odometer photo missing');

    expect(adMessageRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Odometer photo missing',
        senderId: 1,
        senderRole: UserRole.ADMIN,
      }),
    );
  });
});
