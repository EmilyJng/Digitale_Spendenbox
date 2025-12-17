import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';
import { Auth } from '../auth';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, CardModule, ProgressBarModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  campaigns: Array<any> = [];

  constructor(private http: HttpClient, private auth: Auth) {}

  ngOnInit() {
    this.http
      .get(`${environment.backendBaseURI}/api/campaigns`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.auth.getToken()}`,
        },
      })
      .subscribe((data: any) => {
        console.log(data);
        this.campaigns = data;
      });
  }
}
