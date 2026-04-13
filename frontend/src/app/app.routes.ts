import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainShellComponent } from './layout/main-shell/main-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: '',
    component: MainShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'employees' },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employee-list/employee-list.component').then(
            (m) => m.EmployeeListComponent
          ),
      },
      {
        path: 'employees/add',
        loadComponent: () =>
          import('./features/employees/employee-add/employee-add.component').then(
            (m) => m.EmployeeAddComponent
          ),
      },
      {
        path: 'employees/search',
        loadComponent: () =>
          import('./features/employees/employee-search/employee-search.component').then(
            (m) => m.EmployeeSearchComponent
          ),
      },
      {
        path: 'employees/:id/view',
        loadComponent: () =>
          import('./features/employees/employee-view/employee-view.component').then(
            (m) => m.EmployeeViewComponent
          ),
      },
      {
        path: 'employees/:id/edit',
        loadComponent: () =>
          import('./features/employees/employee-update/employee-update.component').then(
            (m) => m.EmployeeUpdateComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
