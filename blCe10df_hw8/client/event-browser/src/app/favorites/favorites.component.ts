import { Component, OnInit } from '@angular/core';
import { EventInfoFav } from '../common/event-info-fav.interface';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit {
  public favoriteEvents: EventInfoFav[] = [];

  public ngOnInit(): void {
    this.favoriteEvents = Object.values<string>(localStorage).map(
      (eventString: string) => JSON.parse(eventString),
    );
    // console.log(this.favoriteEvents);
  }

  public removeEvent(eventId: string): void {
    localStorage.removeItem(eventId);
    alert('Removed from favorites!');
    this.favoriteEvents = this.favoriteEvents.filter(
      (event) => event.id !== eventId,
    );
  }
}
