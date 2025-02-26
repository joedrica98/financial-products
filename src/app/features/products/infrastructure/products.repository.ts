import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { FinancialProduct } from '../../../core/models/financial-product.model';
import { ProductsPort } from '../domain/products.port';

@Injectable({
  providedIn: 'root',
})
export class ProductsRepository implements ProductsPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/bp/products';

  getProducts(): Observable<ApiResponse<FinancialProduct[]>> {
    return this.http.get<ApiResponse<FinancialProduct[]>>(this.baseUrl);
  }

  getProductById(id: string): Observable<ApiResponse<FinancialProduct>> {
    return this.http.get<ApiResponse<FinancialProduct>>(
      `${this.baseUrl}/${id}`
    );
  }

  createProduct(
    product: FinancialProduct
  ): Observable<ApiResponse<FinancialProduct>> {
    return this.http.post<ApiResponse<FinancialProduct>>(this.baseUrl, product);
  }

  updateProduct(
    product: FinancialProduct
  ): Observable<ApiResponse<FinancialProduct>> {
    return this.http.put<ApiResponse<FinancialProduct>>(
      `${this.baseUrl}/${product.id}`,
      product
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${id}`);
  }
}
