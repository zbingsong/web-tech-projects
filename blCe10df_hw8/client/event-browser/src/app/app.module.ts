import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgbModule,
  NgbNavModule,
  NgbCarouselModule,
} from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { SearchBoxComponent } from './search/search-box/search-box.component';
import { EventListComponent } from './search/event-list/event-list.component';
// eslint-disable-next-line max-len
import { EventDetailComponent } from './search/event-detail/event-detail.component';
// eslint-disable-next-line max-len
import { MapDialogComponent } from './search/event-detail/venue-dashboard/map-dialog/map-dialog.component';
// eslint-disable-next-line max-len
import { VenueDashboardComponent } from './search/event-detail/venue-dashboard/venue-dashboard.component';
// eslint-disable-next-line max-len
import { ArtistsDashboardComponent } from './search/event-detail/artists-dashboard/artists-dashboard.component';
// eslint-disable-next-line max-len
import { EventDashboardComponent } from './search/event-detail/event-dashboard/event-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    FavoritesComponent,
    SearchBoxComponent,
    EventListComponent,
    EventDetailComponent,
    MapDialogComponent,
    VenueDashboardComponent,
    ArtistsDashboardComponent,
    EventDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    NgbNavModule,
    NgbCarouselModule,
    MatAutocompleteModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    GoogleMapsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
