import { ChangeDetectorRef, Component, effect, input, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
  StripePaymentElementOptions,
} from '@stripe/stripe-js';
import {
  injectStripe,
  NgxStripeModule,
  StripePaymentElementComponent,
  StripeServiceInterface,
} from 'ngx-stripe';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaymentService } from '../paymentService';
import { ToastModule } from 'primeng/toast';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CampaignService } from '../campaign-service';

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
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  @ViewChild(StripePaymentElementComponent)
  paymentElement!: StripePaymentElementComponent;
  campaignId = input<string>();
  campaignHeader = "";

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
      theme: 'flat',
    },
  };

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false,
    },
  };

  stripe: StripeServiceInterface;
  paying = signal(false);

  constructor(
    private paymentService: PaymentService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private campaignService: CampaignService
  ) {
    this.stripe = injectStripe(this.paymentService.getPublicKey());

    effect(() => {
         const campaignId = this.campaignId();
         if(campaignId){
           this.setCampaignHeader(campaignId);
         }
       });
  }

  setCampaignHeader(campaignId: string) {
    const campaign = this.campaignService.getCampaigns().find(c => c.id == campaignId);
    this.campaignHeader = `Spende für Kampagne ${campaign?.name || campaignId}`;
  }

  async startDonationProcess() {
    this.paying.set(true);
    const clientSecret = (await this.createPaymentIntent()).clientSecret;
    this.elementsOptions.clientSecret = clientSecret;
    this.paying.set(false);
    this.cdRef.detectChanges();
  }

  async createPaymentIntent() {
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
                city: this.city,
              },
            },
          },
        },
        redirect: 'if_required',
      })
      .subscribe(async (result) => {
        this.paying.set(false);
        if (result.error) {
          // Show error to your customer (e.g., insufficient funds)
          alert({ success: false, error: result.error.message });
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {



            const donationData = {
              amount: this.amount,
              campaignId: this.campaignId(),
              name: this.name,
              paymentIntentId: result.paymentIntent.id
            };

            console.log(donationData)

            await fetch(`${environment.backendBaseURI}/api/donate/confirm`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(donationData),
            });
            // Show a success message to your customer
            this.messageService.add({
              severity: 'success',
              summary: 'Danke für Ihre Spende!',
              detail: 'Ihre Spende wurde erfolgreich verarbeitet.',
            });
            this.router.navigateByUrl('/home');
          }
        }
      });
  }
}
