import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { GOOGLE_GEOCODING_API_KEY, IPINFO_API_KEY } from 'src/app/api.keys';
import { AppService } from 'src/app/app.service';
import { SearchCriteria } from 'src/app/common/search-criteria.interface';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css'],
})
export class SearchBoxComponent {
  public ifDetectLocation: boolean = false;
  public location: string = '';
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
          this.newSearch.lng = parseFloat(coords[0]);
          this.newSearch.lat = parseFloat(coords[1]);
          this.service.searchEvents(this.newSearch);
        });
      } else {
        const requestUrl: string = `https://maps.googleapis.com/maps/api/geocode
          /json?address=${this.location}&key=${GOOGLE_GEOCODING_API_KEY}`;
        this.http.get(requestUrl).subscribe((data: any) => {
          const coords = data.results[0].geometry.location;
          this.newSearch.lng = coords.lng;
          this.newSearch.lat = coords.lat;
          this.service.searchEvents(this.newSearch);
        });
      }
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
  }
}
