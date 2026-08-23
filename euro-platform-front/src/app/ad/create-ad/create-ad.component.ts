import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdService, AdPhoto, VehicleCondition } from '../ad.service';
import {
  VehicleCatalogService,
  VehicleMake,
  VehicleModel,
  VehicleTrim,
} from '../../vehicle/vehicle-catalog.service';

interface ConditionOption {
  value: VehicleCondition;
  labelKey: string;
}

const CONDITION_OPTIONS: ConditionOption[] = [
  { value: 'EXCELLENT', labelKey: 'ad.create.conditionExcellent' },
  { value: 'GOOD', labelKey: 'ad.create.conditionGood' },
  { value: 'FAIR', labelKey: 'ad.create.conditionFair' },
  { value: 'POOR', labelKey: 'ad.create.conditionPoor' },
];

type PhotoRow = FormGroup<{ url: import('@angular/forms').FormControl<string>; caption: import('@angular/forms').FormControl<string> }>;

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
    TranslatePipe,
  ],
  templateUrl: './create-ad.component.html',
})
export class CreateAdComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adService = inject(AdService);
  private readonly catalog = inject(VehicleCatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly editingAdId = signal<number | null>(null);
  readonly loadingExisting = signal(false);
  readonly existingPhotos = signal<AdPhoto[]>([]);

  readonly savingDraft = signal(false);
  readonly savingAndSubmitting = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly conditionOptions = CONDITION_OPTIONS;

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
    make: this.fb.control<VehicleMake | null>(null, Validators.required),
    model: this.fb.control<VehicleModel | null>(
      { value: null, disabled: true },
      Validators.required,
    ),
    trim: this.fb.control<VehicleTrim | null>({ value: null, disabled: true }),
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

  // Photo rows are entirely optional -- no validator on url, blank rows are just skipped on
  // save rather than blocking the form.
  readonly photoRows = this.fb.array<PhotoRow>([]);

  constructor() {
    this.form.controls.make.valueChanges.subscribe((make) => {
      this.form.controls.model.setValue(null);
      this.form.controls.trim.setValue(null);
      this.trims.set([]);
      if (make) {
        this.form.controls.model.enable();
        this.catalog.listModels(make.name).then((models) => this.models.set(models));
      } else {
        this.form.controls.model.disable();
        this.models.set([]);
      }
    });

    this.form.controls.model.valueChanges.subscribe((model) => {
      this.form.controls.trim.setValue(null);
      const make = this.form.controls.make.value;
      if (model && make) {
        this.form.controls.trim.enable();
        this.catalog.listTrims(make.name, model.name).then((trims) => this.trims.set(trims));
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
      } else {
        this.addPhotoRow();
      }
    });
  }

  private newPhotoRow(): PhotoRow {
    return this.fb.group({
      url: this.fb.nonNullable.control(''),
      caption: this.fb.nonNullable.control(''),
    });
  }

  addPhotoRow(): void {
    this.photoRows.push(this.newPhotoRow());
  }

  removePhotoRow(index: number): void {
    this.photoRows.removeAt(index);
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

      this.addPhotoRow();
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

  async saveDraft(): Promise<void> {
    await this.persistAndMaybeSubmit(false, this.savingDraft);
  }

  async saveAndSubmit(): Promise<void> {
    await this.persistAndMaybeSubmit(true, this.savingAndSubmitting);
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
    const payload = {
      title: v.title!,
      description: v.description!,
      condition: v.condition!,
      highlights: v.highlights || undefined,
      knownFlaws: v.knownFlaws || undefined,
      modifications: v.modifications || undefined,
      serviceHistory: v.serviceHistory || undefined,
      location: v.location || undefined,
      makeId: v.make!.id,
      modelId: v.model!.id,
      trimId: v.trim?.id,
      vin: v.vin || undefined,
      year: v.year!,
      exteriorColor: v.exteriorColor || undefined,
      interiorColor: v.interiorColor || undefined,
      mileage: v.mileage ?? undefined,
      numberOfOwners: v.numberOfOwners ?? undefined,
      plateCountry: v.plateCountry || undefined,
    };

    loadingSignal.set(true);
    this.errorKey.set(null);
    try {
      const existingId = this.editingAdId();
      const ad = existingId
        ? await this.adService.update(existingId, payload)
        : await this.adService.create(payload);

      const newPhotoRows = this.photoRows.controls.filter((row) => row.controls.url.value.trim());
      for (const row of newPhotoRows) {
        await this.adService.addPhoto(ad.id, {
          url: row.controls.url.value.trim(),
          caption: row.controls.caption.value.trim() || undefined,
        });
      }

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
