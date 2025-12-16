import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-campange',
  imports: [
    InputTextModule,
    FormsModule,
    InputNumberModule,
    DatePickerModule,
    CardModule,
    FileUploadModule,
  ],
  templateUrl: './campange.html',
  styleUrl: './campange.css',
})
export class Campange {
  public title: string = '';
  public describtion: string = '';
  public donationGoal: number = 0;
  public endDate: Date = new Date();
  public imagePath: string = '';
}
