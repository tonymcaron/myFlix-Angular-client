import { Component, OnInit } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DirectorDialogComponent } from '../director-dialog/director-dialog.component';
import { GenreDialogComponent } from '../genre-dialog/genre-dialog.component';
import { MovieDetailsDialogComponent } from '../movie-details-dialog/movie-details-dialog.component';

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

  /** 
  * Method to fetch all movies
  */
  getMovies(): void {
    this.fetchApiData.getAllMovies().subscribe((resp: any) => {
      this.movies = resp;
      return this.movies;
    });
  }

  /** 
  * Check if a movie is a favorite
  * @param movieId - ID of movie to check
  * @returns True if movie is favorited, false if not favorited
  */
  isFavorite(movieId: string): boolean {
    const localUser: string | null = localStorage.getItem('user');
    if (!localUser) return false;

    const parsedUser: any = JSON.parse(localUser);
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

    const parsedUser: any = JSON.parse(localUser);
    // console.log('Current user before update: ', parsedUser); // DEBUG LOG

    // Validation for Username
    if (!parsedUser.Username) {
      this.snackBar.open('User data is invalid. Please log in again.', 'OK', {
        duration: 5000,
      });
      return;
    }

    const localFavorites: string[] = [...(parsedUser.FavoriteMovies || [])];
    // console.log('Current favorites: ', localFavorites); // DEBUG LOG
    // console.log('Movie ID to toggle: ', movieId); // DEBUG LOG


    // Determine if adding or removing favorite
    const isAdding = !localFavorites.includes(movieId);
    // console.log('Is adding? ', isAdding); // DEBUG LOG

    if (isAdding) {
      localFavorites.push(movieId);
    } else {
      const removeFavorites: number = localFavorites.findIndex((m) => m === movieId);
      localFavorites.splice(removeFavorites, 1);
    }

    // Update parsedUser object with new favorites
    const updateData = {
      Username: parsedUser.Username,
      Email: parsedUser.Email,
      Birthday: parsedUser.Birthday,
      FavoriteMovies: localFavorites
    };
    // console.log('Updated favorites array: ', localFavorites); // DEBUG LOG
    console.log('User object being sent to API: ', updateData); // DEBUG LOG

    // Send updated user data to backend
    this.fetchApiData.editUser(updateData).subscribe(
      (result) => {
        console.log('API response: ', result); // DEBUG LOG

        const updatedUser = { ...parsedUser, ...result };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.snackBar.open(
          isAdding
            ? 'Movie added to favorites'
            : 'Movie removed from favorites',
          'OK',
          { duration: 5000, }
        );
      },
      (error) => {
        console.error('Error updating favorites: ', error);
        this.snackBar.open('Could not update favorites: ' + error.message, 'OK', {
          duration: 5000,
        });
      }
    );
  }

  /** 
  * Method to open dialog with director info
  * @param director - Director info object
  */
  openDirectorDialog(director: any): void {
    this.dialog.open(DirectorDialogComponent, {
      width: '400px',
      data: director,
    });
  }

  /** 
  * Method to open dialog with genre info
  * @param genre - Genre info object
  */
  openGenreDialog(genre: any): void {
    this.dialog.open(GenreDialogComponent, {
      width: '400px',
      data: genre,
    });
  }

  /** 
  * Method to open dialog with movie details
  * @param movie - Movie info object
  */
  openMovieDetailsDialog(movie: any): void {
    this.dialog.open(MovieDetailsDialogComponent, {
      width: '400px',
      data: movie,
    });
  }
}