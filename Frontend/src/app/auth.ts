import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  isLoggedIn = signal(false);
  jwtToken: string | null = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    // Simulate login process
    this.http
      .post(`${environment.backendBaseURI}/api/login`, { email: username, password })
      .subscribe((response: any) => {
        if (response && response.token) {
          this.jwtToken = response.token;
          this.isLoggedIn.set(true);
        }
      });
  }

  getToken() {
    return this.jwtToken;
  }

  logout() {
    this.isLoggedIn.set(false);
  }
}
