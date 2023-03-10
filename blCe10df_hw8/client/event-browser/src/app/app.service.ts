import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { EventDetailData } from './common/event-detail.interface';
import { EventInfoData } from './common/event-info.interface';
import { SearchCriteria } from './common/search-criteria.interface';
import { VenueDetailData } from './common/venue-detail.interface';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  // used by event-list component
  public eventInfoSubj$ = new Subject<EventInfoData>();
  // used by event-detail component
  public eventDetailSubj$ = new Subject<EventDetailData>();
  // used by venue-detail component
  public venueDetailSubj$ = new Subject<VenueDetailData>();
  // used by search component to determine if to show sub-component
  public ifShowSearchResult$ = new Subject<boolean>();
  public ifShowEventDetail$ = new Subject<boolean>();
  public ifShowVenueDetail$ = new Subject<boolean>();
  // prefix of Node.js backend API
  private readonly API_ROUTE = '/api';

  constructor(private readonly http: HttpClient) {}

  // called in search-box component
  public searchEvents(newSearch: SearchCriteria): void {
    const requestUrl: string = `${this.API_ROUTE}/search?
      keyword=${newSearch.keyword}
      &distance=${newSearch.distance}
      &category=${newSearch.category}
      &lng=${newSearch.lng}
      &lat=${newSearch.lat}`;
    this.http.get<EventInfoData>(requestUrl).pipe(
      tap((data: EventInfoData) => {
        console.log(data);
      }),
      (data: Observable<EventInfoData>) => {
        data.subscribe(this.eventInfoSubj$);
        this.ifShowSearchResult$.next(true);
        return data;
      },
    );
  }

  // called in event-list component
  public getEventDetail(eventId: string): void {
    const requestUrl: string = `${this.API_ROUTE}/event/${eventId}`;
    this.http.get<EventDetailData>(requestUrl).pipe(
      tap((data: EventDetailData) => {
        console.log(data);
      }),
      (data: Observable<EventDetailData>) => {
        data.subscribe(this.eventDetailSubj$);
        this.ifShowEventDetail$.next(true);
        return data;
      },
    );
  }

  // called in event-detail component
  public getVenueDetail(venueId: string): void {
    const requestUrl: string = `${this.API_ROUTE}/venue/${venueId}`;
    this.http.get<VenueDetailData>(requestUrl).pipe(
      tap((data: VenueDetailData) => {
        console.log(data);
      }),
      (data: Observable<VenueDetailData>) => {
        data.subscribe(this.venueDetailSubj$);
        this.ifShowVenueDetail$.next(true);
        return data;
      },
    );
  }
}
