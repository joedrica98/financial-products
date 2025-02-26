import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../application/products.service';
import { catchError, debounceTime, filter, map, of, switchMap } from 'rxjs';
import { FinancialProduct } from '../../../../core/models/financial-product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);

  productForm!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.loadProduct(id);
    }

    this.productForm.get('date_release')?.valueChanges.subscribe((value) => {
      if (value) {
        const revisionDate = this.addOneYearToDate(value);
        this.productForm.get('date_revision')?.setValue(revisionDate);
      }
    });

    if (!this.isEditMode()) {
      this.addIdValidator();
    }
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.productForm = this.fb.group({
      id: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      logo: ['', Validators.required],
      date_release: [
        today,
        [Validators.required, this.minDateValidator(today)],
      ],
      date_revision: [
        { value: this.addOneYearToDate(today), disabled: true },
        Validators.required,
      ],
    });
  }

  addIdValidator(): void {
    this.productForm
      .get('id')
      ?.valueChanges.pipe(
        debounceTime(300),
        filter((value) => value?.length >= 3),
        switchMap((value) => {
          return this.productsService.verifyProductId(value).pipe(
            map((exists) => {
              console.log('ID existe:', exists);
              return exists === true ? { ['idExists']: true } : null;
            }),
            catchError(() => of(null))
          );
        })
      )
      .subscribe((result) => {
        console.log('Resultado de validación:', result);

        const currentErrors = { ...this.productForm.get('id')?.errors };

        if (result === null) {
          if (currentErrors) {
            delete currentErrors['idExists'];
          }

          this.productForm
            .get('id')
            ?.setErrors(
              Object.keys(currentErrors || {}).length > 0 ? currentErrors : null
            );
        } else {
          this.productForm.get('id')?.setErrors({
            ...currentErrors,
            ...result,
          });
        }
      });
  }

  loadProduct(id: string): void {
    this.productsService.getProductById(id).subscribe({
      next: (response) => {
        this.productForm.get('id')?.disable();

        const productData = (
          response.hasOwnProperty('data') ? response.data : response
        ) as FinancialProduct;

        const product = {
          ...productData,
          date_release: new Date(productData.date_release)
            .toISOString()
            .split('T')[0],
          date_revision: new Date(productData.date_revision)
            .toISOString()
            .split('T')[0],
        };

        this.productForm.patchValue(product);
      },
      error: () => this.router.navigate(['/products']),
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.isSubmitting.set(true);

    const product: FinancialProduct = {
      ...this.productForm.value,
      id: this.isEditMode()
        ? this.productForm.getRawValue().id
        : this.productForm.value.id,
      date_revision: this.productForm.getRawValue().date_revision,
    };

    const request = this.isEditMode()
      ? this.productsService.updateProduct(product)
      : this.productsService.createProduct(product);

    request.subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => this.isSubmitting.set(false),
    });
  }

  resetForm(): void {
    if (this.isEditMode()) {
      this.loadProduct(this.productForm.getRawValue().id);
    } else {
      this.productForm.reset();
      const today = new Date().toISOString().split('T')[0];
      this.productForm.patchValue({
        date_release: today,
        date_revision: this.addOneYearToDate(today),
      });
    }
  }

  isInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  addOneYearToDate(dateString: string): string {
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }

  minDateValidator(minDate: string) {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const controlDate = new Date(control.value);
      const min = new Date(minDate);

      return controlDate >= min ? null : { minDate: true };
    };
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key)?.markAsTouched();
    });
  }
}
