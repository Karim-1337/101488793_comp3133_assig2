import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Employee } from '../../../core/models/employee.model';
import { FullNamePipe } from '../../../shared/pipes/full-name.pipe';

const EMPLOYEES = gql`
  query Employees($filter: EmployeeFilter) {
    employees(filter: $filter) {
      id
      firstName
      lastName
      email
      department
      position
      profilePictureUrl
    }
  }
`;

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    FullNamePipe,
  ],
  templateUrl: './employee-search.component.html',
  styleUrl: './employee-search.component.scss',
})
export class EmployeeSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly apollo = inject(Apollo);

  form = this.fb.nonNullable.group({
    department: [''],
    position: [''],
  });

  displayedColumns = ['name', 'email', 'department', 'position', 'actions'];
  results: Employee[] = [];
  searched = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.runSearch();
  }

  runSearch(): void {
    this.loading = true;
    this.error = '';
    this.searched = true;
    const { department, position } = this.form.getRawValue();
    const filter: { department?: string; position?: string } = {};
    if (department.trim()) filter.department = department.trim();
    if (position.trim()) filter.position = position.trim();
    this.apollo
      .watchQuery<{ employees: Employee[] }>({
        query: EMPLOYEES,
        variables: { filter },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe({
        next: (res) => {
          this.loading = false;
          this.results = (res.data?.employees ?? []) as Employee[];
        },
        error: (err: Error) => {
          this.loading = false;
          this.error = err.message;
        },
      });
  }
}
