import { Component, OnInit } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})

export class MovieCardComponent implements OnInit {
  movies: any[] = [];

  constructor(
    public fetchApiData: FetchApiDataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getMovies();
  }

  getMovies(): void {
    this.fetchApiData.getAllMovies().subscribe((resp: any) => {
      this.movies = resp;
      return this.movies;
    });
  }

  // Check if a movie is a favorite
  // @param movieId - ID of movie to check
  // @returns True if movie is favorited, false if not favorited
  isFavorite(movieId: string): boolean {
    const localUser: string | null = localStorage.getItem('user');
    const parsedUser: any = localUser && JSON.parse(localUser);
    return parsedUser.FavoriteMovies.includes(movieId);
  }

  // Handler to add or remove a movie from favorites
  handleFavorite(movieId: string): void {
    const localUser: string | null = localStorage.getItem('user');
    const parsedUser: any = localUser && JSON.parse(localUser);

    const localFavorites: string[] = [...parsedUser.FavoriteMovies];
    if (!localFavorites.includes(movieId)) {
      localFavorites.push(movieId);
    } else {
      const removeFavorite: number = localFavorites.findIndex((m) => m === movieId);
      localFavorites.splice(removeFavorite, 1);
    }

    // const favoriteMovies: any = {
    //   FavoriteMovies: localFavorites,
    // };

    // Update the parsed user object with new favorites
    parsedUser.FavoriteMovies = localFavorites;

    this.fetchApiData.editUser(parsedUser).subscribe(
      (result) => {
        this.snackBar.open(
          parsedUser.FavoriteMovies.includes(movieId)
            ? 'Movie added to favorites'
            : 'Movie removed from favorites',
          'OK',
          { duration: 2000, }
        );
        localStorage.setItem('user', JSON.stringify(parsedUser));
      },
      (result) => {
        this.snackBar.open('Could not update favorites' + result, 'OK', {
          duration: 2000,
        });
      }
    )
  }

  // Method top open dialog with director info
  // @param director - Director info object
  // openDirectorDialog(director: any): void {
  //   this.dialog.open(DirectorDialogComponent, {
  //     width: '400px',
  //     data: director,
  //   });
  // }

  // Method to open dialog with genre info
  // @param genre - Genre info object
  // openGenreDialog(genre: any): void {
  //   this.dialog.open(GenreDialogComponent, {
  //     width: '400px',
  //     data: genre,
  //   });
  // }

  // Method to open dialog with movie details
  // @param movie - Movie info object
  // openMovieDetailsDialog(movie: any): void {
  //   this.dialog.open(MovieDetailsDialogComponent, {
  //     width: '400px',
  //     data: movie,
  //   });
  // }
}