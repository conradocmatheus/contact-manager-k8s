export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  userId: number;
}

export type ContactInput = Pick<Contact, 'name' | 'email' | 'phone'>;
