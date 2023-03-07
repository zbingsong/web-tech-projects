import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { SearchBoxComponent } from './search/search-box/search-box.component';
import { EventListComponent } from './search/event-list/event-list.component';
// eslint-disable-next-line max-len
import { EventDetailComponent } from './search/event-detail/event-detail.component';
// eslint-disable-next-line max-len
import { VenueDetailComponent } from './search/venue-detail/venue-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    FavoritesComponent,
    SearchBoxComponent,
    EventListComponent,
    EventDetailComponent,
    VenueDetailComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
