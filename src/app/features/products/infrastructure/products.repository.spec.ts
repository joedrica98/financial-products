import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductsRepository } from './products.repository';
import { FinancialProduct } from '../../../core/models/financial-product.model';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/bp/products';

  const mockProduct: FinancialProduct = {
    id: 'test1',
    name: 'Test Product',
    description: 'Test Description for the product',
    logo: 'test-logo.png',
    date_release: '2023-01-01',
    date_revision: '2024-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsRepository],
    });

    repository = TestBed.inject(ProductsRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return an array of products', () => {
      const mockResponse = {
        data: [mockProduct],
      };

      repository.getProducts().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.data.length).toBe(1);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getProductById', () => {
    it('should return a single product by id', () => {
      const mockResponse = {
        data: mockProduct,
      };

      repository.getProductById('test1').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.data.id).toBe('test1');
      });

      const req = httpMock.expectOne(`${baseUrl}/test1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createProduct', () => {
    it('should create a product', () => {
      const mockResponse = {
        message: 'Product added successfully',
        data: mockProduct,
      };

      repository.createProduct(mockProduct).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProduct);
      req.flush(mockResponse);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', () => {
      const mockResponse = {
        message: 'Product updated successfully',
        data: mockProduct,
      };

      repository.updateProduct(mockProduct).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${mockProduct.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockProduct);
      req.flush(mockResponse);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', () => {
      const mockResponse = {
        message: 'Product removed successfully',
      };

      repository.deleteProduct('test1').subscribe((response) => {
        expect(response).toEqual({ ...mockResponse, data: undefined });
      });

      const req = httpMock.expectOne(`${baseUrl}/test1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('verifyProductId', () => {
    it('should verify if a product ID exists', () => {
      repository.verifyProductId('test1').subscribe((exists) => {
        expect(exists).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/verification/test1`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });
  });
});
