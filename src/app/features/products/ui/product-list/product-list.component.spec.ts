import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductsService } from '../../application/products.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { By } from '@angular/platform-browser';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productsServiceMock: jasmine.SpyObj<ProductsService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let router: Router;

  const mockProducts: FinancialProduct[] = [
    {
      id: 'test1',
      name: 'Test Product',
      description: 'Test Description for the product',
      logo: 'test-logo.png',
      date_release: '2023-01-01',
      date_revision: '2024-01-01',
    },
    {
      id: 'test2',
      name: 'Another Product',
      description: 'Another test description',
      logo: 'test-logo-2.png',
      date_release: '2023-02-01',
      date_revision: '2024-02-01',
    },
  ];

  beforeEach(async () => {
    const productsSpy = jasmine.createSpyObj(
      'ProductsService',
      ['loadProducts', 'setSearchTerm', 'setItemsPerPage', 'deleteProduct'],
      {
        paginatedProducts: () => mockProducts,
        totalFilteredCount: () => mockProducts.length,
        totalPages: () => 1,
      }
    );

    const toastSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, ProductListComponent],
      providers: [
        { provide: ProductsService, useValue: productsSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    productsServiceMock = TestBed.inject(
      ProductsService
    ) as jasmine.SpyObj<ProductsService>;
    toastServiceMock = TestBed.inject(
      ToastService
    ) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router);

    productsServiceMock.loadProducts.and.returnValue(
      of({ data: mockProducts })
    );

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(productsServiceMock.loadProducts).toHaveBeenCalled();
  });

  it('should navigate to add product page when button is clicked', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateToAddProduct();
    expect(navigateSpy).toHaveBeenCalledWith(['/products/add']);
  });

  it('should navigate to edit product page with correct id', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.editProduct(mockProducts[0]);
    expect(navigateSpy).toHaveBeenCalledWith(['/products/edit', 'test1']);
  });

  it('should update search term when search input changes', () => {
    const searchTerm = 'Test';
    component.onSearch({ target: { value: searchTerm } } as unknown as Event);
    expect(productsServiceMock.setSearchTerm).toHaveBeenCalledWith(searchTerm);
  });

  it('should update items per page when select changes', () => {
    const select = { value: '10' } as HTMLSelectElement;
    component.onItemsPerPageChange({ target: select } as unknown as Event);
    expect(productsServiceMock.setItemsPerPage).toHaveBeenCalledWith(10);
  });

  it('should show delete confirmation modal', () => {
    component.confirmDelete(mockProducts[0]);
    expect(component.showDeleteModal).toBeTrue();
    expect(component.selectedProduct).toEqual(mockProducts[0]);
  });

  it('should hide delete confirmation modal when cancelled', () => {
    component.confirmDelete(mockProducts[0]);
    component.cancelDelete();
    expect(component.showDeleteModal).toBeFalse();
    expect(component.selectedProduct).toBeNull();
  });

  it('should delete product when confirmed', () => {
    productsServiceMock.deleteProduct.and.returnValue(
      of({ message: 'Product removed successfully', data: undefined })
    );

    component.confirmDelete(mockProducts[0]);
    component.deleteProduct();

    expect(productsServiceMock.deleteProduct).toHaveBeenCalledWith('test1');
    expect(component.showDeleteModal).toBeFalse();
    expect(component.selectedProduct).toBeNull();
  });

  it('should display products in the table', () => {
    // Forzar que el estado de carga se complete
    component.isLoading.set(false);
    fixture.detectChanges();

    const productRows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(productRows.length).toBe(2);

    const firstRowCells = productRows[0].queryAll(By.css('td'));
    expect(firstRowCells[1].nativeElement.textContent).toContain(
      'Test Product'
    );
    expect(firstRowCells[2].nativeElement.textContent).toContain(
      'Test Description for the product'
    );
  });

  it('should display the total count of products', () => {
    // Forzar que el estado de carga se complete
    component.isLoading.set(false);
    fixture.detectChanges();

    const resultsCount = fixture.debugElement.query(By.css('.results-count'));
    expect(resultsCount.nativeElement.textContent).toContain('2 Resultados');
  });
});
