import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-campain',
  imports: [
    InputTextModule,
    FormsModule,
    InputNumberModule,
    DatePickerModule,
    CardModule,
    FileUploadModule,
    ButtonModule,
  ],
  templateUrl: './campaign.html',
  styleUrl: './campaign.css',
})
export class Campaign {
  public title: string = '';
  public describtion: string = '';
  public donationGoal: number = 0;
  public endDate: Date = new Date();
  public imagePath: string = '';

  constructor(private auth: Auth, private router: Router, private http: HttpClient) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    }
  }

  onUpload(event: any) {
    const file = event.files[0];
    this.imagePath = URL.createObjectURL(file);
  }

  createCampaign(): void {
    this.http
      .post(
        `${environment.backendBaseURI}/api/campaigns`,
        {
          name: this.title,
          description: this.describtion,
          goal_amount: this.donationGoal,
          image_url: this.imagePath,
          target_payment_id: uuidv4(), // Placeholder, replace with actual payment ID
          end_date: this.endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${this.auth.getToken()}`,
          },
        }
      )
      .subscribe((response: any) => {
        if (response && response.token) {
          console.log(response);
        }
      });
  }
}
