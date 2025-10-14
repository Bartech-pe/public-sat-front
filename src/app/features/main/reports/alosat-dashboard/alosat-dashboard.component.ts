import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alosat-dashboard',
  imports: [
    CommonModule
  ],
  templateUrl: './alosat-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlosatDashboardComponent implements OnInit {
  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  } 



}
