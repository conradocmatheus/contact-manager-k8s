import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhoneValidatorService {

  constructor(private http: HttpClient) {}

  validatePhoneNumber(number: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/validate-phone`, {
      params: { number },
    });
  }
}
