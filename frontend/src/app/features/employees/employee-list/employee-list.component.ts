import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import type { Employee } from '../../../core/models/employee.model';
import { CardHoverDirective } from '../../../shared/directives/card-hover.directive';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';

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

const DELETE_EMP = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    CardHoverDirective,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private readonly apollo = inject(Apollo);
  private readonly dialog = inject(MatDialog);

  displayedColumns = ['photo', 'firstName', 'lastName', 'email', 'department', 'position', 'actions'];
  employees: Employee[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = '';
    this.apollo
      .watchQuery<{ employees: Employee[] }>({
        query: EMPLOYEES,
        variables: { filter: {} },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe({
        next: (res) => {
          this.loading = false;
          this.employees = (res.data?.employees ?? []) as Employee[];
        },
        error: (err: Error) => {
          this.loading = false;
          this.error = err.message;
        },
      });
  }

  confirmDelete(emp: Employee): void {
    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { name: `${emp.firstName} ${emp.lastName}`.trim() },
      width: '360px',
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.apollo
        .mutate({
          mutation: DELETE_EMP,
          variables: { id: emp.id },
          refetchQueries: [{ query: EMPLOYEES, variables: { filter: {} } }],
        })
        .subscribe({
          error: (err: Error) => {
            this.error = err.message;
          },
        });
    });
  }
}
