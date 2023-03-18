import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { EventDetail } from 'src/app/common/event-detail.interface';

@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.css'],
})
export class EventDashboardComponent implements OnInit, OnDestroy {
  public eventDetail?: EventDetail;
  public artistsText: string = '';
  private subscription?: Subscription;

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    console.log('event dashboard init');
    this.subscription = this.service.eventDetailSubj$.subscribe(
      (data: EventDetail) => {
        this.eventDetail = data;
        this.artistsText = data.artists
          .map((artist) => artist.name)
          .join(' | ');
        console.log('event dashboard received event detail');
      },
    );
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
