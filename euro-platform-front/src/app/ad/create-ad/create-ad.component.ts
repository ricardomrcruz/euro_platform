import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { Image } from 'primeng/image';
import { FileUploadModule } from 'primeng/fileupload';
import type { FileSelectEvent } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdService } from '../ad.service';
import type {
  AdPhoto,
  AdPhotoCategory,
  AdStatus,
  CritAir,
  VehicleCondition,
} from '../interfaces/ad.interface';
import { VehicleCatalogService } from '../../vehicle/vehicle-catalog.service';
import type {
  Drivetrain,
  FuelType,
  Transmission,
  VehicleColor,
  VehicleMake,
  VehicleModel,
  VehicleTrim,
  VehicleTrimPowertrain,
} from '../../vehicle/interfaces/vehicle-catalog.interface';
import { COUNTRIES } from '../../shared/utils/countries';
import { stripMakePrefix } from '../../shared/utils/vehicle-name.util';
import type {
  ColorOption,
  ConditionOption,
  CritAirOption,
  DrivetrainOption,
  FuelTypeOption,
  PhotoCategoryOption,
  PhotoRow,
  PhotoUploadStatus,
  TransmissionOption,
  MakeValue,
  ModelValue,
  TrimValue,
} from './interfaces/create-ad.interface';

// Mechanical fields that default to the selected finition's matching powertrain (see
// VehicleTrimPowertrain) but can be overridden per car -- shared between the cascade's
// reset-on-upstream-change logic and the pre-fill-on-finition-pick logic.
const TRIM_SPEC_KEYS = [
  'engine',
  'displacement',
  'horsepower',
  'torque',
  'transmission',
  'drivetrain',
  'weight',
] as const;

const CONDITION_OPTIONS: ConditionOption[] = [
  { value: 'EXCELLENT', labelKey: 'ad.create.conditionExcellent' },
  { value: 'NOT_DAMAGED', labelKey: 'ad.create.conditionNotDamaged' },
  { value: 'GOOD', labelKey: 'ad.create.conditionGood' },
  { value: 'NORMAL_WEAR', labelKey: 'ad.create.conditionNormalWear' },
  { value: 'MINOR_REPAIRS_NEEDED', labelKey: 'ad.create.conditionMinorRepairsNeeded' },
  { value: 'MAJOR_REPAIRS_NEEDED', labelKey: 'ad.create.conditionMajorRepairsNeeded' },
  { value: 'DAMAGED', labelKey: 'ad.create.conditionDamaged' },
  { value: 'NOT_RUNNING', labelKey: 'ad.create.conditionNotRunning' },
];

const COLOR_OPTIONS: ColorOption[] = [
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

const CRIT_AIR_OPTIONS: CritAirOption[] = [
  { value: 'CRITAIR_0', labelKey: 'ad.create.critAirOptions.CRITAIR_0' },
  { value: 'CRITAIR_1', labelKey: 'ad.create.critAirOptions.CRITAIR_1' },
  { value: 'CRITAIR_2', labelKey: 'ad.create.critAirOptions.CRITAIR_2' },
  { value: 'CRITAIR_3', labelKey: 'ad.create.critAirOptions.CRITAIR_3' },
  { value: 'CRITAIR_4', labelKey: 'ad.create.critAirOptions.CRITAIR_4' },
  { value: 'CRITAIR_5', labelKey: 'ad.create.critAirOptions.CRITAIR_5' },
];

const FUEL_TYPE_OPTIONS: FuelTypeOption[] = [
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

const TRANSMISSION_OPTIONS: TransmissionOption[] = [
  { value: 'MANUAL', labelKey: 'vehicle.transmissionOptions.MANUAL' },
  { value: 'AUTOMATIC', labelKey: 'vehicle.transmissionOptions.AUTOMATIC' },
  { value: 'CVT', labelKey: 'vehicle.transmissionOptions.CVT' },
  { value: 'SEMI_AUTOMATIC', labelKey: 'vehicle.transmissionOptions.SEMI_AUTOMATIC' },
];

const DRIVETRAIN_OPTIONS: DrivetrainOption[] = [
  { value: 'FWD', labelKey: 'vehicle.drivetrainOptions.FWD' },
  { value: 'RWD', labelKey: 'vehicle.drivetrainOptions.RWD' },
  { value: 'AWD', labelKey: 'vehicle.drivetrainOptions.AWD' },
  { value: 'FOUR_WD', labelKey: 'vehicle.drivetrainOptions.FOUR_WD' },
];

const AD_PHOTO_CATEGORY_OPTIONS: PhotoCategoryOption[] = [
  { value: 'EXTERIOR_FRONT', labelKey: 'ad.create.photoCategoryOptions.EXTERIOR_FRONT' },
  { value: 'EXTERIOR_REAR', labelKey: 'ad.create.photoCategoryOptions.EXTERIOR_REAR' },
  {
    value: 'EXTERIOR_DRIVER_SIDE',
    labelKey: 'ad.create.photoCategoryOptions.EXTERIOR_DRIVER_SIDE',
  },
  {
    value: 'EXTERIOR_PASSENGER_SIDE',
    labelKey: 'ad.create.photoCategoryOptions.EXTERIOR_PASSENGER_SIDE',
  },
  {
    value: 'EXTERIOR_FRONT_THREE_QUARTER',
    labelKey: 'ad.create.photoCategoryOptions.EXTERIOR_FRONT_THREE_QUARTER',
  },
  {
    value: 'EXTERIOR_REAR_THREE_QUARTER',
    labelKey: 'ad.create.photoCategoryOptions.EXTERIOR_REAR_THREE_QUARTER',
  },
  {
    value: 'EXTERIOR_UNDERCARRIAGE',
    labelKey: 'ad.create.photoCategoryOptions.EXTERIOR_UNDERCARRIAGE',
  },
  { value: 'WHEELS_TIRES', labelKey: 'ad.create.photoCategoryOptions.WHEELS_TIRES' },
  { value: 'ENGINE_BAY', labelKey: 'ad.create.photoCategoryOptions.ENGINE_BAY' },
  { value: 'INTERIOR_DASHBOARD', labelKey: 'ad.create.photoCategoryOptions.INTERIOR_DASHBOARD' },
  {
    value: 'INTERIOR_FRONT_SEATS',
    labelKey: 'ad.create.photoCategoryOptions.INTERIOR_FRONT_SEATS',
  },
  { value: 'INTERIOR_REAR_SEATS', labelKey: 'ad.create.photoCategoryOptions.INTERIOR_REAR_SEATS' },
  { value: 'ODOMETER', labelKey: 'ad.create.photoCategoryOptions.ODOMETER' },
  { value: 'TRUNK', labelKey: 'ad.create.photoCategoryOptions.TRUNK' },
  {
    value: 'REGISTRATION_DOCUMENT',
    labelKey: 'ad.create.photoCategoryOptions.REGISTRATION_DOCUMENT',
  },
  { value: 'OTHER', labelKey: 'ad.create.photoCategoryOptions.OTHER' },
];

function catalogName(value: { name: string } | string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value.trim() || undefined;
  return value.name;
}

// Model dropdown options carry an extra display-only label with the make prefix stripped
// (e.g. "AUDI A3" -> "A3") -- .name itself stays untouched since it's still what gets sent
// to the trim-cascade lookup and at submit time.
type DisplayModel = VehicleModel & { displayName: string };

function toDisplayModels(models: VehicleModel[], makeName: string | undefined): DisplayModel[] {
  return models.map((model) => ({ ...model, displayName: stripMakePrefix(model.name, makeName) }));
}

// Objects (make/model/trim) are compared by id, since the same catalog entry can arrive as a
// different object reference (a fresh fetch, or the one loaded from an existing ad).
function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object' && 'id' in a && 'id' in b) {
    return (a as { id: unknown }).id === (b as { id: unknown }).id;
  }
  return false;
}

@Component({
  selector: 'app-create-ad',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    ButtonModule,
    InputText,
    InputTextarea,
    Image,
    FileUploadModule,
    TagModule,
    TranslatePipe,
  ],
  templateUrl: './create-ad.component.html',
})
export class CreateAdComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly adService = inject(AdService);
  private readonly catalog = inject(VehicleCatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly editingAdId = signal<number | null>(null);
  readonly editingAdStatus = signal<AdStatus | null>(null);
  readonly loadingExisting = signal(false);
  readonly existingPhotos = signal<AdPhoto[]>([]);
  readonly deletingPhotoId = signal<number | null>(null);

  // A VALIDATED ad can only have its content (description/highlights/knownFlaws/
  // modifications/serviceHistory) and photos edited -- title/location/condition/vehicle
  // fundamentals are locked forever. Editing content always resubmits for review.
  readonly isContentEditMode = computed(() => this.editingAdStatus() === 'VALIDATED');

  readonly savingDraft = signal(false);
  readonly savingAndSubmitting = signal(false);
  readonly savingContent = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly conditionOptions = CONDITION_OPTIONS;
  readonly colorOptions = COLOR_OPTIONS;
  readonly critAirOptions = CRIT_AIR_OPTIONS;
  readonly fuelTypeOptions = FUEL_TYPE_OPTIONS;
  readonly transmissionOptions = TRANSMISSION_OPTIONS;
  readonly drivetrainOptions = DRIVETRAIN_OPTIONS;
  readonly photoCategoryOptions = AD_PHOTO_CATEGORY_OPTIONS;
  readonly plateCountryOptions = COUNTRIES;

  readonly makes = signal<VehicleMake[]>([]);
  readonly models = signal<DisplayModel[]>([]);
  readonly trims = signal<VehicleTrim[]>([]);
  // trims() narrowed to the currently selected fuel type -- a trim with no known powertrain
  // data at all stays visible under every fuel type rather than being hidden outright.
  readonly filteredTrims = signal<VehicleTrim[]>([]);

  // Snapshot of the form exactly as it stands in the DB (taken right after loadForEdit
  // finishes) vs. its live value, compared field-by-field so the template can flag which
  // fields the seller has actually changed since loading an existing ad.
  readonly originalFormValue = signal<Record<string, unknown> | null>(null);
  readonly liveFormValue = signal<Record<string, unknown>>({});
  readonly changedFieldKeys = computed(() => {
    const original = this.originalFormValue();
    if (!original) return new Set<string>();
    const current = this.liveFormValue();
    const keys = new Set<string>();
    for (const key of Object.keys(current)) {
      if (!valuesEqual(current[key], original[key])) keys.add(key);
    }
    return keys;
  });

  readonly vinLoading = signal(false);
  readonly vinResultKey = signal<string | null>(null);

  // make/model/trim hold the full catalog object (not just an id) -- the browsing endpoints
  // cascade by NAME (VehicleFactoryService.listModels/listTrims), only CreateAdDto needs ids,
  // so keeping the whole object around avoids a second lookup at submit time.
  readonly form = this.fb.group({
    vin: [''],
    make: this.fb.control<MakeValue>(null, Validators.required),
    model: this.fb.control<ModelValue>({ value: null, disabled: true }, Validators.required),
    // Fuel type is picked before finition -- the same finition name commonly ships with
    // several distinct engines, so this is what disambiguates which one is meant.
    fuelType: this.fb.control<FuelType | null>({ value: null, disabled: true }),
    trim: this.fb.control<TrimValue>({ value: null, disabled: true }),
    engine: this.fb.control<string | null>(null),
    displacement: this.fb.control<number | null>(null),
    horsepower: this.fb.control<number | null>(null),
    torque: this.fb.control<number | null>(null),
    transmission: this.fb.control<Transmission | null>(null),
    drivetrain: this.fb.control<Drivetrain | null>(null),
    weight: this.fb.control<number | null>(null),
    year: this.fb.control<number | null>(null, [Validators.required, Validators.min(1886)]),
    exteriorColor: this.fb.control<VehicleColor | null>(null),
    interiorColor: this.fb.control<VehicleColor | null>(null),
    mileage: this.fb.control<number | null>(null),
    numberOfOwners: this.fb.control<number | null>(null),
    plateCountry: [''],
    fiscalPower: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    critAir: this.fb.control<CritAir | null>(null),
    numberOfSeats: this.fb.control<number | null>(null),
    numberOfDoors: this.fb.control<number | null>(null),
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.required],
    condition: this.fb.control<VehicleCondition | null>(null, Validators.required),
    highlights: [''],
    knownFlaws: [''],
    modifications: [''],
    serviceHistory: [''],
    location: [''],
  });

  // Photo rows are entirely optional -- rows with no file picked are just skipped on save
  // rather than blocking the form. photoFiles/photoUploadStatus/photoPreviewUrls are kept in
  // lockstep with photoRows by index (p-fileupload's own file list can't be driven through a
  // FormControl). Rows are created in batches by onFilesSelected(), one per picked file.
  readonly photoRows = this.fb.array<PhotoRow>([]);
  readonly photoFiles = signal<(File | null)[]>([]);
  readonly photoUploadStatus = signal<PhotoUploadStatus[]>([]);
  readonly photoPreviewUrls = signal<(string | null)[]>([]);
  // Which of the newly-added photos (index into photoRows) becomes the ad's primary/cover
  // photo -- defaults to the first one picked, changeable via setCoverPhoto().
  readonly primaryPhotoIndex = signal(0);

  constructor() {
    this.form.controls.make.valueChanges.subscribe((make) => {
      this.form.controls.model.setValue(null);
      this.form.controls.fuelType.setValue(null);
      this.form.controls.trim.setValue(null);
      this.trims.set([]);
      this.filteredTrims.set([]);
      const makeName = catalogName(make);
      if (makeName) {
        this.form.controls.model.enable();
        this.catalog
          .listModels(makeName)
          .then((models) => this.models.set(toDisplayModels(models, makeName)));
      } else {
        this.form.controls.model.disable();
        this.models.set([]);
      }
    });

    this.form.controls.model.valueChanges.subscribe((model) => {
      this.form.controls.fuelType.setValue(null);
      this.form.controls.trim.setValue(null);
      this.filteredTrims.set([]);
      const makeName = catalogName(this.form.controls.make.value);
      const modelName = catalogName(model);
      if (modelName && makeName) {
        this.form.controls.fuelType.enable();
        this.catalog.listTrims(makeName, modelName).then((trims) => this.trims.set(trims));
      } else {
        this.form.controls.fuelType.disable();
        this.trims.set([]);
      }
    });

    // Changing fuel type invalidates whatever finition/specs were already picked -- they
    // belonged to the previous fuel type's set of engines.
    this.form.controls.fuelType.valueChanges.subscribe((fuelType) => {
      this.resetTrimAndSpecs();
      if (fuelType) {
        this.form.controls.trim.enable();
        this.filteredTrims.set(
          this.trims().filter(
            (t) => t.powertrains.length === 0 || t.powertrains.some((p) => p.fuelType === fuelType),
          ),
        );
      } else {
        this.form.controls.trim.disable();
        this.filteredTrims.set([]);
      }
    });

    // Pre-fills the mechanical fields from the selected finition's matching powertrain. Only
    // fields still holding what a previous pre-fill applied get overwritten, so switching
    // finitions never silently replaces a value the seller typed in themselves.
    this.form.controls.trim.valueChanges.subscribe((trim) => {
      if (trim && typeof trim === 'object') {
        const fuelType = this.form.controls.fuelType.value;
        const powertrain = fuelType
          ? trim.powertrains.find((p) => p.fuelType === fuelType)
          : undefined;
        this.applyPowertrainPrefill(powertrain);
      }
    });

    this.form.valueChanges.subscribe(() => this.liveFormValue.set(this.form.getRawValue()));

    this.catalog.listMakes().then(async (makes) => {
      this.makes.set(makes);
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        await this.loadForEdit(Number(idParam));
      }
    });
  }

  // What applyPowertrainPrefill() itself last wrote into each mechanical field -- lets it
  // tell "still holds our own pre-fill" apart from "the seller edited this" on a later call.
  private readonly lastPowertrainPrefill: Partial<Record<(typeof TRIM_SPEC_KEYS)[number], unknown>> = {};

  ngOnDestroy(): void {
    for (const url of this.photoPreviewUrls()) {
      if (url) URL.revokeObjectURL(url);
    }
  }

  private resetTrimAndSpecs(): void {
    this.form.controls.trim.setValue(null);
    this.filteredTrims.set([]);
    for (const key of TRIM_SPEC_KEYS) {
      (this.form.controls[key] as FormControl<unknown>).setValue(null);
    }
  }

  private applyPowertrainPrefill(powertrain: VehicleTrimPowertrain | undefined): void {
    for (const key of TRIM_SPEC_KEYS) {
      const control = this.form.controls[key] as FormControl<unknown>;
      const newValue = (powertrain?.[key] ?? null) as unknown;
      const current = control.value;
      if (current === null || current === this.lastPowertrainPrefill[key]) {
        control.setValue(newValue);
        this.lastPowertrainPrefill[key] = newValue;
      }
    }
  }

  isFieldChanged(key: string): boolean {
    return this.changedFieldKeys().has(key);
  }

  // Reloads the ad exactly as it stands in the DB -- discards every unsaved edit, including
  // ones made after switching to a different finition/fuel type.
  async resetToOriginal(): Promise<void> {
    const id = this.editingAdId();
    if (id) await this.loadForEdit(id);
  }

  private newPhotoRow(): PhotoRow {
    return this.fb.group({
      caption: this.fb.nonNullable.control(''),
      category: this.fb.control<AdPhotoCategory | null>(null),
    });
  }

  addPhotoRow(): void {
    this.photoRows.push(this.newPhotoRow());
    this.photoFiles.update((files) => [...files, null]);
    this.photoUploadStatus.update((statuses) => [...statuses, 'idle']);
    this.photoPreviewUrls.update((urls) => [...urls, null]);
  }

  removePhotoRow(index: number): void {
    const url = this.photoPreviewUrls()[index];
    if (url) URL.revokeObjectURL(url);
    this.photoRows.removeAt(index);
    this.photoFiles.update((files) => files.filter((_, i) => i !== index));
    this.photoUploadStatus.update((statuses) => statuses.filter((_, i) => i !== index));
    this.photoPreviewUrls.update((urls) => urls.filter((_, i) => i !== index));
    this.primaryPhotoIndex.update((current) => {
      if (index < current) return current - 1;
      if (index === current) return 0;
      return current;
    });
  }

  // p-fileupload's own internal file list must stay in sync with our photoRows array (both
  // are index-aligned in selection order) -- removing through this button, not its own.
  removeNewPhoto(index: number, removeFileCallback: (event: Event, index: number) => void, event: Event): void {
    removeFileCallback(event, index);
    this.removePhotoRow(index);
  }

  setCoverPhoto(index: number): void {
    this.primaryPhotoIndex.set(index);
  }

  // onSelect only carries the newly-picked files (not the whole running list) -- appends one
  // row per file, existing rows untouched, so the picker can be reopened to add more later.
  onFilesSelected(event: FileSelectEvent): void {
    for (const file of event.files) {
      this.addPhotoRow();
      const index = this.photoRows.length - 1;
      const previewUrl = URL.createObjectURL(file);
      this.photoFiles.update((arr) => arr.map((f, i) => (i === index ? file : f)));
      this.photoPreviewUrls.update((arr) => arr.map((u, i) => (i === index ? previewUrl : u)));
    }
  }

  async removeExistingPhoto(photo: AdPhoto): Promise<void> {
    const adId = this.editingAdId();
    if (!adId) return;

    this.deletingPhotoId.set(photo.id);
    try {
      await this.adService.deletePhoto(adId, photo.id);
      this.existingPhotos.update((photos) => photos.filter((p) => p.id !== photo.id));
    } catch {
      this.errorKey.set('ad.create.genericError');
    } finally {
      this.deletingPhotoId.set(null);
    }
  }

  // Sets every cascade level with emitEvent: false and fetches models/trims manually --
  // avoids racing the valueChanges-driven cascade above, which would otherwise reset
  // model/trim back to null right after we set them.
  private async loadForEdit(id: number): Promise<void> {
    this.editingAdId.set(id);
    this.loadingExisting.set(true);
    try {
      const ad = await this.adService.getOne(id);
      this.existingPhotos.set(ad.photos);
      this.editingAdStatus.set(ad.status);

      const make = this.makes().find((m) => m.id === ad.vehicle.make.id) ?? null;
      this.form.controls.make.setValue(make, { emitEvent: false });

      if (make) {
        const models = toDisplayModels(await this.catalog.listModels(make.name), make.name);
        this.models.set(models);
        this.form.controls.model.enable();
        const model = models.find((m) => m.id === ad.vehicle.model.id) ?? null;
        this.form.controls.model.setValue(model, { emitEvent: false });

        if (model) {
          const trims = await this.catalog.listTrims(make.name, model.name);
          this.trims.set(trims);
          this.form.controls.fuelType.enable();
          this.form.controls.fuelType.setValue(ad.vehicle.fuelType ?? null, { emitEvent: false });
          this.filteredTrims.set(
            trims.filter(
              (t) =>
                t.powertrains.length === 0 ||
                t.powertrains.some((p) => p.fuelType === ad.vehicle.fuelType),
            ),
          );
          this.form.controls.trim.enable();
          const trim = ad.vehicle.trim
            ? (trims.find((t) => t.id === ad.vehicle.trim!.id) ?? null)
            : null;
          this.form.controls.trim.setValue(trim, { emitEvent: false });
        }
      }

      this.form.patchValue({
        vin: ad.vehicle.vin ?? '',
        year: ad.vehicle.year,
        exteriorColor: ad.vehicle.exteriorColor ?? null,
        interiorColor: ad.vehicle.interiorColor ?? null,
        mileage: ad.vehicle.mileage ?? null,
        numberOfOwners: ad.vehicle.numberOfOwners ?? null,
        plateCountry: ad.vehicle.plateCountry ?? '',
        fiscalPower: ad.vehicle.fiscalPower,
        critAir: ad.vehicle.critAir ?? null,
        numberOfSeats: ad.vehicle.numberOfSeats ?? null,
        numberOfDoors: ad.vehicle.numberOfDoors ?? null,
        engine: ad.vehicle.engine ?? null,
        displacement: ad.vehicle.displacement ?? null,
        horsepower: ad.vehicle.horsepower ?? null,
        torque: ad.vehicle.torque ?? null,
        transmission: ad.vehicle.transmission ?? null,
        drivetrain: ad.vehicle.drivetrain ?? null,
        weight: ad.vehicle.weight ?? null,
        title: ad.title,
        description: ad.description,
        condition: ad.condition,
        highlights: ad.highlights ?? '',
        knownFlaws: ad.knownFlaws ?? '',
        modifications: ad.modifications ?? '',
        serviceHistory: ad.serviceHistory ?? '',
        location: ad.location ?? '',
      });

      if (this.isContentEditMode()) {
        this.form.controls.vin.disable();
        this.form.controls.make.disable();
        this.form.controls.model.disable();
        this.form.controls.fuelType.disable();
        this.form.controls.trim.disable();
        this.form.controls.engine.disable();
        this.form.controls.displacement.disable();
        this.form.controls.horsepower.disable();
        this.form.controls.torque.disable();
        this.form.controls.transmission.disable();
        this.form.controls.drivetrain.disable();
        this.form.controls.weight.disable();
        this.form.controls.year.disable();
        this.form.controls.exteriorColor.disable();
        this.form.controls.interiorColor.disable();
        this.form.controls.mileage.disable();
        this.form.controls.numberOfOwners.disable();
        this.form.controls.plateCountry.disable();
        this.form.controls.fiscalPower.disable();
        this.form.controls.critAir.disable();
        this.form.controls.numberOfSeats.disable();
        this.form.controls.numberOfDoors.disable();
        this.form.controls.title.disable();
        this.form.controls.condition.disable();
        this.form.controls.location.disable();
      }

      const snapshot = this.form.getRawValue();
      this.originalFormValue.set(snapshot);
      this.liveFormValue.set(snapshot);
    } finally {
      this.loadingExisting.set(false);
    }
  }

  async lookupVin(): Promise<void> {
    const vin = this.form.controls.vin.value?.trim();
    if (!vin) return;

    this.vinLoading.set(true);
    this.vinResultKey.set(null);
    try {
      const result = await this.catalog.lookupVin(vin);
      if (result.recognized && result.make) {
        const existing = this.makes().find((m) => m.id === result.make!.id);
        this.form.controls.make.setValue(existing ?? result.make);
        if (result.modelYear) this.form.controls.year.setValue(result.modelYear);
        this.vinResultKey.set('ad.create.vinRecognized');
      } else {
        this.vinResultKey.set('ad.create.vinNotRecognized');
      }
    } finally {
      this.vinLoading.set(false);
    }
  }

  // Resolves a picked catalog object as-is, or find-or-creates a custom-typed name into a
  // real catalog row -- called once at submit time, never on every keystroke.
  private async resolveMake(value: MakeValue): Promise<VehicleMake> {
    if (value && typeof value === 'object') return value;
    return this.catalog.findOrCreateMake(catalogName(value)!);
  }

  private async resolveModel(makeId: number, value: ModelValue): Promise<VehicleModel> {
    if (value && typeof value === 'object') return value;
    return this.catalog.findOrCreateModel(makeId, catalogName(value)!);
  }

  private async resolveTrim(
    modelId: number,
    value: TrimValue,
    fuelType: FuelType | null,
  ): Promise<VehicleTrim | undefined> {
    if (!value) return undefined;
    if (typeof value === 'object') return value;
    const name = catalogName(value);
    return name ? this.catalog.findOrCreateTrim(modelId, name, fuelType ?? undefined) : undefined;
  }

  async saveDraft(): Promise<void> {
    await this.persistAndMaybeSubmit(false, this.savingDraft);
  }

  async saveAndSubmit(): Promise<void> {
    await this.persistAndMaybeSubmit(true, this.savingAndSubmitting);
  }

  // Uploads every photo row that has a picked file: request a signed URL, PUT the file
  // straight to GCS, then register it. Shared by both the create/full-edit flow and the
  // VALIDATED-ad content-edit flow -- one bad photo doesn't block saving the rest.
  private async uploadPendingPhotos(adId: number): Promise<void> {
    for (let i = 0; i < this.photoRows.length; i++) {
      const file = this.photoFiles()[i];
      if (!file) continue;

      const row = this.photoRows.at(i);
      const category = row.controls.category.value ?? undefined;
      try {
        const { uploadUrl, publicUrl } = await this.adService.requestUploadUrl(adId, {
          filename: file.name,
          contentType: file.type,
          category,
        });
        await this.adService.uploadFileToSignedUrl(uploadUrl, file);
        await this.adService.addPhoto(adId, {
          url: publicUrl,
          category,
          caption: row.controls.caption.value.trim() || undefined,
          sortOrder: i,
          isPrimary: i === this.primaryPhotoIndex(),
        });
      } catch {
        this.photoUploadStatus.update((statuses) =>
          statuses.map((s, idx) => (idx === i ? 'error' : s)),
        );
      }
    }
  }

  // For a VALIDATED ad: only content fields + photos can change, and saving always
  // resubmits the ad for review -- no separate draft/submit split like the create flow.
  async saveContentChanges(): Promise<void> {
    const id = this.editingAdId();
    if (!id || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.savingContent.set(true);
    this.errorKey.set(null);
    try {
      await this.uploadPendingPhotos(id);
      await this.adService.updateContent(id, {
        description: v.description!,
        highlights: v.highlights || undefined,
        knownFlaws: v.knownFlaws || undefined,
        modifications: v.modifications || undefined,
        serviceHistory: v.serviceHistory || undefined,
      });

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('ad.create.toastResubmittedSummary'),
        detail: this.translate.instant('ad.create.toastResubmittedDetail'),
        life: 5000,
      });
      this.router.navigateByUrl('/profile');
    } catch {
      this.errorKey.set('ad.create.genericError');
    } finally {
      this.savingContent.set(false);
    }
  }

  private async persistAndMaybeSubmit(
    thenSubmit: boolean,
    loadingSignal: ReturnType<typeof signal<boolean>>,
  ): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    loadingSignal.set(true);
    this.errorKey.set(null);
    try {
      const make = await this.resolveMake(v.make);
      const model = await this.resolveModel(make.id, v.model);
      const trim = await this.resolveTrim(model.id, v.trim, v.fuelType);

      const payload = {
        title: v.title!,
        description: v.description!,
        condition: v.condition!,
        highlights: v.highlights || undefined,
        knownFlaws: v.knownFlaws || undefined,
        modifications: v.modifications || undefined,
        serviceHistory: v.serviceHistory || undefined,
        location: v.location || undefined,
        makeId: make.id,
        modelId: model.id,
        trimId: trim?.id,
        vin: v.vin || undefined,
        year: v.year!,
        exteriorColor: v.exteriorColor || undefined,
        interiorColor: v.interiorColor || undefined,
        mileage: v.mileage ?? undefined,
        numberOfOwners: v.numberOfOwners ?? undefined,
        plateCountry: v.plateCountry || undefined,
        fiscalPower: v.fiscalPower!,
        critAir: v.critAir || undefined,
        numberOfSeats: v.numberOfSeats ?? undefined,
        numberOfDoors: v.numberOfDoors ?? undefined,
        engine: v.engine || undefined,
        displacement: v.displacement ?? undefined,
        horsepower: v.horsepower ?? undefined,
        torque: v.torque ?? undefined,
        transmission: v.transmission || undefined,
        drivetrain: v.drivetrain || undefined,
        fuelType: v.fuelType || undefined,
        weight: v.weight ?? undefined,
      };

      const existingId = this.editingAdId();
      const ad = existingId
        ? await this.adService.update(existingId, payload)
        : await this.adService.create(payload);

      await this.uploadPendingPhotos(ad.id);

      if (thenSubmit) {
        await this.adService.submit(ad.id);
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('ad.create.toastSubmittedSummary'),
          detail: this.translate.instant('ad.create.toastSubmittedDetail'),
          life: 5000,
        });
      } else {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('ad.create.toastDraftSummary'),
          detail: this.translate.instant('ad.create.toastDraftDetail'),
          life: 5000,
        });
      }

      this.router.navigateByUrl('/profile');
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      this.errorKey.set(
        status === 403 ? 'ad.create.activeAdLimitError' : 'ad.create.genericError',
      );
    } finally {
      loadingSignal.set(false);
    }
  }
}
