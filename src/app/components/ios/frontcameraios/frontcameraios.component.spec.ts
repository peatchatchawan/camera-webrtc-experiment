import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontcameraiosComponent } from './frontcameraios.component';

describe('FrontcameraiosComponent', () => {
  let component: FrontcameraiosComponent;
  let fixture: ComponentFixture<FrontcameraiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrontcameraiosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FrontcameraiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
