import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import {
  EventDetail,
  EventDetailData,
} from 'src/app/common/event-detail.interface';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  public eventDetail?: EventDetail;

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    this.subscription = this.service.eventDetailSubj$.subscribe(
      (data: EventDetailData) => {
        if (data.event_detail !== undefined) {
          this.eventDetail = data.event_detail;
        }
      },
    );
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
