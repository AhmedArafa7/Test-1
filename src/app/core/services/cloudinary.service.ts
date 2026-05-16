import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';

export interface UploadProgress {
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly cloudName = environment.cloudinaryCloudName;
  private readonly uploadPreset = environment.cloudinaryUploadPreset;
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  constructor(private http: HttpClient) {}

  /**
   * Uploads a single image to Cloudinary with automatic retry on network failure.
   * Uses Unsigned Uploads for frontend security.
   */
  uploadImage(file: File | string): Observable<string> {
    const formData = new FormData();
    
    if (typeof file === 'string') {
      // Handle base64 strings if needed
      formData.append('file', file);
    } else {
      formData.append('file', file);
    }
    
    formData.append('upload_preset', this.uploadPreset);
    formData.append('tags', 'baytology_upload');

    return this.http.post<any>(this.uploadUrl, formData).pipe(
      map(res => res.secure_url),
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.warn(`Cloudinary upload failed, retrying (${retryCount}/3)...`, error);
          // Exponential backoff: 1s, 2s, 4s
          return timer(Math.pow(2, retryCount - 1) * 1000);
        }
      }),
      catchError(err => {
        console.error('Cloudinary upload error after retries:', err);
        return throwError(() => new Error('فشل رفع الصورة إلى السحابة. سيتم المحاولة لاحقاً.'));
      })
    );
  }

  /**
   * Uploads multiple images and returns their URLs.
   */
  async uploadMultiple(files: (File | string)[]): Promise<string[]> {
    const uploadTasks = files.map(file => this.uploadImage(file).toPromise());
    const results = await Promise.all(uploadTasks);
    return results.filter((url): url is string => !!url);
  }
}
