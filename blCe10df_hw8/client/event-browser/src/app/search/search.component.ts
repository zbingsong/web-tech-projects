import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit, OnDestroy {
  public ifShowSearchResult: boolean = false;
  public ifShowEventDetail: boolean = false;
  public ifShowVenueDetail: boolean = false;
  private readonly subscription: Subscription = new Subscription();

  constructor(private readonly service: AppService) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.service.ifShowSearchResult$.subscribe((data: boolean) => {
        this.ifShowSearchResult = data;
      }),
    );
    this.subscription.add(
      this.service.ifShowEventDetail$.subscribe((data: boolean) => {
        this.ifShowEventDetail = data;
      }),
    );
    this.subscription.add(
      this.service.ifShowVenueDetail$.subscribe((data: boolean) => {
        this.ifShowVenueDetail = data;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
