import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';
import { Auth } from '../auth';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { Router } from '@angular/router';
import { CampaignService } from '../campaign-service';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, CardModule, ProgressBarModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  campaigns: Array<any> = [];

  constructor(private http: HttpClient, private auth: Auth, private cdRef: ChangeDetectorRef, private router: Router, private campaignService: CampaignService) {}

  ngOnInit() {
    this.http
      .get(`${environment.backendBaseURI}/api/campaigns`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.auth.getToken()}`,
        },
      })
      .subscribe((data: any) => {
        this.campaignService.setCampaigns(data);
        this.campaigns = this.campaignService.getCampaigns();
        this.cdRef.detectChanges();
      });
  }

  openCampaign(campaign: any) {
    this.router.navigateByUrl(`/checkout/${campaign.id}`);
  }
}
