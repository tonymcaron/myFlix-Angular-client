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
  originalUser: User & { Password?: string } = {} as User;

  constructor(
    public fetchApiData: FetchApiDataService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.getUserData();
  }

  // Display the birthday in date input format (YYYY-MM-DD)
  get displayBirthday(): string {
    if (!this.user.Birthday) return '';
    return this.user.Birthday.split('T')[0];
  }

  set displayBirthday(value: string) {
    if (value) {
      this.user.Birthday = value + 'T00:00:00.000Z';
    }
  }

  /**
   * Helper method to format birthday without timezone issues
   * @param dateString - ISO date string from the backend
   * @returns Formatted date string (YYY-MM-DD)
   */
  private formatBirthdayForDisplay(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }

  /** 
  * Method to fetch currently logged in user's data  
  */
  getUserData(): void {
    const localUser: string | null = localStorage.getItem('user');

    if (!localUser) {
      this.router.navigate(['/welcome']);
      return;
    }

    const parsedUser: User = JSON.parse(localUser);
    this.user = { ...parsedUser };
    this.originalUser = { ...parsedUser };
    this.birthday = this.formatBirthdayForDisplay(parsedUser.Birthday || '');

    this.fetchApiData.getUser().subscribe((result) => {
      this.user = { ...result };
      this.originalUser = { ...result };
      delete this.user.Password;
      delete this.originalUser.Password;
      this.birthday = this.formatBirthdayForDisplay(this.user.Birthday || '');
      localStorage.setItem('user', JSON.stringify(result));
      this.getFavoriteMovies();
    },
      (error) => {
        console.error('Error fetching user data: ', error);
        this.getFavoriteMovies();
      }
    );
  }

  /** 
  * Method to update user info
  */
  updateUser(): void {
    const hasChanges =
      this.user.Username !== this.originalUser.Username ||
      this.user.Email !== this.originalUser.Email ||
      this.user.Birthday !== this.originalUser.Birthday ||
      (this.user.Password && this.user.Password.trim() !== '');

    if (!hasChanges) {
      this.snackBar.open('No changes to update', 'OK', {
        duration: 3000,
      });
      return;
    }

    // Create update data object
    const updateData: any = {
      Username: this.user.Username,
      Email: this.user.Email,
      Birthday: this.user.Birthday,
      FavoriteMovies: this.user.FavoriteMovies || []
    };

    // Only include password if it has been changed
    if (this.user.Password && this.user.Password.trim() !== '') {
      updateData.Password = this.user.Password;
    }

    this.fetchApiData.editUser(updateData).subscribe(
      (result) => {
        this.snackBar.open('Profile updated successfully!', 'OK', {
          duration: 3000,
        });

        // Update user with result
        this.user = { ...result };
        this.originalUser = { ...result };
        delete this.user.Password;
        delete this.originalUser.Password;

        localStorage.setItem('user', JSON.stringify(result));
        this.birthday = this.formatBirthdayForDisplay(result.Birthday || '');

        // Clear password field after update
        this.user.Password = '';
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
      (result) => {
        // Update local state
        this.favoriteMovies = this.favoriteMovies.filter((m) => m._id !== movieId);
        this.user.FavoriteMovies = this.user.FavoriteMovies.filter((id) => id !== movieId);
        this.originalUser.FavoriteMovies = [...this.user.FavoriteMovies];

        // Update with result from API
        if (result) {
          localStorage.setItem('user', JSON.stringify(result));
          this.user = { ...this.user, ...result };
          this.originalUser = { ...this.user };
        } else {
          localStorage.setItem('user', JSON.stringify(this.user));
        }

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
