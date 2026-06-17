import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRegister } from './app-register';

describe('AppRegister', () => {
  let component: AppRegister;
  let fixture: ComponentFixture<AppRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(AppRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
