import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  GOOGLE_GEOCODING_API_KEY,
  IPINFO_API_KEY,
} from 'src/app/common/api.keys';
import { AppService } from 'src/app/app.service';
import { SearchCriteria } from 'src/app/common/search-criteria.interface';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css'],
})
export class SearchBoxComponent implements OnInit {
  public ifDetectLocation: boolean = false;
  public location: string = '';
  private readonly searchTerm: Subject<string> = new Subject<string>();
  public autoCompleteOptions: string[] = [];
  public isOptionLoading: boolean = false;
  public readonly newSearch: SearchCriteria = {
    keyword: '',
    category: 'Default',
    distance: 10,
    lng: 0,
    lat: 0,
  };

  constructor(
    private readonly service: AppService,
    private readonly http: HttpClient,
  ) {}

  public ngOnInit(): void {
    this.searchTerm
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          this.isOptionLoading = true;
        }),
        switchMap((term: string) =>
          this.service.autoComplete(term).pipe(
            finalize(() => {
              this.isOptionLoading = false;
            }),
          ),
        ),
      )
      .subscribe((data: string[]) => {
        this.autoCompleteOptions = data;
      });
  }

  public changeKeyword(): void {
    this.searchTerm.next(this.newSearch.keyword);
  }

  public onSelectOption(option: string): void {
    this.newSearch.keyword = option;
  }

  public toggleLocCheckbox(): void {
    this.ifDetectLocation = !this.ifDetectLocation;
    if (this.ifDetectLocation) {
      this.location = '';
    }
  }

  public searchEvents(): void {
    try {
      if (this.ifDetectLocation) {
        const requestUrl: string = `https://ipinfo.io/?token=${IPINFO_API_KEY}`;
        this.http.get(requestUrl).subscribe((data: any) => {
          const coords = (data.loc as string).split(',');
          this.newSearch.lng = parseFloat(coords[1]);
          this.newSearch.lat = parseFloat(coords[0]);
          this.service.searchEvents(this.newSearch);
        });
      } else {
        // eslint-disable-next-line max-len
        const requestUrl: string = `https://maps.googleapis.com/maps/api/geocode/json?address=${this.location}&key=${GOOGLE_GEOCODING_API_KEY}`;
        this.http.get(requestUrl).subscribe((data: any) => {
          if (data.results.length === 0) {
            this.newSearch.lng = 200;
            this.newSearch.lat = 200;
          } else {
            const coords = data.results[0].geometry.location;
            this.newSearch.lng = coords.lng;
            this.newSearch.lat = coords.lat;
          }
          this.service.searchEvents(this.newSearch);
        });
      }
      // console.log('event searched');
    } catch (error) {
      console.error(`event search error: ${error as string}`);
    }
  }

  public resetForm(): void {
    this.ifDetectLocation = false;
    this.location = '';
    this.newSearch.keyword = '';
    this.newSearch.category = 'Default';
    this.newSearch.distance = 10;
    this.service.ifSearched$.next(false);
  }
}
