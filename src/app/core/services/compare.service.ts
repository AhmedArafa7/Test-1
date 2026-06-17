import { Injectable, signal } from '@angular/core';
import { PropertyListItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly STORAGE_KEY = 'baytology_compare_list';
  private _items = signal<PropertyListItem[]>(this.load());

  readonly items = this._items.asReadonly();

  toggle(item: PropertyListItem): boolean {
    const current = this._items();
    const exists = current.some(i => i.id === item.id);
    if (exists) {
      this._items.set(current.filter(i => i.id !== item.id));
      this.save();
      return true;
    }
    if (current.length >= 3) return false;
    this._items.set([...current, item]);
    this.save();
    return true;
  }

  remove(id: string) {
    this._items.update(current => current.filter(i => i.id !== id));
    this.save();
  }

  clearAll() {
    this._items.set([]);
    this.save();
  }

  isCompared(id: string): boolean {
    return this._items().some(i => i.id === id);
  }

  reorder(items: PropertyListItem[]) {
    this._items.set(items);
    this.save();
  }

  moveItem(fromIndex: number, toIndex: number) {
    const current = [...this._items()];
    if (toIndex < 0 || toIndex >= current.length) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    this._items.set(current);
    this.save();
  }

  private load(): PropertyListItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._items()));
  }
}
