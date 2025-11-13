import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-button-channel',
  standalone: true,
  imports: [ButtonModule, CommonModule, ImageModule],
  templateUrl: './button-channel.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class ButtonChannelComponent {
  @Input() label!: string;
  @Input() icon!: string;
  @Input() image?: string;

  @Input() textColor!: string;
  @Input() hoverColor!: string;
  @Input() gradientClass: string = '';
  @Input() backgroundColor: string = 'bg-white';

  @Input() activeBackgroundColor: string = '';
  @Input() activeTextColor?: string;
  @Input() activeHoverColor?: string;
  @Input() activeGradientClass?: string = '';

  @Input() isGradient: boolean = false;
  @Input() selected: boolean = false;

  @Output() channelSelected = new EventEmitter<void>();

  onButtonClick() {
    this.channelSelected.emit();
  }

  get currentTextColor(): string {
    return this.selected && this.activeTextColor ? this.activeTextColor : this.textColor;
  }

  get currentHoverColor(): string {
    return this.selected && this.activeHoverColor ? this.activeHoverColor : this.hoverColor;
  }
  get currentBackgroundColor(): string {
    return this.selected && this.activeBackgroundColor ? this.activeBackgroundColor : this.backgroundColor;
  }

  get currentGradientClass(): string {
    if (!this.isGradient) return '';
    return this.selected && this.activeGradientClass ? this.activeGradientClass : this.gradientClass;
  }
}
