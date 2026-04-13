import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly auth = inject(AuthService);

  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const token = this.auth.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await axios.post<{ url: string }>(
      `${environment.apiUrl}/api/upload`,
      formData,
      { headers }
    );
    return res.data.url;
  }
}
