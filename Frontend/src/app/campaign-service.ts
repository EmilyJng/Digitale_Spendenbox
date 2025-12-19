import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private campaigns: any[] = [];


  getCampaigns(): any[] {
    return this.campaigns;
  }
  setCampaigns(campaigns: any[]) {
    this.campaigns = campaigns;
  }
}
