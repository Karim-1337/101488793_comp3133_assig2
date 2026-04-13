import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './main-shell.component.html',
  styleUrl: './main-shell.component.scss',
})
export class MainShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';

  ngOnInit(): void {
    this.username = this.auth.getUser()?.username ?? '';
  }

  logout(): void {
    this.auth.clearSession();
    void this.router.navigate(['/login']);
  }
}
