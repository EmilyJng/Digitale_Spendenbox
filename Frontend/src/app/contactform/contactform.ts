import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contactform',
  imports: [ToastModule, ButtonModule, CardModule, InputTextModule, FormsModule],
  templateUrl: './contactform.html',
  styleUrl: './contactform.css',
})
export class Contactform {
  name = '';
  email = '';
  subject = '';
  message = '';

  async sendContactMessage() {
    await fetch(`${environment.backendBaseURI}/api/contactform/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message,
      }),
    });
  }
}
