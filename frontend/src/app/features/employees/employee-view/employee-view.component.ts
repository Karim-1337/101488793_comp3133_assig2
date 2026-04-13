import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Employee } from '../../../core/models/employee.model';
import { FullNamePipe } from '../../../shared/pipes/full-name.pipe';
import { CardHoverDirective } from '../../../shared/directives/card-hover.directive';

const EMPLOYEE = gql`
  query Employee($id: ID!) {
    employee(id: $id) {
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
  selector: 'app-employee-view',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FullNamePipe,
    CardHoverDirective,
  ],
  templateUrl: './employee-view.component.html',
  styleUrl: './employee-view.component.scss',
})
export class EmployeeViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly apollo = inject(Apollo);

  employee: Employee | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Missing employee id';
      this.loading = false;
      return;
    }
    this.apollo
      .query<{ employee: Employee | null }>({
        query: EMPLOYEE,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.employee = (res.data?.employee ?? null) as Employee | null;
          if (!this.employee) this.error = 'Employee not found';
        },
        error: (err: Error) => {
          this.loading = false;
          this.error = err.message;
        },
      });
  }
}
