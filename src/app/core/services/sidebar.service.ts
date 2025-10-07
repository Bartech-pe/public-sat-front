import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private sidebarVisible = new BehaviorSubject<boolean>(true);
  sidebarVisible$ = this.sidebarVisible.asObservable();

  toggleSidebar() {
    this.sidebarVisible.next(!this.sidebarVisible.value);
  }

  openSidebar() {
    this.sidebarVisible.next(true);
  }

  closeSidebar() {
    this.sidebarVisible.next(false);
  }

  isSidebarVisible(): boolean {
    return this.sidebarVisible.value;
  }

}
