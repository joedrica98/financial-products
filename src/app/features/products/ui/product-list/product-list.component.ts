// src/app/features/products/ui/product-list/product-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../application/products.service';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductListSkeletonComponent } from './product-list-skeleton/product-list-skeleton.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductListSkeletonComponent,
  ],
  templateUrl: 'product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  productsService = inject(ProductsService);
  router = inject(Router);
  toastService = inject(ToastService);

  showDeleteModal = false;
  selectedProduct: FinancialProduct | null = null;
  isLoading = signal(true);

  constructor() {}

  ngOnInit(): void {
    this.isLoading.set(true);
    this.productsService.loadProducts().subscribe({
      next: () => {
        setTimeout(() => {
          this.isLoading.set(false);
        }, 800);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.productsService.setSearchTerm(input.value);
  }

  onItemsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.productsService.setItemsPerPage(Number(select.value));
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/products/add']);
  }

  editProduct(product: FinancialProduct): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  confirmDelete(product: FinancialProduct): void {
    this.selectedProduct = product;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedProduct = null;
  }

  deleteProduct(): void {
    if (this.selectedProduct) {
      this.productsService.deleteProduct(this.selectedProduct.id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.selectedProduct = null;
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        },
      });
    }
  }
}
