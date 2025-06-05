import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Histogram1Component } from './histogram1.component';

describe('Histogram1Component', () => {
  let component: Histogram1Component;
  let fixture: ComponentFixture<Histogram1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Histogram1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Histogram1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
