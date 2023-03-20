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
  // prefix of Node.js backend API
  private readonly API_ROUTE = '/api';
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
        console.log(error);
        return of([]);
      }),
    );
  }

  // called in search-box component
  public searchEvents(newSearch: SearchCriteria): void {
    if (newSearch.lng > 180) {
      this.eventInfoSubj$.next([]);
      this.ifSearched$.next(true);
      this.ifResultList$.next(true);
      return;
    }
    // eslint-disable-next-line max-len, prettier/prettier
    const requestUrl: string = `${this.API_ROUTE}/search?keyword=${encodeURIComponent(newSearch.keyword)}&distance=${newSearch.distance}&category=${newSearch.category}&lng=${newSearch.lng}&lat=${newSearch.lat}`;
    this.http.get<EventInfo[]>(requestUrl).subscribe({
      next: (data: EventInfo[]) => {
        this.eventInfoSubj$.next(data);
        this.ifSearched$.next(true);
        this.ifResultList$.next(true);
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
        this.ifResultList$.next(false);
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  // called in event-detail component
  public getArtistDetail(
    artistName: string,
  ): Observable<ArtistDetail | { id: string }> {
    // eslint-disable-next-line max-len, prettier/prettier
    const requestUrl: string = `${this.API_ROUTE}/artist?keyword=${encodeURIComponent(artistName)}`;
    return this.http.get<ArtistDetail | { id: string }>(requestUrl).pipe(
      catchError((error: any) => {
        console.log(error);
        return of({ id: '' });
      }),
    );
  }

  // called in event-detail component
  public getVenueDetail(venueId: string): Observable<VenueDetail> {
    const requestUrl: string = `${this.API_ROUTE}/venue/${venueId}`;
    return this.http.get<VenueDetail>(requestUrl);
  }
}
