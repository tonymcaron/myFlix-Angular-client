import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-genre-dialog',
  templateUrl: './genre-dialog.component.html',
  styleUrls: ['./genre-dialog.component.scss']
})
export class GenreDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<GenreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public genre: any
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
