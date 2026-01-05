import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-director-dialog',
  templateUrl: './director-dialog.component.html',
  styleUrls: ['./director-dialog.component.scss']
})
export class DirectorDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DirectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public director: any
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
