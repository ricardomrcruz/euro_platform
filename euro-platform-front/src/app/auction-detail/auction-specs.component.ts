import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import type { AuctionSpecs, SpecRow } from './interfaces/auction-detail.interface';

@Component({
  selector: 'app-auction-specs',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './auction-specs.component.html',
})
export class AuctionSpecsComponent {
  specs = input.required<AuctionSpecs>();
  sellerType = input.required<'dealer' | 'private'>();

  readonly rows = computed<SpecRow[]>(() => {
    const s = this.specs();
    return [
      { labelKey: 'auctionDetail.specs.make', value: s.make },
      { labelKey: 'auctionDetail.specs.model', value: s.model },
      { labelKey: 'auctionDetail.specs.engine', value: s.engine },
      { labelKey: 'auctionDetail.specs.drivetrain', value: s.drivetrain },
      { labelKey: 'auctionDetail.specs.mileage', value: `${s.mileage.toLocaleString()} km` },
      { labelKey: 'auctionDetail.specs.transmission', value: s.transmission },
      { labelKey: 'auctionDetail.specs.vin', value: s.vin },
      { labelKey: 'auctionDetail.specs.bodyStyle', value: s.bodyStyle },
      { labelKey: 'auctionDetail.specs.titleStatus', value: s.titleStatus },
      { labelKey: 'auctionDetail.specs.exteriorColor', value: s.exteriorColor },
      { labelKey: 'auctionDetail.specs.interiorColor', value: s.interiorColor },
      { labelKey: 'auctionDetail.specs.location', value: s.location },
      {
        labelKey: 'auctionDetail.specs.sellerType',
        valueKey:
          this.sellerType() === 'dealer'
            ? 'auctionDetail.specs.sellerTypeDealer'
            : 'auctionDetail.specs.sellerTypePrivate',
      },
    ];
  });
}
