import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login-form',
  templateUrl: './user-login-form.component.html',
  styleUrls: ['./user-login-form.component.scss'],
})
export class UserLoginFormComponent implements OnInit {
  @Input() userData = { Username: '', Password: '' };

  constructor(
    public fetchApiData: FetchApiDataService,
    public dialogRef: MatDialogRef<UserLoginFormComponent>,
    public snackBar: MatSnackBar,
    public router: Router
  ) {}

  ngOnInit(): void {}

  /**
   * Function responsible for sending the form inputs to the backend
   */
  userLogin(): void {
    // DEBUGGING LOG
    console.log('Attempting login with user data: ', this.userData);

    this.fetchApiData.userLogin(this.userData).subscribe(
      (result) => {
        // DEBUGGING LOG
        console.log('Login response: ', result);

        const user = result.user || result.User || result;
        const token: string | undefined = result.token || result.Token;

        if (!user || !token) {
          this.snackBar.open('Invalid login response from server', 'OK', {
            duration: 5000,
          });
          console.error('Invalid response format: ', result);
        }

        // Logic for successful user login goes here!
        localStorage.setItem('user', JSON.stringify(user));
        !!token && localStorage.setItem('token', token);

        this.dialogRef.close();
        this.snackBar.open('Login successful!', 'OK', {
          duration: 5000,
        });
        this.router.navigate(['movies']);
      },
      (error) => {
        console.error('Full login error: ', error); // DEBUG: see full error
        console.error('Error status: ', error.status); // DEBUG: status code
        console.error('Error body: ', error.error); // DEBUG: error message from API

        this.snackBar.open(
          'Login failed: ' +
            (error.error?.message || error.message || 'Please try again later'),
          'OK',
          {
            duration: 5000,
          }
        );
      }
    );
  }
}
