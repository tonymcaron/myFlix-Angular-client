import { Component, OnInit, Input } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DirectorDialogComponent } from '../director-dialog/director-dialog.component';
import { GenreDialogComponent } from '../genre-dialog/genre-dialog.component';
import { MovieDetailsDialogComponent } from '../movie-details-dialog/movie-details-dialog.component';
import { User, Movie, Director, Genre } from '../models';

@Component({
  selector: 'app-user-profile-view',
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.scss']
})
export class UserProfileViewComponent implements OnInit {
  @Input() user: User & { Password?: string } = {} as User;
  @Input() birthday: string = '';
  favoriteMovies: Movie[] = [];
  isLoadingFavorites: boolean = true;

  constructor(
    public fetchApiData: FetchApiDataService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.getUserData();
  }

  // Display the birthday in readable format
  get displayBirthday() {
    return this.birthday;
  }
  set displayBirthday(v) {
    this.user.Birthday = v;
  }

  /** 
  * Method to fetch user data  
  */
  getUserData(): void {
    const localUser: string | null = localStorage.getItem('user');

    if (!localUser) {
      this.router.navigate(['/welcome']);
      return;
    }

    const parsedUser: User = JSON.parse(localUser);
    this.birthday = parsedUser.Birthday ? new Date(parsedUser.Birthday).toLocaleDateString() : '';

    this.getFavoriteMovies();

    this.fetchApiData.getUser().subscribe((result) => {
      this.user = result;
      delete this.user.Password;
      this.birthday = this.user.Birthday ? new Date(this.user.Birthday).toLocaleDateString() : '';
      localStorage.setItem('user', JSON.stringify(result));
      this.getFavoriteMovies();
    },
      (error) => {
        console.error('Error fetching user data: ', error);
      }
    );
  }

  /** 
  * Method to update user info
  */
  updateUser(): void {
    // Create update data object w/o password (unless a new password is set)
    const updateData: Partial<User> & { Password?: string } = {
      Username: this.user.Username,
      Email: this.user.Email,
      Birthday: this.user.Birthday,
      FavoriteMovies: this.user.FavoriteMovies
    };

    // Only include passwork if it has been changed
    if (this.user.Password && this.user.Password.trim() !== '') {
      updateData.Password = this.user.Password;
    }

    this.fetchApiData.editUser(updateData).subscribe(
      (result) => {
        this.snackBar.open('Update successful', 'OK', {
          duration: 5000,
        });
        // Merge result with existing user data
        const updatedUser = { ...this.user, ...result };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.user = updatedUser;
      },
      (error) => {
        this.snackBar.open('Update failed: ' + error, 'OK', {
          duration: 5000,
        });
      }
    );
  }

  /**
  * Method to set the favorite movies array
  * @return Favorite movies of the user
  */
  getFavoriteMovies(): void {
    this.isLoadingFavorites = true;
    this.fetchApiData.getAllMovies().subscribe((resp: Movie[]) => {
      const allMovies: Movie[] = resp;
      this.favoriteMovies = allMovies.filter((movie) =>
        this.user.FavoriteMovies && this.user.FavoriteMovies.includes(movie._id)
      );
      this.isLoadingFavorites = false;
    },
      (error) => {
        console.error('Error fetching movies: ', error);
        this.isLoadingFavorites = false;
      }
    );
  }

  /**
  * Handler to remove a movie from user favorites
  * @param movieId - ID of the movie to be removed
  */
  removeFavorite(movieId: string): void {
    this.fetchApiData.deleteFavoriteMovie(movieId).subscribe(
      (_result) => {
        // Update local state
        this.favoriteMovies = this.favoriteMovies.filter((m) => m._id !== movieId);
        this.user.FavoriteMovies = this.user.FavoriteMovies.filter((id) => id !== movieId);
        localStorage.setItem('user', JSON.stringify(this.user));
        this.snackBar.open('Movie removed from favorites', 'OK', {
          duration: 2000,
        });
      },
      (error) => {
        this.snackBar.open('Failed to remove movie from favorites: ' + error.message, 'OK', {
          duration: 2000
        });
      }
    );
  }

  /** 
  * Method top open dialog with director info
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
  * Method to open dialog with movie details
  * @param movie - Movie info object
  */
  openMovieDetailsDialog(movie: Movie): void {
    this.dialog.open(MovieDetailsDialogComponent, {
      width: '400px',
      data: movie,
    });
  }

}
