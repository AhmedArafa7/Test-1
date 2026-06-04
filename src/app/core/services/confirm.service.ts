import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

interface ConfirmState extends Required<ConfirmOptions> {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private nextId = 0;
  private _state = signal<ConfirmState | null>(null);
  readonly state = this._state.asReadonly();

  private resolver: ((value: boolean) => void) | null = null;

  ask(options: ConfirmOptions): Promise<boolean> {
    // Resolve any in-flight confirm to false before starting a new one
    if (this.resolver) {
      this.resolver(false);
      this.resolver = null;
    }

    const state: ConfirmState = {
      id: ++this.nextId,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? '',
      cancelText: options.cancelText ?? '',
      variant: options.variant ?? 'primary',
    };
    this._state.set(state);

    return new Promise<boolean>(resolve => {
      this.resolver = resolve;
    });
  }

  resolve(value: boolean): void {
    if (this.resolver) {
      this.resolver(value);
      this.resolver = null;
    }
    this._state.set(null);
  }
}
