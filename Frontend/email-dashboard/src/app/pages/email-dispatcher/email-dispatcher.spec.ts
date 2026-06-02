import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailDispatcher } from './email-dispatcher';

describe('EmailDispatcher', () => {
  let component: EmailDispatcher;
  let fixture: ComponentFixture<EmailDispatcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailDispatcher],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailDispatcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
