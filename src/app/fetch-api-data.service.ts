import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

// Declaring the api url that will provide data for the client app
const apiUrl = 'https://tonys-flix-9de78e076f9d.herokuapp.com/';
@Injectable({
  providedIn: 'root'
})

export class FetchApiDataService {
  // Inject the HttpClient module to the constructor params
  // This will provide HttpClient to the entire class, making it available via this.http
  constructor(private http: HttpClient) { }

  // Non-typed response extraction
  private extractResponseData(res: any): any {
    const body = res;
    return body || {}
  }

  /**
  * Making the api call for the user registration endpoint
  * @param userDetails
  * @returns New user
  */
  public userRegistration(userDetails: any): Observable<any> {
    console.log('Sending registration data: ', userDetails); // DEBUG LOG
    return this.http.post(apiUrl + 'users', userDetails, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
   * Making the api call for user login
   * @param userDetails
   * @returns user information
   */
  public userLogin(userDetails: any): Observable<any> {
    return this.http.post(apiUrl + 'login', userDetails, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
  * Making api call for all movies
  * @returns list of all movies
  */
  public getAllMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies', {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
   Making api call for movie details by title
  * @param title
  * @returns Requested movie object
  */
  public getMovie(title: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + `movies/${title}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
  * Making api call for director info by name
  * @param directorName
  * @returns Requested director object
  */
  public getDirector(directorName: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + `movies/directors/${directorName}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      }),
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
  * Making api call for genre info by name
  * @param genreName
  * @returns Genre info
  */
  public getGenre(genreName: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + `movies/genre/${genreName}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
  * Making api call for user info by username
  * @returns Get User
  */
  public getUser(): Observable<any> {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    const username = user ? JSON.parse(user).Username : null;

    return this.http.get(apiUrl + `users/${username}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
  * Making api call for adding movie to user favorites
  * @param title
  * @returns Add a movie to favorites
  */
  public addFavoriteMovie(MovieID: string): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return this.http.post(apiUrl + `users/${username}/movies/${MovieID}`, null, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /**
  * Making api call to delete a movie from user favorites
  * @param title
  * @returns Delete a movie from favorites
  */
  public deleteFavoriteMovie(MovieID: string): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return this.http.delete(apiUrl + `users/${username}/movies/${MovieID}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
  * Making api call to edit user info
  * @param userDetails
  * @returns Edit user
  */
  public editUser(userDetails: any): Observable<any> {
    const token = localStorage.getItem('token');
    const username = userDetails.Username;
    return this.http.put(apiUrl + `users/${username}`, userDetails, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /** 
  * Making api call to delete user
  * @returns Delete user
  */
  public deleteUser(): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return this.http.delete(apiUrl + `users/${username}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): any {
    console.error('HTTP Error: ', error); // DEBUG LOG
    console.error('Error body details: ', error.error); // DEBUG LOG

    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error: :', error.error.message);
    } else {
      console.error(
        `Backend Status code: ${error.status}, ` +
        `Backend error body is: ${error.error}`);
    }
    return throwError(() => ({
      status: error.status,
      message: error.error?.message || error.message || 'Something bad happened: please try again later.',
      error: error.error
    }));
  }
}
