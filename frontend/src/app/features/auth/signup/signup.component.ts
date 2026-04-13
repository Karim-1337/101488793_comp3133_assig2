import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

const SIGNUP = gql`
  mutation Signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

@Component({
  selector: 'app-signup',
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
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly apollo = inject(Apollo);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  serverError = '';

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigate(['/employees']);
    }
  }

  submit(): void {
    this.serverError = '';
    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.serverError = 'Passwords do not match';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { username, email } = this.form.getRawValue();
    this.apollo
      .mutate({
        mutation: SIGNUP,
        variables: { username, email, password },
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          const data = res.data as {
            signup: { token: string; user: { id: string; username: string; email: string } };
          };
          if (data?.signup) {
            this.auth.setSession(data.signup.token, data.signup.user);
            void this.router.navigate(['/employees']);
          }
        },
        error: (err: Error) => {
          this.loading = false;
          this.serverError = err.message || 'Signup failed';
        },
      });
  }
}
