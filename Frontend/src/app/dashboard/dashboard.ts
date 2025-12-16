import { Component } from '@angular/core';
import { Auth } from '../auth';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { AgChartsModule } from "ag-charts-angular";
import { TableModule } from 'primeng/table';
import {
  AgChartOptions,
} from "ag-charts-community";
import { fakerDE as faker } from '@faker-js/faker'


const getData = () => {
  return [
    { month: "Jan", max: 50 },
    { month: "Feb", max: 350 },
    { month: "Mar", max: 400 },
    { month: "Apr", max: 565 },
    { month: "May", max: 700 },
    { month: "Jun", max: 710 },
    { month: "Jul", max: 720 },
    { month: "Aug", max: 900 },
    { month: "Sep", max: 1036 },
    { month: "Oct", max: 1368 },
    { month: "Nov", max: 2500 },
    { month: "Dec", max: 5000 },
  ];
};

const getDonors = () => {
  const donors = []

  for(let i = 1; i <= 400; i++) {
    donors.push({
      id: `D${i}`,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      amount: faker.number.int({ min: 1, max: 200 })
    });
  }

  return donors;
}

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, AgChartsModule, TableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public options: AgChartOptions;
  public donors = getDonors();

  constructor(private router: Router, private auth: Auth) {
    if(!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    }
    this.options = {
          title: {
            text: "",
          },
          theme: "ag-default-dark",
          subtitle: {
            text: "2025",
          },
          data: getData(),
          series: [
            {
              type: "line",
              xKey: "month",
              xName: "Month",
              yKey: "max",
              yName: "Euro",
              interpolation: { type: "smooth" },
            },
          ],
        };
  }

}
