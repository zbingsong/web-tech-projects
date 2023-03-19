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
  public eventDetail: EventDetail = {
    id: 'vvG1IZ9pNeVNoR',
    name: 'P!NK: Summer Carnival 2023',
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
  // eslint-disable-next-line max-len
  public artistsText: string = 'P!NK | Pat Benatar & Neil Giraldo | Grouplove | KidCutUp';
  public fbShareLink: string = '';
  public twShareLink: string = '';
  private subscription?: Subscription;

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    // console.log('event dashboard init');
    this.subscription = this.service.eventDetailSubj$.subscribe(
      (data: EventDetail) => {
        this.eventDetail = data;
        this.artistsText = data.artists
          .map((artist) => artist.name)
          .join(' | ');
        // console.log('event dashboard received event detail');
        // eslint-disable-next-line max-len
        this.fbShareLink = `https://www.facebook.com/sharer/sharer.php?u=${data.buy}&amp`;
        // eslint-disable-next-line max-len
        this.twShareLink = `https://twitter.com/intent/tweet?text=Check%20${data.name}%20on%20Ticketmaster&url=${data.buy}`;
      },
    );
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
