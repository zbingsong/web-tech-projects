import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ArtistDetail } from 'src/app/common/artist-detail.interface';
import { EventDetail } from 'src/app/common/event-detail.interface';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit, OnDestroy {
  public subscription: Subscription = new Subscription();
  public eventDetail?: EventDetail;
  public ifSearched: boolean = false;
  public ifResultList: boolean = true;
  public addedToFavorites: boolean = false;
  public artistsText: string = '';
  public artists: ArtistDetail[] = [];

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.service.eventDetailSubj$.subscribe((data: EventDetail) => {
        this.eventDetail = data;
        this.artistsText = data.artists
          .map((artist) => artist.name)
          .join(' | ');
        this.addedToFavorites = localStorage.getItem(data.id) === null;
        const artistList: Array<{ name: string; category: string }> =
          data.artists.filter((artist) => artist.category === 'Music');
        artistList.forEach((artist) => {
          this.service
            .getArtistDetail(artist.name)
            .subscribe((artistDetail) => {
              if (artistDetail.id !== null) {
                this.artists.push(artistDetail as ArtistDetail);
              }
            });
        });
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

  public hideEventDetail(): void {
    this.service.ifResultList$.next(true);
  }

  public addToFavorites(): void {
    if (this.eventDetail === undefined) return;
    alert('Event Added to Favorites!');
    this.addedToFavorites = true;
    const eventInfoFav = {
      date: this.eventDetail.date,
      time: this.eventDetail.time,
      name: this.eventDetail.name,
      category: this.eventDetail.category,
      venue: this.eventDetail.venue,
    };
    localStorage.setItem(this.eventDetail.id, JSON.stringify(eventInfoFav));
  }
}
