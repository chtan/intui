import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgCountdownComponent } from './svg-countdown.component';

describe('SvgCountdownComponent', () => {
  let component: SvgCountdownComponent;
  let fixture: ComponentFixture<SvgCountdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgCountdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvgCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
