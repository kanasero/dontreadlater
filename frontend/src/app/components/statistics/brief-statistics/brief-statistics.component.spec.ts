import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BriefStatisticsComponent} from './brief-statistics.component';

describe('BriefStatisticsComponent', () => {
  let component: BriefStatisticsComponent;
  let fixture: ComponentFixture<BriefStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefStatisticsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BriefStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
