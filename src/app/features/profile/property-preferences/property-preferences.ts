import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PropertyPreferenceService } from '../../../core/services/property-preference.service';
import { SetPropertyPreferenceRequest } from '../../../core/models';
import { PropertyType, ListingType, FurnishingStatus, ViewType } from '../../../core/models/enums';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-property-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './property-preferences.html'
})
export class PropertyPreferencesComponent implements OnInit {
  private preferenceService = inject(PropertyPreferenceService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  loading = signal(true);
  saving = signal(false);

  // Form State
  form: SetPropertyPreferenceRequest = {
    propertyType: null,
    listingType: null,
    minPrice: null,
    maxPrice: null,
    minArea: null,
    maxArea: null,
    minBedrooms: null,
    maxBedrooms: null,
    minBathrooms: null,
    maxBathrooms: null,
    city: null,
    district: null,
    hasParking: null,
    hasPool: null,
    hasGym: null,
    hasElevator: null,
    hasSecurity: null,
    hasBalcony: null,
    hasGarden: null,
    hasCentralAC: null,
    furnishingStatus: null,
    viewType: null
  };

  // Enums for Dropdowns
  propertyTypes = Object.values(PropertyType);
  listingTypes = Object.values(ListingType);
  furnishingStatuses = Object.values(FurnishingStatus);
  viewTypes = Object.values(ViewType);

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    this.loading.set(true);
    this.preferenceService.getPreferences().subscribe({
      next: (pref) => {
        this.form = {
          propertyType: pref.propertyType ?? null,
          listingType: pref.listingType ?? null,
          minPrice: pref.minPrice ?? null,
          maxPrice: pref.maxPrice ?? null,
          minArea: pref.minArea ?? null,
          maxArea: pref.maxArea ?? null,
          minBedrooms: pref.minBedrooms ?? null,
          maxBedrooms: pref.maxBedrooms ?? null,
          minBathrooms: pref.minBathrooms ?? null,
          maxBathrooms: pref.maxBathrooms ?? null,
          city: pref.city ?? null,
          district: pref.district ?? null,
          hasParking: pref.hasParking ?? null,
          hasPool: pref.hasPool ?? null,
          hasGym: pref.hasGym ?? null,
          hasElevator: pref.hasElevator ?? null,
          hasSecurity: pref.hasSecurity ?? null,
          hasBalcony: pref.hasBalcony ?? null,
          hasGarden: pref.hasGarden ?? null,
          hasCentralAC: pref.hasCentralAC ?? null,
          furnishingStatus: pref.furnishingStatus ?? null,
          viewType: pref.viewType ?? null
        };
        this.loading.set(false);
      },
      error: () => {
        // Assume 404 (no preferences set yet)
        this.loading.set(false);
      }
    });
  }

  save() {
    this.saving.set(true);
    
    // Convert undefined to null for clean payload
    const payload: SetPropertyPreferenceRequest = { ...this.form };
    for (const key in payload) {
      if ((payload as any)[key] === '') {
        (payload as any)[key] = null;
      }
    }

    this.preferenceService.setPreferences(payload).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('PROFILE.PREFERENCES_SAVED'));
        this.saving.set(false);
      },
      error: () => {
        this.toast.error(this.translate.instant('ERRORS.DEFAULT'));
        this.saving.set(false);
      }
    });
  }
}
