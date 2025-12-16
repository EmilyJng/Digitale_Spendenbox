import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Donors } from './donors';

describe('Donors', () => {
  let component: Donors;
  let fixture: ComponentFixture<Donors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Donors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Donors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
