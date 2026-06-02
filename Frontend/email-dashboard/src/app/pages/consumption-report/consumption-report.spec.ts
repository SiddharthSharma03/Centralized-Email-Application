import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionReport } from './consumption-report';

describe('ConsumptionReport', () => {
  let component: ConsumptionReport;
  let fixture: ComponentFixture<ConsumptionReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsumptionReport],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsumptionReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
