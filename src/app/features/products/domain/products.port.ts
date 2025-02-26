import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { FinancialProduct } from '../../../core/models/financial-product.model';

export interface ProductsPort {
  getProducts(): Observable<ApiResponse<FinancialProduct[]>>;
  getProductById(id: string): Observable<ApiResponse<FinancialProduct>>;
  createProduct(
    product: FinancialProduct
  ): Observable<ApiResponse<FinancialProduct>>;
  updateProduct(
    product: FinancialProduct
  ): Observable<ApiResponse<FinancialProduct>>;
  deleteProduct(id: string): Observable<ApiResponse<void>>;
  verifyProductId(id: string): Observable<boolean>;
}
