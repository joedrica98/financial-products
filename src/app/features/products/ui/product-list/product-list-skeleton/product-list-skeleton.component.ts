import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from '../../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-product-list-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  templateUrl: 'product-list-skeleton.component.html',
  styleUrl: 'product-list-skeleton.component.scss',
})
export class ProductListSkeletonComponent {
  @Input() rowCount: number = 5;

  get itemsArray(): number[] {
    return Array(this.rowCount).fill(0);
  }
}
