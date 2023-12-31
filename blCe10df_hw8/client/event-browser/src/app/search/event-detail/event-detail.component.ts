import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { EventDetail } from 'src/app/common/event-detail.interface';
import { EventInfoFav } from 'src/app/common/event-info-fav.interface';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit, OnDestroy {
  public subscription: Subscription = new Subscription();
  public eventDetail?: EventDetail;
  public ifSearched: boolean = false;
  public ifResultList: boolean = false;
  public addedToFavorites: boolean = false;

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    // console.log('event detail init');
    this.subscription.add(
      this.service.eventDetailSubj$.subscribe((data: EventDetail) => {
        // console.log('event detail subscribed');
        this.eventDetail = data;
        this.addedToFavorites = localStorage.getItem(data.id) !== null;
        // console.log(`added to fav? ${this.addedToFavorites.toString()}`);
      }),
    );
    this.subscription.add(
      this.service.ifSearched$.subscribe((status: boolean) => {
        this.ifSearched = status;
      }),
    );
    this.subscription.add(
      this.service.ifResultList$.subscribe((status: boolean) => {
        this.ifResultList = status;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public hideEventDetail(): void {
    this.service.ifResultList$.next(true);
  }

  public toggleFavorites(): void {
    if (this.eventDetail === undefined) return;
    if (this.addedToFavorites) {
      alert('Event Removed from Favorites!');
      this.addedToFavorites = false;
      localStorage.removeItem(this.eventDetail.id);
    } else {
      alert('Event Added to Favorites!');
      this.addedToFavorites = true;
      const eventInfoFav: EventInfoFav = {
        id: this.eventDetail.id,
        date: this.eventDetail.date,
        name: this.eventDetail.name,
        category: this.eventDetail.genre,
        venue: this.eventDetail.venue,
      };
      localStorage.setItem(this.eventDetail.id, JSON.stringify(eventInfoFav));
    }
  }
}
