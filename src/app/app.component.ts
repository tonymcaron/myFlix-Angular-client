import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'myFlix-Angular-client';

  isLoggedIn: boolean = false;

  constructor(public router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const user = localStorage.getItem('user');
        this.isLoggedIn = !!user;
      }
    })
  }

  /** 
  * Method to log out user
  */
  logout(): void {
    // Clear local storage
    localStorage.clear();

    // Redirect to welcome page
    this.router.navigate(['welcome']);
  }
}
