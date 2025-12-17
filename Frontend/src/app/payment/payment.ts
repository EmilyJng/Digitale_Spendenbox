import { Component, signal, ViewChild } from '@angular/core';
import { FormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { StripeCardElementOptions, StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import { injectStripe, NgxStripeModule, StripePaymentElementComponent, StripeServiceInterface } from 'ngx-stripe';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaymentService } from '../paymentService';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-payment',
  imports: [
    NgxStripeModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
    DatePickerModule,
    CardModule,
    FileUploadModule,
    ButtonModule
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  @ViewChild(StripePaymentElementComponent)
  paymentElement!: StripePaymentElementComponent;

  name = '';
  email = '';
  street = '';
  zipcode = '';
  city = '';
  amount = 0;


  elementsOptions: StripeElementsOptions = {
    locale: 'de',
    clientSecret: '',
    appearance: {
      theme: 'flat'
    }
  };

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false
    }
  };

  stripe: StripeServiceInterface;
  paying = signal(false);

  constructor(private paymentService: PaymentService) {
    this.stripe = injectStripe(this.paymentService.getPublicKey());
  }


  async startDonationProcess() {
    this.paying.set(true);
    const clientSecret = (await this.createPaymentIntent()).clientSecret;
    this.elementsOptions.clientSecret = clientSecret;
    this.paying.set(false);
  }

  async createPaymentIntent(){
    const response = await fetch(`${environment.backendBaseURI}/api/donate/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: this.amount,
        campaignId: uuidv4(),
      }),
    });
    const data = await response.json();
    return data;
  }

  pay() {
      if (this.paying()) return;
      this.paying.set(true);

      this.stripe
        .confirmPayment({
          elements: this.paymentElement.elements,
          confirmParams: {
            payment_method_data: {
              billing_details: {
                name: this.name,
                email: this.email,
                address: {
                  line1: this.street,
                  postal_code: this.zipcode,
                  city: this.city
                }
              }
            }
          },
          redirect: 'if_required'
        })
        .subscribe(result => {
          this.paying.set(false);
          if (result.error) {
            // Show error to your customer (e.g., insufficient funds)
            alert({ success: false, error: result.error.message });
          } else {
            // The payment has been processed!
            if (result.paymentIntent.status === 'succeeded') {
              // Show a success message to your customer
              alert("success");
            }
          }
        });
    }
}
