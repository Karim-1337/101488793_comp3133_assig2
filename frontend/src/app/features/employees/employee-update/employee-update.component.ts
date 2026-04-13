import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadService } from '../../../core/services/upload.service';

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

const UPDATE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id
    }
  }
`;

@Component({
  selector: 'app-employee-update',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employee-update.component.html',
  styleUrl: './employee-update.component.scss',
})
export class EmployeeUpdateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apollo = inject(Apollo);
  private readonly upload = inject(UploadService);

  employeeId = '';
  loading = true;
  saving = false;
  loadError = '';
  serverError = '';
  previewUrl: string | null = null;
  existingImage = '';
  private file: File | null = null;

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    department: [''],
    position: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError = 'Missing employee id';
      this.loading = false;
      return;
    }
    this.employeeId = id;
    this.apollo
      .query<{ employee: { id: string; firstName: string; lastName: string; email: string; department?: string; position?: string; profilePictureUrl?: string } | null }>({
        query: EMPLOYEE,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          const e = res.data?.employee;
          if (!e) {
            this.loadError = 'Employee not found';
            return;
          }
          this.form.patchValue({
            firstName: e.firstName,
            lastName: e.lastName,
            email: e.email,
            department: e.department ?? '',
            position: e.position ?? '',
          });
          this.existingImage = e.profilePictureUrl ?? '';
        },
        error: (err: Error) => {
          this.loading = false;
          this.loadError = err.message;
        },
      });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0];
    this.file = f ?? null;
    this.previewUrl = null;
    if (f) {
      this.previewUrl = URL.createObjectURL(f);
    }
  }

  async submit(): Promise<void> {
    this.serverError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    let profilePictureUrl = this.existingImage;
    try {
      if (this.file) {
        profilePictureUrl = await this.upload.uploadProfileImage(this.file);
      }
    } catch (e) {
      this.saving = false;
      this.serverError = e instanceof Error ? e.message : 'Image upload failed';
      return;
    }
    const v = this.form.getRawValue();
    this.apollo
      .mutate({
        mutation: UPDATE,
        variables: {
          id: this.employeeId,
          input: {
            firstName: v.firstName,
            lastName: v.lastName,
            email: v.email,
            department: v.department || undefined,
            position: v.position || undefined,
            profilePictureUrl: profilePictureUrl || undefined,
          },
        },
      })
      .subscribe({
        next: () => {
          this.saving = false;
          void this.router.navigate(['/employees', this.employeeId, 'view']);
        },
        error: (err: Error) => {
          this.saving = false;
          this.serverError = err.message;
        },
      });
  }
}
