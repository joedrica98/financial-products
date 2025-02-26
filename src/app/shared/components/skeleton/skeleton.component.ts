import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  @Input() type: 'circle' | 'text' | 'rectangle' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() marginBottom: string = '0.5rem';
  @Input() borderRadius: string = '4px';
}
