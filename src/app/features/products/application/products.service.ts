import { computed, inject, Injectable, signal } from '@angular/core';
import { ProductsRepository } from '../infrastructure/products.repository';
import { ToastService } from '../../../shared/services/toast.service';
import { FinancialProduct } from '../../../core/models/financial-product.model';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private productsRepository = inject(ProductsRepository);
  private toastService = inject(ToastService);

  private productsSignal = signal<FinancialProduct[]>([]);
  private searchTermSignal = signal<string>('');
  private itemsPerPageSignal = signal<number>(5);
  private currentPageSignal = signal<number>(1);

  filteredProducts = computed(() => {
    const searchTerm = this.searchTermSignal().toLowerCase();
    if (!searchTerm) {
      return this.productsSignal();
    }
    return this.productsSignal().filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  });

  paginatedProducts = computed(() => {
    const filtered = this.filteredProducts();
    const start = (this.currentPageSignal() - 1) * this.itemsPerPageSignal();
    const end = start + this.itemsPerPageSignal();
    return filtered.slice(start, end);
  });

  totalFilteredCount = computed(() => this.filteredProducts().length);

  totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.itemsPerPageSignal())
  );

  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
    this.setCurrentPage(1);
  }

  setItemsPerPage(count: number): void {
    this.itemsPerPageSignal.set(count);
    this.setCurrentPage(1);
  }

  setCurrentPage(page: number): void {
    this.currentPageSignal.set(page);
  }

  loadProducts(): Observable<ApiResponse<FinancialProduct[]>> {
    return this.productsRepository.getProducts().pipe(
      tap((response) => {
        this.productsSignal.set(response.data);
      })
    );
  }

  getProductById(id: string): Observable<ApiResponse<FinancialProduct>> {
    return this.productsRepository.getProductById(id);
  }

  createProduct(
    product: FinancialProduct
  ): Observable<ApiResponse<FinancialProduct>> {
    return this.productsRepository.createProduct(product).pipe(
      tap((response) => {
        this.productsSignal.update((products) => [...products, response.data]);
        this.toastService.showSuccess('Product created successfully');
      })
    );
  }

  updateProduct(
    product: FinancialProduct
  ): Observable<ApiResponse<FinancialProduct>> {
    return this.productsRepository.updateProduct(product).pipe(
      tap((response) => {
        this.productsSignal.update((products) =>
          products.map((p) => (p.id === product.id ? response.data : p))
        );
        this.toastService.showSuccess('Product updated successfully');
      })
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.productsRepository.deleteProduct(id).pipe(
      tap(() => {
        this.productsSignal.update((products) =>
          products.filter((p) => p.id !== id)
        );
        this.toastService.showSuccess('Product deleted successfully');
      })
    );
  }

  verifyProductId(id: string): Observable<boolean> {
    return this.productsRepository.verifyProductId(id);
  }

  addOneYearToDate(dateString: string): string {
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }
}
