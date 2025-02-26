import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;
  private timeout = 5000;

  toasts = signal<Toast[]>([]);

  showSuccess(message: string): void {
    this.show(message, 'success');
  }

  showError(message: string): void {
    this.show(message, 'error');
  }

  showInfo(message: string): void {
    this.show(message, 'info');
  }

  private show(message: string, type: ToastType): void {
    const id = this.nextId++;

    this.toasts.update((toasts) => [...toasts, { message, type, id }]);

    setTimeout(() => {
      this.remove(id);
    }, this.timeout);
  }

  remove(id: number): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
