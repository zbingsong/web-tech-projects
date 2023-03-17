import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, Subject } from 'rxjs';
import { ArtistDetail } from './common/artist-detail.interface';
import { EventDetail } from './common/event-detail.interface';
import { EventInfo } from './common/event-info.interface';
import { SearchCriteria } from './common/search-criteria.interface';
import { VenueDetail } from './common/venue-detail.interface';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  // used by event-list component
  public eventInfoSubj$ = new Subject<EventInfo[]>();
  // used by event-detail component
  public eventDetailSubj$ = new Subject<EventDetail>();
  // used by event-detail component
  public artistDetailSubj$ = new Subject<ArtistDetail>();
  public artistAlbumsSubj$ = new Subject<string[]>();
  // used by venue-detail component
  public venueDetailSubj$ = new Subject<VenueDetail>();
  // prefix of Node.js backend API
  private readonly API_ROUTE = 'http://localhost:8081/api';
  // for selectively displaying components
  public ifSearched$ = new Subject<boolean>();
  public ifResultList$ = new Subject<boolean>();

  constructor(private readonly http: HttpClient) {}

  public autoComplete(keyword: string): Observable<string[]> {
    keyword = keyword.trim();
    if (keyword === '') return of([]);
    const requestUrl: string = `${this.API_ROUTE}/suggest?keyword=${keyword}`;
    return this.http.get<string[]>(requestUrl).pipe(
      catchError((error: any) => {
        console.log('service auto complete error');
        console.log(error);
        return of([]);
      }),
    );
  }

  // called in search-box component
  public searchEvents(newSearch: SearchCriteria): void {
    const requestUrl: string = `${this.API_ROUTE}/search?
      keyword=${newSearch.keyword}
      &distance=${newSearch.distance}
      &category=${newSearch.category}
      &lng=${newSearch.lng}
      &lat=${newSearch.lat}`;
    this.http.get<EventInfo[]>(requestUrl).subscribe({
      next: (data: EventInfo[]) => {
        this.eventInfoSubj$.next(data);
        // console.log(data);
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  // called in event-list component
  public getEventDetail(eventId: string): void {
    const requestUrl: string = `${this.API_ROUTE}/event/${eventId}`;
    this.http.get<EventDetail>(requestUrl).subscribe({
      next: (data: EventDetail) => {
        this.eventDetailSubj$.next(data);
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  public getArtistDetail(
    artistName: string,
  ): Observable<ArtistDetail | { id: string }> {
    const requestUrl: string = `${this.API_ROUTE}/artist?keyword=${artistName}`;
    return this.http.get<ArtistDetail | { id: string }>(requestUrl);
  }

  // called in event-detail component
  public getVenueDetail(venueId: string): void {
    const requestUrl: string = `${this.API_ROUTE}/venue/${venueId}`;
    this.http.get<VenueDetail>(requestUrl).subscribe({
      next: (data: VenueDetail) => {
        this.venueDetailSubj$.next(data);
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }
}
