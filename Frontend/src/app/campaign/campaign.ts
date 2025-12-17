import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-campain',
  imports: [
    InputTextModule,
    FormsModule,
    InputNumberModule,
    DatePickerModule,
    CardModule,
    FileUploadModule,
    ButtonModule
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

  onUpload(event: any) {
    const file = event.files[0];
    this.imagePath = URL.createObjectURL(file);
  }
}
