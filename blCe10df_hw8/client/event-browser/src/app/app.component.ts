import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public currentRoute: string = '';
  public readonly links = [
    { title: 'Search', path: '/search' },
    { title: 'Favorites', path: '/favorites' },
  ];

  constructor(private readonly router: Router) {}

  public ngOnInit(): void {
    // eslint-disable-next-line max-len
    // https://stackoverflow.com/questions/43360625/what-is-the-easiest-way-to-get-current-route-path-name-in-angular
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url === '/' ? '/search' : event.url;
      }
    });
  }
}
