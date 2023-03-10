import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public currentRoute: string = '/search';
  public readonly links = [
    { title: 'Search', path: '/search' },
    { title: 'Favorites', path: '/favorites' },
  ];
}
