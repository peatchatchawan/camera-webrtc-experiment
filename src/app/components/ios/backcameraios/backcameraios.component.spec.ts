import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackcameraiosComponent } from './backcameraios.component';

describe('BackcameraiosComponent', () => {
  let component: BackcameraiosComponent;
  let fixture: ComponentFixture<BackcameraiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackcameraiosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackcameraiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
