import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRegistry } from './app-registry';

describe('AppRegistry', () => {
  let component: AppRegistry;
  let fixture: ComponentFixture<AppRegistry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRegistry],
    }).compileComponents();

    fixture = TestBed.createComponent(AppRegistry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
