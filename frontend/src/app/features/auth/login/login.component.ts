import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly apollo = inject(Apollo);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = false;
  serverError = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigate(['/employees']);
    }
  }

  submit(): void {
    this.serverError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { email, password } = this.form.getRawValue();
    this.apollo
      .mutate({
        mutation: LOGIN,
        variables: { email, password },
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          const data = res.data as {
            login: { token: string; user: { id: string; username: string; email: string } };
          };
          if (data?.login) {
            this.auth.setSession(data.login.token, data.login.user);
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/employees';
            void this.router.navigateByUrl(returnUrl);
          }
        },
        error: (err: Error) => {
          this.loading = false;
          this.serverError = err.message || 'Login failed';
        },
      });
  }
}
