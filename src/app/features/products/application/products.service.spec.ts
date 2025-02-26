import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../infrastructure/products.repository';
import { ToastService } from '../../../shared/services/toast.service';
import { FinancialProduct } from '../../../core/models/financial-product.model';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepositoryMock: jasmine.SpyObj<ProductsRepository>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  const mockProduct: FinancialProduct = {
    id: 'test1',
    name: 'Test Product',
    description: 'Test Description for the product',
    logo: 'test-logo.png',
    date_release: '2023-01-01',
    date_revision: '2024-01-01',
  };

  const mockProducts: FinancialProduct[] = [
    mockProduct,
    {
      id: 'test2',
      name: 'Another Product',
      description: 'Another test description',
      logo: 'test-logo-2.png',
      date_release: '2023-02-01',
      date_revision: '2024-02-01',
    },
  ];

  beforeEach(() => {
    const repositorySpy = jasmine.createSpyObj('ProductsRepository', [
      'getProducts',
      'getProductById',
      'createProduct',
      'updateProduct',
      'deleteProduct',
      'verifyProductId',
    ]);
    const toastSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
      'showInfo',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: repositorySpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    service = TestBed.inject(ProductsService);
    productsRepositoryMock = TestBed.inject(
      ProductsRepository
    ) as jasmine.SpyObj<ProductsRepository>;
    toastServiceMock = TestBed.inject(
      ToastService
    ) as jasmine.SpyObj<ToastService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProducts', () => {
    it('should load products and update signals', () => {
      productsRepositoryMock.getProducts.and.returnValue(
        of({ data: mockProducts })
      );

      service.loadProducts().subscribe((response) => {
        expect(response.data).toEqual(mockProducts);
        expect(service.filteredProducts()).toEqual(mockProducts);
      });
    });
  });

  describe('search functionality', () => {
    it('should filter products based on search term', () => {
      productsRepositoryMock.getProducts.and.returnValue(
        of({ data: mockProducts })
      );

      service.loadProducts().subscribe(() => {
        service.setSearchTerm('Another');
        expect(service.filteredProducts().length).toBe(1);
        expect(service.filteredProducts()[0].id).toBe('test2');
      });
    });

    it('should reset to first page when searching', () => {
      service.setCurrentPage(2);
      service.setSearchTerm('test');
      expect(service.totalFilteredCount()).toBe(0);
    });
  });

  describe('pagination', () => {
    it('should paginate products correctly', () => {
      const manyProducts = Array.from({ length: 10 }, (_, i) => ({
        ...mockProduct,
        id: `test${i + 1}`,
        name: `Product ${i + 1}`,
      }));

      productsRepositoryMock.getProducts.and.returnValue(
        of({ data: manyProducts })
      );

      service.loadProducts().subscribe(() => {
        service.setItemsPerPage(5);
        expect(service.paginatedProducts().length).toBe(5);

        service.setCurrentPage(2);
        expect(service.paginatedProducts().length).toBe(5);
        expect(service.paginatedProducts()[0].id).toBe('test6');
      });
    });

    it('should calculate total pages correctly', () => {
      const manyProducts = Array.from({ length: 11 }, (_, i) => ({
        ...mockProduct,
        id: `test${i + 1}`,
      }));

      productsRepositoryMock.getProducts.and.returnValue(
        of({ data: manyProducts })
      );

      service.loadProducts().subscribe(() => {
        service.setItemsPerPage(5);
        expect(service.totalPages()).toBe(3);
      });
    });
  });

  describe('CRUD operations', () => {
    it('should create a product and update the list', () => {
      productsRepositoryMock.getProducts.and.returnValue(
        of({ data: mockProducts })
      );
      productsRepositoryMock.createProduct.and.returnValue(
        of({
          data: mockProduct,
          message: 'Product added successfully',
        })
      );

      service.loadProducts().subscribe(() => {
        const initialCount = service.filteredProducts().length;
        service.createProduct(mockProduct).subscribe(() => {
          expect(productsRepositoryMock.createProduct).toHaveBeenCalledWith(
            mockProduct
          );
          expect(toastServiceMock.showSuccess).toHaveBeenCalled();
        });
      });
    });

    it('should update a product and refresh the list', () => {
      productsRepositoryMock.getProducts.and.returnValue(
        of({ data: mockProducts })
      );

      const updatedProduct = { ...mockProduct, name: 'Updated Name' };
      productsRepositoryMock.updateProduct.and.returnValue(
        of({
          data: updatedProduct,
          message: 'Product updated successfully',
        })
      );

      service.loadProducts().subscribe(() => {
        service.updateProduct(updatedProduct).subscribe(() => {
          expect(productsRepositoryMock.updateProduct).toHaveBeenCalledWith(
            updatedProduct
          );
          expect(toastServiceMock.showSuccess).toHaveBeenCalled();
        });
      });
    });

    it('should delete a product and update the list', () => {
      productsRepositoryMock.getProducts.and.returnValue(
        of({ data: mockProducts })
      );
      productsRepositoryMock.deleteProduct.and.returnValue(
        of({
          data: undefined,
          message: 'Product removed successfully',
        })
      );

      service.loadProducts().subscribe(() => {
        const initialCount = service.filteredProducts().length;
        service.deleteProduct('test1').subscribe(() => {
          expect(productsRepositoryMock.deleteProduct).toHaveBeenCalledWith(
            'test1'
          );
          expect(toastServiceMock.showSuccess).toHaveBeenCalled();
        });
      });
    });
  });

  describe('helper methods', () => {
    it('should add one year to date correctly', () => {
      const date = '2023-05-15';
      const expectedResult = '2024-05-15';
      expect(service.addOneYearToDate(date)).toBe(expectedResult);
    });
  });
});
