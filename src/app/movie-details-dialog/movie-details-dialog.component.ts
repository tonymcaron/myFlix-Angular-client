import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Movie } from '../models';

@Component({
  selector: 'app-movie-details-dialog',
  templateUrl: './movie-details-dialog.component.html',
  styleUrls: ['./movie-details-dialog.component.scss']
})
export class MovieDetailsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<MovieDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public movie: Movie
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
