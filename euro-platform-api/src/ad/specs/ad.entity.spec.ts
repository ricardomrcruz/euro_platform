// @ts-nocheck
import { BadRequestException } from '@nestjs/common';
import { Ad } from '../entities/ad.entity';
import { AdStatus } from '../enums/ad-status.enum';

function adWithStatus(status: AdStatus): Ad {
  const ad = new Ad();
  ad.status = status;
  return ad;
}

describe('Ad state machine', () => {
  describe('canEdit', () => {
    it.each([AdStatus.DRAFT, AdStatus.REJECTED])(
      'returns true for %s',
      (status) => {
        expect(adWithStatus(status).canEdit()).toBe(true);
      },
    );

    it.each([AdStatus.REVIEW, AdStatus.VALIDATED])(
      'returns false for %s',
      (status) => {
        expect(adWithStatus(status).canEdit()).toBe(false);
      },
    );
  });

  describe('canEditContent', () => {
    it('returns true only for VALIDATED', () => {
      expect(adWithStatus(AdStatus.VALIDATED).canEditContent()).toBe(true);
      expect(adWithStatus(AdStatus.DRAFT).canEditContent()).toBe(false);
      expect(adWithStatus(AdStatus.REVIEW).canEditContent()).toBe(false);
      expect(adWithStatus(AdStatus.REJECTED).canEditContent()).toBe(false);
    });
  });

  describe('submit', () => {
    it.each([AdStatus.DRAFT, AdStatus.REJECTED])(
      'moves %s to REVIEW',
      (status) => {
        const ad = adWithStatus(status);
        ad.submit();
        expect(ad.status).toBe(AdStatus.REVIEW);
      },
    );

    it.each([AdStatus.REVIEW, AdStatus.VALIDATED])(
      'throws from %s',
      (status) => {
        const ad = adWithStatus(status);
        expect(() => ad.submit()).toThrow(BadRequestException);
      },
    );
  });

  describe('validate', () => {
    it('moves REVIEW to VALIDATED', () => {
      const ad = adWithStatus(AdStatus.REVIEW);
      ad.validate();
      expect(ad.status).toBe(AdStatus.VALIDATED);
    });

    it.each([AdStatus.DRAFT, AdStatus.VALIDATED, AdStatus.REJECTED])(
      'throws from %s',
      (status) => {
        expect(() => adWithStatus(status).validate()).toThrow(
          BadRequestException,
        );
      },
    );
  });

  describe('reject', () => {
    it('moves REVIEW to REJECTED and records the message', () => {
      const ad = adWithStatus(AdStatus.REVIEW);
      ad.reject('Photos too blurry');
      expect(ad.status).toBe(AdStatus.REJECTED);
      expect(ad.rejectionMessage).toBe('Photos too blurry');
    });

    it.each([AdStatus.DRAFT, AdStatus.VALIDATED, AdStatus.REJECTED])(
      'throws from %s',
      (status) => {
        expect(() => adWithStatus(status).reject('x')).toThrow(
          BadRequestException,
        );
      },
    );
  });

  describe('resubmitForReview', () => {
    it('moves VALIDATED to REVIEW', () => {
      const ad = adWithStatus(AdStatus.VALIDATED);
      ad.resubmitForReview();
      expect(ad.status).toBe(AdStatus.REVIEW);
    });

    it.each([AdStatus.DRAFT, AdStatus.REVIEW, AdStatus.REJECTED])(
      'throws from %s',
      (status) => {
        expect(() => adWithStatus(status).resubmitForReview()).toThrow(
          BadRequestException,
        );
      },
    );
  });
});
