import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadService } from '../../../core/services/upload.service';

const CREATE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
    }
  }
`;

@Component({
  selector: 'app-employee-add',
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
  templateUrl: './employee-add.component.html',
  styleUrl: './employee-add.component.scss',
})
export class EmployeeAddComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly upload = inject(UploadService);

  loading = false;
  serverError = '';
  previewUrl: string | null = null;
  private file: File | null = null;

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    department: [''],
    position: [''],
  });

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
    this.loading = true;
    let profilePictureUrl = '';
    try {
      if (this.file) {
        profilePictureUrl = await this.upload.uploadProfileImage(this.file);
      }
    } catch (e) {
      this.loading = false;
      this.serverError = e instanceof Error ? e.message : 'Image upload failed';
      return;
    }
    const v = this.form.getRawValue();
    this.apollo
      .mutate({
        mutation: CREATE,
        variables: {
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
          this.loading = false;
          void this.router.navigate(['/employees']);
        },
        error: (err: Error) => {
          this.loading = false;
          this.serverError = err.message;
        },
      });
  }
}
