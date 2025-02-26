import { Routes } from '@angular/router';
import { ProductListComponent } from './ui/product-list/product-list.component';
import { ProductFormComponent } from './ui/product-form/product-form.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductListComponent,
  },
  {
    path: 'add',
    component: ProductFormComponent,
  },
  {
    path: 'edit/:id',
    component: ProductFormComponent,
  },
];
