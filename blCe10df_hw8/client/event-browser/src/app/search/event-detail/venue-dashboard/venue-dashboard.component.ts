import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { EventDetail } from 'src/app/common/event-detail.interface';
import { VenueDetail } from 'src/app/common/venue-detail.interface';

@Component({
  selector: 'app-venue-dashboard',
  templateUrl: './venue-dashboard.component.html',
  styleUrls: ['./venue-dashboard.component.css'],
})
export class VenueDashboardComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  public venueDetail?: VenueDetail;
  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    this.subscription = this.service.eventDetailSubj$.subscribe(
      (data: EventDetail) => {
        this.service.getVenueDetail(data.venue_id).subscribe({
          next: (venue: VenueDetail) => {
            this.venueDetail = venue;
          },
          error: (error: any) => {
            console.error(error);
            this.venueDetail = undefined;
          },
        });
      },
    );
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
