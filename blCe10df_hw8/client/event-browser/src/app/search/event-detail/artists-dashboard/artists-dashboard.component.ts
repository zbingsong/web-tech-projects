import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ArtistDetail } from 'src/app/common/artist-detail.interface';
import { EventDetail } from 'src/app/common/event-detail.interface';

@Component({
  selector: 'app-artists-dashboard',
  templateUrl: './artists-dashboard.component.html',
  styleUrls: ['./artists-dashboard.component.css'],
})
export class ArtistsDashboardComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  public artists: ArtistDetail[] = [];
  public eventCategory: string = '';

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    this.subscription = this.service.eventDetailSubj$.subscribe(
      (data: EventDetail) => {
        this.artists = [];
        this.eventCategory = data.category;
        const artistList: Array<{ name: string; category: string }> =
          data.artists.filter((artist) => artist.category === 'Music');
        artistList.forEach((artist) => {
          this.service
            .getArtistDetail(artist.name)
            .subscribe((artistDetail) => {
              if (artistDetail.id !== '') {
                this.artists.push(artistDetail as ArtistDetail);
              }
            });
        });
      },
    );
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
