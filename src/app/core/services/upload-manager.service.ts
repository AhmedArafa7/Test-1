import { Injectable } from '@angular/core';
import { LocalImageService } from './local-image.service';
import { CloudinaryService } from './cloudinary.service';
import { PropertyService } from '../../features/properties/services/property.service';
import { ToastService } from './toast.service';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadManagerService {
  private uploading = false;
  private queueCount = new BehaviorSubject<number>(0);
  public queueCount$ = this.queueCount.asObservable();

  constructor(
    private localImage: LocalImageService,
    private cloudinary: CloudinaryService,
    private propertyService: PropertyService,
    private toast: ToastService,
    private translate: TranslateService
  ) {
    // Initial check
    this.processQueue();
  }

  /**
   * Main loop to process the upload queue.
   */
  async processQueue() {
    if (this.uploading) return;
    
    const pending = await this.localImage.getPendingUploads();
    this.queueCount.next(pending.length);

    if (pending.length === 0) {
      this.uploading = false;
      return;
    }

    this.uploading = true;
    console.log(`[UploadManager] Processing ${pending.length} pending uploads...`);

    for (const item of pending) {
      try {
        const url = await this.cloudinary.uploadImage(item.data).toPromise();
        if (url) {
          console.log(`[UploadManager] Successfully uploaded image for property ${item.propertyId}`);
          
          // Call the Backend API to save the link in SQL Server
          try {
            await this.propertyService.addImages(item.propertyId, [url]);
            await this.localImage.removeFromQueue(item.id);
            this.toast.success(this.translate.instant('SERVICE_MESSAGES.UPLOAD_QUEUE_SUCCESS'));
          } catch (apiErr) {
            console.error(`[UploadManager] Cloudinary success but Backend save failed for property ${item.propertyId}:`, apiErr);
            // Leave it in queue to retry backend registration
          }
        }
      } catch (err) {
        console.error(`[UploadManager] Failed to upload item ${item.id}:`, err);
        // We leave it in the queue for the next cycle
      }
    }

    this.uploading = false;
    const remaining = (await this.localImage.getPendingUploads()).length;
    this.queueCount.next(remaining);
    
    if (remaining > 0) {
       // Check again soon if there's more work
       setTimeout(() => this.processQueue(), 5000);
    } else {
       // Idle check every 30 seconds
       setTimeout(() => this.processQueue(), 30000);
    }
  }

  /**
   * Add a single image to the queue and trigger processing.
   */
  async queueUpload(propertyId: string, data: string) {
    await this.localImage.addToUploadQueue(propertyId, data);
    this.processQueue();
  }

  /**
   * Queue multiple images.
   */
  async queueMultiple(propertyId: string, images: string[]) {
    for (const img of images) {
      await this.localImage.addToUploadQueue(propertyId, img);
    }
    this.processQueue();
  }
}
