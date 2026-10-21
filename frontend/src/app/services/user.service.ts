import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateProfile(userData: { name: string, email: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, userData);
  }

  updatePassword(passwordData: { currentPassword: string, newPassword: string }): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/auth/password`, passwordData);
  }

  delete(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me`);
  }
}
