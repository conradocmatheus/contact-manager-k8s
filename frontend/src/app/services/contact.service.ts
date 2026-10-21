import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';
import { Contact, ContactInput } from '../models/contact';
import { environment } from '../../environments/environment';

export interface PaginatedResponse {
  contacts: Contact[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type ContactsApiResponse = PaginatedResponse | Contact[];

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contacts`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, limit: number = 10, search: string = ''): Observable<PaginatedResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);

    return this.http.get<ContactsApiResponse>(this.apiUrl, { params }).pipe(
      timeout(15000),
      map(response => this.normalizeListResponse(response, page, limit, search))
    );
  }

  create(contact: ContactInput): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, contact);
  }

  update(id: number, contact: ContactInput): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/${id}`, contact);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/all`);
  }

  private normalizeListResponse(
    response: ContactsApiResponse,
    page: number,
    limit: number,
    search: string
  ): PaginatedResponse {
    if (!Array.isArray(response)) {
      if (!Array.isArray(response?.contacts) || !response?.pagination) {
        throw new Error('Invalid contacts API response');
      }

      return response;
    }

    const normalizedSearch = search.trim().toLocaleLowerCase();
    const filteredContacts = normalizedSearch
      ? response.filter(contact =>
          contact.name.toLocaleLowerCase().includes(normalizedSearch)
          || contact.email?.toLocaleLowerCase().includes(normalizedSearch)
        )
      : response;
    const start = (page - 1) * limit;
    const total = filteredContacts.length;

    return {
      contacts: filteredContacts.slice(start, start + limit),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
