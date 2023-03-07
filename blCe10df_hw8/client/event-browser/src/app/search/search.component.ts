import { Component } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  public ifShowSearchResult: boolean = false;
  public ifShowEventDetail: boolean = false;
  public ifShowVenueDetail: boolean = false;

  public showSearchResult(): void {
    this.ifShowSearchResult = true;
  }
}
