import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DeleteConfirmData {
  name: string;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete employee</h2>
    <mat-dialog-content>
      <p class="mb-0">Remove <strong>{{ data.name }}</strong>? This cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" type="button" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialogComponent {
  readonly data = inject<DeleteConfirmData>(MAT_DIALOG_DATA);
}
