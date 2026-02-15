import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    color?: 'primary' | 'accent' | 'warn';
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
    <h2 mat-dialog-title class="text-slate-800 font-bold">{{ data.title }}</h2>
    <mat-dialog-content class="text-slate-600 my-4">
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <button mat-button (click)="onCancel()" class="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button 
        mat-flat-button 
        [color]="data.color || 'primary'" 
        (click)="onConfirm()" 
        class="px-4 py-2 font-semibold rounded-lg shadow-sm transition-all"
      >
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
  `]
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) { }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
}
