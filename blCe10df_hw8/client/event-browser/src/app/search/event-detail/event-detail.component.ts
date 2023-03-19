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
  public eventDetail: EventDetail = {
    id: 'vvG1IZ9pNeVNoR',
    name: 'P!NK: Summer Carnival 2023; P!NK: Summer Carnival 2023',
    date: '2023-10-05',
    time: '18:30:00',
    artists: [
      {
        name: 'P!NK',
        category: 'Music',
      },
      {
        name: 'Pat Benatar & Neil Giraldo',
        category: 'Music',
      },
      {
        name: 'Grouplove',
        category: 'Music',
      },
      {
        name: 'KidCutUp',
        category: 'Music',
      },
    ],
    genre: 'Music | Rock | Pop',
    category: 'Music',
    venue_id: 'KovZ917ACh0',
    venue: 'SoFi Stadium',
    price: '55.95 - 405.95 USD',
    status: 'On Sale',
    status_color: 'green',
    // eslint-disable-next-line max-len
    buy: 'https://www.ticketmaster.com/pnk-summer-carnival-2023-inglewood-california-10-05-2023/event/0A005D68C2D2346F',
    seatmap:
      // eslint-disable-next-line max-len
      'https://maps.ticketmaster.com/maps/geometry/3/event/0A005D68C2D2346F/staticImage?type=png&systemId=HOST',
  };
  public ifSearched: boolean = true;
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
        console.log(`added to fav? ${this.addedToFavorites.toString()}`);
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

  public addToFavorites(): void {
    if (this.eventDetail === undefined) return;
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
