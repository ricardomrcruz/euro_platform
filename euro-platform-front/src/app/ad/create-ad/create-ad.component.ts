import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { Image } from 'primeng/image';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdService } from '../ad.service';
import type {
  AdPhoto,
  AdPhotoCategory,
  AdStatus,
  VehicleCondition,
} from '../interfaces/ad.interface';
import { VehicleCatalogService } from '../../vehicle/vehicle-catalog.service';
import type {
  VehicleMake,
  VehicleModel,
  VehicleTrim,
} from '../../vehicle/interfaces/vehicle-catalog.interface';
import { COUNTRIES } from '../../shared/countries';
import type {
  ConditionOption,
  PhotoCategoryOption,
  PhotoRow,
  PhotoUploadStatus,
  MakeValue,
  ModelValue,
  TrimValue,
} from './interfaces/create-ad.interface';

const CONDITION_OPTIONS: ConditionOption[] = [
  { value: 'EXCELLENT', labelKey: 'ad.create.conditionExcellent' },
  { value: 'GOOD', labelKey: 'ad.create.conditionGood' },
  { value: 'FAIR', labelKey: 'ad.create.conditionFair' },
  { value: 'POOR', labelKey: 'ad.create.conditionPoor' },
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

  // A VALIDATED ad can only have its content (description/highlights/knownFlaws/
  // modifications/serviceHistory) and photos edited -- title/location/condition/vehicle
  // fundamentals are locked forever. Editing content always resubmits for review.
  readonly isContentEditMode = computed(() => this.editingAdStatus() === 'VALIDATED');

  readonly savingDraft = signal(false);
  readonly savingAndSubmitting = signal(false);
  readonly savingContent = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly conditionOptions = CONDITION_OPTIONS;
  readonly photoCategoryOptions = AD_PHOTO_CATEGORY_OPTIONS;
  readonly plateCountryOptions = COUNTRIES;

  readonly makes = signal<VehicleMake[]>([]);
  readonly models = signal<VehicleModel[]>([]);
  readonly trims = signal<VehicleTrim[]>([]);

  readonly vinLoading = signal(false);
  readonly vinResultKey = signal<string | null>(null);

  // make/model/trim hold the full catalog object (not just an id) -- the browsing endpoints
  // cascade by NAME (VehicleFactoryService.listModels/listTrims), only CreateAdDto needs ids,
  // so keeping the whole object around avoids a second lookup at submit time.
  readonly form = this.fb.group({
    vin: [''],
    make: this.fb.control<MakeValue>(null, Validators.required),
    model: this.fb.control<ModelValue>({ value: null, disabled: true }, Validators.required),
    trim: this.fb.control<TrimValue>({ value: null, disabled: true }),
    year: this.fb.control<number | null>(null, [Validators.required, Validators.min(1886)]),
    exteriorColor: [''],
    interiorColor: [''],
    mileage: this.fb.control<number | null>(null),
    numberOfOwners: this.fb.control<number | null>(null),
    plateCountry: [''],
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
  // lockstep with photoRows by index (native <input type="file"> can't be driven through a
  // FormControl). Rows are created in batches by onFilesSelected(), one per picked file.
  readonly photoRows = this.fb.array<PhotoRow>([]);
  readonly photoFiles = signal<(File | null)[]>([]);
  readonly photoUploadStatus = signal<PhotoUploadStatus[]>([]);
  readonly photoPreviewUrls = signal<(string | null)[]>([]);

  constructor() {
    this.form.controls.make.valueChanges.subscribe((make) => {
      this.form.controls.model.setValue(null);
      this.form.controls.trim.setValue(null);
      this.trims.set([]);
      const makeName = catalogName(make);
      if (makeName) {
        this.form.controls.model.enable();
        this.catalog.listModels(makeName).then((models) => this.models.set(models));
      } else {
        this.form.controls.model.disable();
        this.models.set([]);
      }
    });

    this.form.controls.model.valueChanges.subscribe((model) => {
      this.form.controls.trim.setValue(null);
      const makeName = catalogName(this.form.controls.make.value);
      const modelName = catalogName(model);
      if (modelName && makeName) {
        this.form.controls.trim.enable();
        this.catalog.listTrims(makeName, modelName).then((trims) => this.trims.set(trims));
      } else {
        this.form.controls.trim.disable();
        this.trims.set([]);
      }
    });

    this.catalog.listMakes().then(async (makes) => {
      this.makes.set(makes);
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        await this.loadForEdit(Number(idParam));
      }
    });
  }

  ngOnDestroy(): void {
    for (const url of this.photoPreviewUrls()) {
      if (url) URL.revokeObjectURL(url);
    }
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
  }

  // Picking multiple files at once appends one row per file (existing rows are untouched, so
  // the file picker can be reopened later to add more without losing what's already there).
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      for (const file of Array.from(files)) {
        this.addPhotoRow();
        const index = this.photoRows.length - 1;
        const previewUrl = URL.createObjectURL(file);
        this.photoFiles.update((arr) => arr.map((f, i) => (i === index ? file : f)));
        this.photoPreviewUrls.update((arr) => arr.map((u, i) => (i === index ? previewUrl : u)));
      }
    }
    input.value = '';
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
        const models = await this.catalog.listModels(make.name);
        this.models.set(models);
        this.form.controls.model.enable();
        const model = models.find((m) => m.id === ad.vehicle.model.id) ?? null;
        this.form.controls.model.setValue(model, { emitEvent: false });

        if (model) {
          const trims = await this.catalog.listTrims(make.name, model.name);
          this.trims.set(trims);
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
        exteriorColor: ad.vehicle.exteriorColor ?? '',
        interiorColor: ad.vehicle.interiorColor ?? '',
        mileage: ad.vehicle.mileage ?? null,
        numberOfOwners: ad.vehicle.numberOfOwners ?? null,
        plateCountry: ad.vehicle.plateCountry ?? '',
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
        this.form.controls.trim.disable();
        this.form.controls.year.disable();
        this.form.controls.exteriorColor.disable();
        this.form.controls.interiorColor.disable();
        this.form.controls.mileage.disable();
        this.form.controls.numberOfOwners.disable();
        this.form.controls.plateCountry.disable();
        this.form.controls.title.disable();
        this.form.controls.condition.disable();
        this.form.controls.location.disable();
      }
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
    year: number,
  ): Promise<VehicleTrim | undefined> {
    if (!value) return undefined;
    if (typeof value === 'object') return value;
    const name = catalogName(value);
    return name ? this.catalog.findOrCreateTrim(modelId, name, year) : undefined;
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
          isPrimary: i === 0,
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
      const trim = await this.resolveTrim(model.id, v.trim, v.year!);

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
