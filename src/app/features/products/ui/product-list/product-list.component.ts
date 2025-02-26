import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../application/products.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { FinancialProduct } from '../../../../core/models/financial-product.model';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  productsService = inject(ProductsService);
  router = inject(Router);
  toastService = inject(ToastService);

  showDeleteModal = false;
  selectedProduct: FinancialProduct | null = null;

  constructor() {}

  ngOnInit(): void {
    this.productsService.loadProducts().subscribe({
      error: (error) => {
        console.error(error);
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
          console.error(error);
        },
      });
    }
  }
}
