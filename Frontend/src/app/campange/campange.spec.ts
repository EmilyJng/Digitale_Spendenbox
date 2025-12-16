import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Campange } from './campange';

describe('Campange', () => {
  let component: Campange;
  let fixture: ComponentFixture<Campange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Campange]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Campange);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
