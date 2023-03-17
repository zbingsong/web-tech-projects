import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { EventInfo } from 'src/app/common/event-info.interface';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit, OnDestroy {
  public subscription: Subscription = new Subscription();
  public eventList: EventInfo[] = [];
  public ifSearched: boolean = false;
  public ifResultList: boolean = true;
  private sortingDirection: number = -1;

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.service.eventInfoSubj$.subscribe((data: EventInfo[]) => {
        // sort by date and then by time ascending
        data.sort((event1: EventInfo, event2: EventInfo) => {
          let res: number = event1.date.localeCompare(event2.date);
          if (res === 0) {
            res = event1.time.localeCompare(event2.time);
          }
          return res;
        });
        this.eventList = data;
      }),
    );
    this.subscription.add(
      this.service.ifSearched$.subscribe((status: boolean) => {
        this.ifSearched = !status;
      }),
    );
    this.subscription.add(
      this.service.ifResultList$.subscribe((status: boolean) => {
        this.ifResultList = !status;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public showEventDetail(eventId: string): void {
    this.service.getEventDetail(eventId);
    this.service.ifResultList$.next(false);
  }

  public sortTable(key: keyof EventInfo): void {
    this.sortingDirection = -this.sortingDirection;
    this.eventList.sort((event1: EventInfo, event2: EventInfo) => {
      return this.sortingDirection * event1[key].localeCompare(event2[key]);
    });
  }
}
