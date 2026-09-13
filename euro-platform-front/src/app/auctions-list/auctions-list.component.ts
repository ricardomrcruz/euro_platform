import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TranslatePipe } from '@ngx-translate/core';
import { AuctionCardComponent } from '../shared/components/auction-card/auction-card.component';
import { AuctionService } from '../auction/auction.service';
import { toAuctionCardData } from '../auction/auction.mappers';
import { AuctionCardData } from '../shared/models/auction.model';
import { VehicleCatalogService } from '../vehicle/vehicle-catalog.service';
import type { VehicleMake, VehicleModel, VehicleTrim } from '../vehicle/interfaces/vehicle-catalog.interface';
import { stripMakePrefix } from '../shared/utils/vehicle-name.util';
import type { AuctionSearchFilters } from './interfaces/auction-search.interface';
import type { EnumOption } from './interfaces/enum-option.interface';

const FUEL_TYPE_OPTIONS: EnumOption[] = [
  { value: 'GASOLINE', labelKey: 'vehicle.fuelTypeOptions.GASOLINE' },
  { value: 'DIESEL', labelKey: 'vehicle.fuelTypeOptions.DIESEL' },
  { value: 'ELECTRIC', labelKey: 'vehicle.fuelTypeOptions.ELECTRIC' },
  { value: 'HYBRID', labelKey: 'vehicle.fuelTypeOptions.HYBRID' },
  { value: 'PLUGIN_HYBRID', labelKey: 'vehicle.fuelTypeOptions.PLUGIN_HYBRID' },
  { value: 'LPG', labelKey: 'vehicle.fuelTypeOptions.LPG' },
  { value: 'ETHANOL', labelKey: 'vehicle.fuelTypeOptions.ETHANOL' },
  { value: 'HYDROGEN', labelKey: 'vehicle.fuelTypeOptions.HYDROGEN' },
  { value: 'CNG', labelKey: 'vehicle.fuelTypeOptions.CNG' },
];

const TRANSMISSION_OPTIONS: EnumOption[] = [
  { value: 'MANUAL', labelKey: 'vehicle.transmissionOptions.MANUAL' },
  { value: 'AUTOMATIC', labelKey: 'vehicle.transmissionOptions.AUTOMATIC' },
  { value: 'CVT', labelKey: 'vehicle.transmissionOptions.CVT' },
  { value: 'SEMI_AUTOMATIC', labelKey: 'vehicle.transmissionOptions.SEMI_AUTOMATIC' },
];

const DRIVETRAIN_OPTIONS: EnumOption[] = [
  { value: 'FWD', labelKey: 'vehicle.drivetrainOptions.FWD' },
  { value: 'RWD', labelKey: 'vehicle.drivetrainOptions.RWD' },
  { value: 'AWD', labelKey: 'vehicle.drivetrainOptions.AWD' },
  { value: 'FOUR_WD', labelKey: 'vehicle.drivetrainOptions.FOUR_WD' },
];

const BODY_TYPE_OPTIONS: EnumOption[] = [
  { value: 'SEDAN', labelKey: 'vehicle.bodyTypeOptions.SEDAN' },
  { value: 'HATCHBACK', labelKey: 'vehicle.bodyTypeOptions.HATCHBACK' },
  { value: 'WAGON', labelKey: 'vehicle.bodyTypeOptions.WAGON' },
  { value: 'COUPE', labelKey: 'vehicle.bodyTypeOptions.COUPE' },
  { value: 'CONVERTIBLE', labelKey: 'vehicle.bodyTypeOptions.CONVERTIBLE' },
  { value: 'SUV', labelKey: 'vehicle.bodyTypeOptions.SUV' },
  { value: 'CROSSOVER', labelKey: 'vehicle.bodyTypeOptions.CROSSOVER' },
  { value: 'MINIVAN', labelKey: 'vehicle.bodyTypeOptions.MINIVAN' },
  { value: 'PICKUP', labelKey: 'vehicle.bodyTypeOptions.PICKUP' },
  { value: 'VAN', labelKey: 'vehicle.bodyTypeOptions.VAN' },
];

const COLOR_OPTIONS: EnumOption[] = [
  { value: 'SILVER', labelKey: 'ad.create.colorOptions.SILVER' },
  { value: 'BEIGE', labelKey: 'ad.create.colorOptions.BEIGE' },
  { value: 'WHITE', labelKey: 'ad.create.colorOptions.WHITE' },
  { value: 'BLUE', labelKey: 'ad.create.colorOptions.BLUE' },
  { value: 'BURGUNDY', labelKey: 'ad.create.colorOptions.BURGUNDY' },
  { value: 'GOLD', labelKey: 'ad.create.colorOptions.GOLD' },
  { value: 'GREY', labelKey: 'ad.create.colorOptions.GREY' },
  { value: 'IVORY', labelKey: 'ad.create.colorOptions.IVORY' },
  { value: 'YELLOW', labelKey: 'ad.create.colorOptions.YELLOW' },
  { value: 'BROWN', labelKey: 'ad.create.colorOptions.BROWN' },
  { value: 'BLACK', labelKey: 'ad.create.colorOptions.BLACK' },
  { value: 'ORANGE', labelKey: 'ad.create.colorOptions.ORANGE' },
  { value: 'PINK', labelKey: 'ad.create.colorOptions.PINK' },
  { value: 'RED', labelKey: 'ad.create.colorOptions.RED' },
  { value: 'GREEN', labelKey: 'ad.create.colorOptions.GREEN' },
  { value: 'PURPLE', labelKey: 'ad.create.colorOptions.PURPLE' },
  { value: 'OTHER', labelKey: 'ad.create.colorOptions.OTHER' },
];

const CONDITION_OPTIONS: EnumOption[] = [
  { value: 'EXCELLENT', labelKey: 'ad.create.conditionExcellent' },
  { value: 'NOT_DAMAGED', labelKey: 'ad.create.conditionNotDamaged' },
  { value: 'GOOD', labelKey: 'ad.create.conditionGood' },
  { value: 'NORMAL_WEAR', labelKey: 'ad.create.conditionNormalWear' },
  { value: 'MINOR_REPAIRS_NEEDED', labelKey: 'ad.create.conditionMinorRepairsNeeded' },
  { value: 'MAJOR_REPAIRS_NEEDED', labelKey: 'ad.create.conditionMajorRepairsNeeded' },
  { value: 'DAMAGED', labelKey: 'ad.create.conditionDamaged' },
  { value: 'NOT_RUNNING', labelKey: 'ad.create.conditionNotRunning' },
];

function catalogName(value: { name: string } | string | null): string | undefined {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value.name;
}

// Model dropdown options carry an extra display-only label with the make prefix stripped
// (e.g. "AUDI A3" -> "A3") -- .name itself stays untouched, still what's sent as the filter.
type DisplayModel = VehicleModel & { displayName: string };

function toDisplayModels(models: VehicleModel[], makeName: string | undefined): DisplayModel[] {
  return models.map((model) => ({ ...model, displayName: stripMakePrefix(model.name, makeName) }));
}

@Component({
  selector: 'app-auctions-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    Select,
    InputText,
    InputNumber,
    IconField,
    InputIcon,
    AuctionCardComponent,
    TranslatePipe,
  ],
  templateUrl: './auctions-list.component.html',
})
export class AuctionsListComponent {
  private readonly auctionService = inject(AuctionService);
  private readonly catalog = inject(VehicleCatalogService);
  private readonly router = inject(Router);

  // Bound from the `?q=` query param via withComponentInputBinding() -- also updated live if
  // the navbar search bar navigates here again while this page is already open.
  q = input<string>('');

  readonly searchText = signal('');
  readonly auctions = signal<AuctionCardData[]>([]);
  readonly loading = signal(true);

  readonly fuelTypeOptions = FUEL_TYPE_OPTIONS;
  readonly transmissionOptions = TRANSMISSION_OPTIONS;
  readonly drivetrainOptions = DRIVETRAIN_OPTIONS;
  readonly bodyTypeOptions = BODY_TYPE_OPTIONS;
  readonly colorOptions = COLOR_OPTIONS;
  readonly conditionOptions = CONDITION_OPTIONS;

  readonly makes = signal<VehicleMake[]>([]);
  readonly models = signal<DisplayModel[]>([]);
  readonly trims = signal<VehicleTrim[]>([]);

  readonly selectedMake = signal<VehicleMake | null>(null);
  readonly selectedModel = signal<VehicleModel | null>(null);
  readonly selectedTrim = signal<VehicleTrim | null>(null);

  readonly yearMin = signal<number | null>(null);
  readonly yearMax = signal<number | null>(null);
  readonly priceMin = signal<number | null>(null);
  readonly priceMax = signal<number | null>(null);
  readonly mileageMin = signal<number | null>(null);
  readonly mileageMax = signal<number | null>(null);
  readonly horsepowerMin = signal<number | null>(null);
  readonly horsepowerMax = signal<number | null>(null);
  readonly fiscalPowerMin = signal<number | null>(null);
  readonly fiscalPowerMax = signal<number | null>(null);
  readonly fuelType = signal<string | null>(null);
  readonly transmission = signal<string | null>(null);
  readonly drivetrain = signal<string | null>(null);
  readonly bodyType = signal<string | null>(null);
  readonly color = signal<string | null>(null);
  readonly condition = signal<string | null>(null);
  readonly numberOfDoors = signal<number | null>(null);
  readonly numberOfSeats = signal<number | null>(null);

  constructor() {
    this.catalog.listMakes().then((makes) => this.makes.set(makes));

    // Re-runs whenever the `q` route input changes -- including a fresh navbar search fired
    // while this page is already open (same route/component instance, just a new query param).
    // runSearch() reads searchText and every other filter signal, so without untracked() here
    // those reads become dependencies of THIS effect too -- re-firing (and re-searching) on
    // every keystroke/filter change instead of only on navigation.
    effect(() => {
      const query = this.q();
      untracked(() => {
        this.searchText.set(query);
        this.runSearch();
      });
    });
  }

  onMakeChange(make: VehicleMake | null): void {
    this.selectedModel.set(null);
    this.selectedTrim.set(null);
    this.trims.set([]);
    const makeName = catalogName(make);
    if (makeName) {
      this.catalog
        .listModels(makeName)
        .then((models) => this.models.set(toDisplayModels(models, makeName)));
    } else {
      this.models.set([]);
    }
  }

  onModelChange(model: VehicleModel | null): void {
    this.selectedTrim.set(null);
    const makeName = catalogName(this.selectedMake());
    const modelName = catalogName(model);
    if (makeName && modelName) {
      this.catalog.listTrims(makeName, modelName).then((trims) => this.trims.set(trims));
    } else {
      this.trims.set([]);
    }
  }

  // Fired by the search bar (Enter/click) -- pushes the text into the URL so it stays
  // shareable/refreshable, same as arriving here from the navbar.
  submitSearch(): void {
    this.router.navigate(['/auctions'], { queryParams: { q: this.searchText() || null } });
  }

  applyFilters(): void {
    this.runSearch();
  }

  resetFilters(): void {
    this.selectedMake.set(null);
    this.selectedModel.set(null);
    this.selectedTrim.set(null);
    this.models.set([]);
    this.trims.set([]);
    this.yearMin.set(null);
    this.yearMax.set(null);
    this.priceMin.set(null);
    this.priceMax.set(null);
    this.mileageMin.set(null);
    this.mileageMax.set(null);
    this.horsepowerMin.set(null);
    this.horsepowerMax.set(null);
    this.fiscalPowerMin.set(null);
    this.fiscalPowerMax.set(null);
    this.fuelType.set(null);
    this.transmission.set(null);
    this.drivetrain.set(null);
    this.bodyType.set(null);
    this.color.set(null);
    this.condition.set(null);
    this.numberOfDoors.set(null);
    this.numberOfSeats.set(null);
    this.runSearch();
  }

  private runSearch(): void {
    const filters: AuctionSearchFilters = {
      q: this.searchText() || undefined,
      make: catalogName(this.selectedMake()),
      model: catalogName(this.selectedModel()),
      trim: catalogName(this.selectedTrim()),
      yearMin: this.yearMin() ?? undefined,
      yearMax: this.yearMax() ?? undefined,
      priceMin: this.priceMin() ?? undefined,
      priceMax: this.priceMax() ?? undefined,
      mileageMin: this.mileageMin() ?? undefined,
      mileageMax: this.mileageMax() ?? undefined,
      horsepowerMin: this.horsepowerMin() ?? undefined,
      horsepowerMax: this.horsepowerMax() ?? undefined,
      fiscalPowerMin: this.fiscalPowerMin() ?? undefined,
      fiscalPowerMax: this.fiscalPowerMax() ?? undefined,
      fuelType: (this.fuelType() as AuctionSearchFilters['fuelType']) ?? undefined,
      transmission: (this.transmission() as AuctionSearchFilters['transmission']) ?? undefined,
      drivetrain: (this.drivetrain() as AuctionSearchFilters['drivetrain']) ?? undefined,
      bodyType: (this.bodyType() as AuctionSearchFilters['bodyType']) ?? undefined,
      color: (this.color() as AuctionSearchFilters['color']) ?? undefined,
      condition: (this.condition() as AuctionSearchFilters['condition']) ?? undefined,
      numberOfDoors: this.numberOfDoors() ?? undefined,
      numberOfSeats: this.numberOfSeats() ?? undefined,
    };

    this.loading.set(true);
    this.auctionService.search(filters).then((auctions) => {
      this.auctions.set(auctions.map(toAuctionCardData));
      this.loading.set(false);
    });
  }
}
