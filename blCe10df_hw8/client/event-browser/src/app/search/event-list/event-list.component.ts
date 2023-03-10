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
  private subscription?: Subscription;
  public eventList: EventInfo[] = [];
  private sortingDirection = -1;

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    this.subscription = this.service.eventInfoSubj$.subscribe(
      (data: EventInfoData) => {
        if (data.events !== undefined) {
          this.eventList = data.events;
          // sort by date and then by time ascending
          this.eventList.sort((event1: EventInfo, event2: EventInfo) => {
            let res: number = event1.date.localeCompare(event2.date);
            if (res === 0) {
              res = event1.time.localeCompare(event2.time);
            }
            return res;
          });
        }
      },
    );
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public showEventDetail(eventId: string): void {
    this.service.getEventDetail(eventId);
  }

  public sortTable(key: keyof EventInfo): void {
    this.eventList.sort((event1: EventInfo, event2: EventInfo) => {
      this.sortingDirection = -this.sortingDirection;
      return this.sortingDirection * event1[key].localeCompare(event2[key]);
    });
  }
}
