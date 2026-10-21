import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { environment } from '../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses ID-free endpoints for authenticated profile operations', () => {
    service.getProfile().subscribe();
    const getRequest = httpTesting.expectOne(`${environment.apiUrl}/users/me`);
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({});

    service.updateProfile({ name: 'New name', email: 'new@example.com' }).subscribe();
    const updateRequest = httpTesting.expectOne(`${environment.apiUrl}/users/me`);
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush({});

    service.updatePassword({ currentPassword: 'old-password', newPassword: 'new-password' }).subscribe();
    const passwordRequest = httpTesting.expectOne(`${environment.apiUrl}/auth/password`);
    expect(passwordRequest.request.method).toBe('PUT');
    passwordRequest.flush({});

    service.delete().subscribe();
    const deleteRequest = httpTesting.expectOne(`${environment.apiUrl}/users/me`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });
});
