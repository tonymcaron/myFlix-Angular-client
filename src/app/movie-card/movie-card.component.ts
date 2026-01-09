import { Component, OnInit } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DirectorDialogComponent } from '../director-dialog/director-dialog.component';
import { GenreDialogComponent } from '../genre-dialog/genre-dialog.component';
import { MovieDetailsDialogComponent } from '../movie-details-dialog/movie-details-dialog.component';
import { Movie, Director, Genre, User } from '../models';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent implements OnInit {
  movies: Movie[] = [];
  isLoading: boolean = true;

  constructor(
    public fetchApiData: FetchApiDataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getMovies();
  }

  /**
   * Method to fetch all movies
   */
  getMovies(): void {
    this.isLoading = true;
    this.fetchApiData.getAllMovies().subscribe(
      (resp: Movie[]) => {
        this.movies = resp;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching movies: ', error);
        this.isLoading = false;
      }
    );
  }

  /**
   * Check if a movie is a favorite
   * @param movieId - ID of movie to check
   * @returns True if movie is favorited, false if not favorited
   */
  isFavorite(movieId: string): boolean {
    const localUser: string | null = localStorage.getItem('user');
    if (!localUser) return false;

    const parsedUser: User = JSON.parse(localUser);
    return parsedUser.FavoriteMovies?.includes(movieId) || false;
  }

  /**
   * Handler to add or remove a movie from favorites
   * @param movieId - ID of the movie to be added or removed
   */
  handleFavorite(movieId: string): void {
    const localUser: string | null = localStorage.getItem('user');

    // User validation
    if (!localUser) {
      this.snackBar.open('Please log in to add a favorite', 'OK', {
        duration: 5000,
      });
      return;
    }

    const parsedUser: User = JSON.parse(localUser);

    // Validation for Username
    if (!parsedUser.Username) {
      this.snackBar.open('User data is invalid. Please log in again.', 'OK', {
        duration: 5000,
      });
      return;
    }

    // Determine if adding or removing favorite
    const isCurrentlyFavorite = (parsedUser.FavoriteMovies || []).includes(movieId);

    if (isCurrentlyFavorite) {
      // Remove from favorites
      this.fetchApiData.deleteFavoriteMovie(movieId).subscribe(
        (result) => {
          // Update localStorage - remove movieId from FavoriteMovies
          const updatedFavorites = (parsedUser.FavoriteMovies || []).filter(
            (id: string) => id !== movieId
          );
          parsedUser.FavoriteMovies = updatedFavorites;
          localStorage.setItem('user', JSON.stringify(parsedUser));
          this.snackBar.open('Movie removed from favorites', 'OK', {
            duration: 3000,
          });
        },
        (error) => {
          console.error('Error removing favorite: ', error);
          this.snackBar.open('Could not remove favorite: ' + error.message, 'OK', {
            duration: 5000,
          });
        }
      );
    } else {
      // Add to favorites
      this.fetchApiData.addFavoriteMovie(movieId).subscribe(
        (_result) => {
          // Update localStorage - add movieId to FavoriteMovies
          const updatedFavorites = [...(parsedUser.FavoriteMovies || []), movieId];
          parsedUser.FavoriteMovies = updatedFavorites;
          localStorage.setItem('user', JSON.stringify(parsedUser));
          this.snackBar.open('Movie added to favorites', 'OK', {
            duration: 3000,
          });
        },
        (error) => {
          console.error('Error adding favorite: ', error);
          this.snackBar.open('Could not add favorite: ' + error.message, 'OK', {
            duration: 5000,
          });
        }
      );
    }
  }

  /**
   * Method to open dialog with director info
   * @param director - Director info object
   */
  openDirectorDialog(director: Director): void {
    this.dialog.open(DirectorDialogComponent, {
      width: '400px',
      data: director,
    });
  }

  /**
   * Method to open dialog with genre info
   * @param genre - Genre info object
   */
  openGenreDialog(genre: Genre): void {
    this.dialog.open(GenreDialogComponent, {
      width: '400px',
      data: genre,
    });
  }

  /**
   * Method to open dialog with individual movie details
   * @param movie - Movie info object
   */
  openMovieDetailsDialog(movie: Movie): void {
    this.dialog.open(MovieDetailsDialogComponent, {
      width: '400px',
      data: movie,
    });
  }
}
