import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TranslatePipe } from '@ngx-translate/core';
import { AdService, Ad, VehicleCondition } from '../ad.service';
import {
  VehicleCatalogService,
  VehicleMake,
  VehicleModel,
  VehicleTrim,
} from '../../vehicle/vehicle-catalog.service';

type Stage = 'form' | 'draft' | 'submitted';

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

@Component({
  selector: 'app-create-ad',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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

  readonly stage = signal<Stage>('form');
  readonly submitting = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly createdAd = signal<Ad | null>(null);

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

  readonly photoForm = this.fb.group({
    url: ['', Validators.required],
    caption: [''],
  });
  readonly addingPhoto = signal(false);

  constructor() {
    this.catalog.listMakes().then((makes) => this.makes.set(makes));

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

  async submitForm(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.errorKey.set(null);
    try {
      const ad = await this.adService.create({
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
      });
      this.createdAd.set(ad);
      this.stage.set('draft');
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      this.errorKey.set(
        status === 403 ? 'ad.create.activeAdLimitError' : 'ad.create.genericError',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  async addPhoto(): Promise<void> {
    const ad = this.createdAd();
    if (!ad || this.photoForm.invalid) {
      this.photoForm.markAllAsTouched();
      return;
    }

    const { url, caption } = this.photoForm.getRawValue();
    this.addingPhoto.set(true);
    try {
      const photo = await this.adService.addPhoto(ad.id, {
        url: url!,
        caption: caption || undefined,
      });
      this.createdAd.update((current) =>
        current ? { ...current, photos: [...current.photos, photo] } : current,
      );
      this.photoForm.reset();
    } finally {
      this.addingPhoto.set(false);
    }
  }

  async submitForReview(): Promise<void> {
    const ad = this.createdAd();
    if (!ad) return;

    this.submitting.set(true);
    try {
      await this.adService.submit(ad.id);
      this.stage.set('submitted');
    } finally {
      this.submitting.set(false);
    }
  }
}
