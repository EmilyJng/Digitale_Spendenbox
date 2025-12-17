import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly stripePublicKey = "pk_test_51SfKnxLTdWRE3lX8ItGbYsQLTzuNLxrjRnRKT9mGXltVA7njOohnE5M3QW83p1OOhMYDBQzXVxUzlbX2Ulahd3EA00Ke2cEZW2"

  constructor(){
  }

  public getPublicKey(): string {
    return this.stripePublicKey;
  }
}
