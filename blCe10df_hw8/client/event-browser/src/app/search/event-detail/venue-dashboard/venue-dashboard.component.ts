import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { EventDetail } from 'src/app/common/event-detail.interface';
import { VenueDetail } from 'src/app/common/venue-detail.interface';
import { MapDialogComponent } from './map-dialog/map-dialog.component';

@Component({
  selector: 'app-venue-dashboard',
  templateUrl: './venue-dashboard.component.html',
  styleUrls: ['./venue-dashboard.component.css'],
})
export class VenueDashboardComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  public venueDetail?: VenueDetail;
  public showAllText = {
    hour: false,
    rule: false,
    child: false,
  };

  constructor(private readonly service: AppService, public dialog: MatDialog) {}

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

  public showMap(): void {
    if (this.venueDetail === undefined) return;
    this.dialog.open(MapDialogComponent, {
      data: { center: this.venueDetail.location, zoom: 14 },
    });
  }

  public toggleLongTextShow(category: keyof typeof this.showAllText): void {
    this.showAllText[category] = !this.showAllText[category];
  }
}
