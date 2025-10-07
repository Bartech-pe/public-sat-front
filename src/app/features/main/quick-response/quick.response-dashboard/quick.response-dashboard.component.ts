import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuickResponseService } from '@services/quick-response.service';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { QuickCardComponent } from '../quick-card/quick-card.component';
import { QuickResponseDialogComponent } from '../quick-response-dialog/quick-response-dialog.component';
import { QuickResponseUpdateComponent } from '../quick-response-update/quick-response-update.component';
import { QuickResponseDeleteComponent } from '../quick-response-delete/quick-response-delete.component';
import { computed, effect } from '@angular/core';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { QuickResponseCategoryService } from '@services/quick-response-category.service';
import {
  IQuickResponseFilter,
  QuickResponseItem,
} from '@models/quick-response.model';
import {
  IQuickResponseActive,
  IQuickResponseOrder,
  QuickResponseCategoryModel,
} from '@models/quick-response-category.model';

@Component({
  selector: 'app-quick.response-dashboard',
  templateUrl: './quick.response-dashboard.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  imports: [
    ButtonSaveComponent,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    QuickCardComponent,
    QuickResponseDialogComponent,
    QuickResponseUpdateComponent,
    QuickResponseDeleteComponent,
  ],
})
export class QuickresponseDashboardComponent implements OnInit {
  constructor(
    private QuickResponseCategoryService: QuickResponseCategoryService,
    private QuickResponseService: QuickResponseService
  ) {
    effect(() => {
      const request: IQuickResponseFilter = {
        orderby: this.activeOrder(),
        categoryId: this.activeCategoryFilter(),
        status: this.activeFilter(),
        search: this.activeSearch(),
      };
      this.filter(request);
    });
  }
  quickResponseCategories = signal<QuickResponseCategoryModel[]>([
    { id: undefined, name: 'Todos' },
  ]);

  header = signal<string>('');
  activeCategoryFilter = signal<number | null>(null);
  activeSearch = signal<string>('');
  activeFilter = signal<boolean | null>(null);
  activeOrder = signal<string>('createdAt');

  quickResponseActives = signal<IQuickResponseActive[]>([
    { value: undefined, name: 'Todos' },
    { value: true, name: 'Activo' },
    { value: false, name: 'Inactivo' },
  ]);
  quickResponseOrder = signal<IQuickResponseOrder[]>([
    { value: 'createdAt', name: 'Fecha de creación' },
    { value: 'title', name: 'Titulo' },
  ]);
  items = signal<QuickResponseItem[]>([]);
  showDialog = false;
  showEdit = false;
  showDeleted = false;
  itemEdit!: QuickResponseItem;
  itemDeleted!: QuickResponseItem;

  ngOnInit() {
    this.getCategories();
  }
  getCategories() {
    this.QuickResponseCategoryService.getCategories().subscribe(
      (response: QuickResponseCategoryModel[]) => {
        const fullList = [
          { quickResponseCategoryId: null, name: 'Todos' },
          ...response,
        ];
        this.quickResponseCategories.set(fullList);
      }
    );
  }

  getQuickResponse() {
    const request: IQuickResponseFilter = {
      orderby: this.activeOrder(),
      categoryId: this.activeCategoryFilter(),
      status: this.activeFilter(),
    };
    this.QuickResponseService.getQuickResponses(request).subscribe(
      (response: QuickResponseItem[]) => {
        this.items.set(response);
      }
    );
  }
  filter(request: IQuickResponseFilter) {
    this.QuickResponseService.getQuickResponses(request).subscribe(
      (response: QuickResponseItem[]) => {
        this.items.set(response);
      }
    );
  }
  getCategoryName() {
    const element = this.quickResponseCategories().find(
      (item) => item.id == this.activeCategoryFilter()
    );
    return element?.name;
  }
  getActive() {
    const element = this.quickResponseActives().find(
      (item) => item.value == this.activeFilter()
    );
    return element?.name;
  }
  getOrder() {
    const element = this.quickResponseOrder().find(
      (item) => item.value == this.activeOrder()
    );
    return element?.name;
  }
  openEdit(item: QuickResponseItem) {
    this.header.set('editar Respuesta');
    this.showEdit = true;
    this.itemEdit = item;
  }
  openCreate() {
    this.header.set('Nueva Respuesta');
    this.showDialog = true;
  }
  openDelete(item: QuickResponseItem) {
    this.showDeleted = true;
    this.itemDeleted = item;
  }
  close() {
    this.showDialog = false;
  }
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.activeSearch.set(input.value);
  }
}
