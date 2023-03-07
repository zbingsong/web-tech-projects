import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { EventInfo, EventInfoData } from 'src/app/common/event-info.interface';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit, OnDestroy {
  public ifAnyResult: boolean = false;
  private subscription?: Subscription;
  public eventList?: EventInfo[];

  constructor(private readonly service: AppService) {}

  ngOnInit(): void {
    this.subscription = this.service.eventInfoSubj$.subscribe(
      (data: EventInfoData) => {
        if (data.events !== undefined) {
          this.eventList = data.events;
        }
      },
    );
  }

  ngOnDestroy(): void {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}
