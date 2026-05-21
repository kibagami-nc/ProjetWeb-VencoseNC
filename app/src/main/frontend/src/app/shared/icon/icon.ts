import { Component, input } from '@angular/core';

export type IconName =
  | 'eye'
  | 'eye-off'
  | 'user'
  | 'user-plus'
  | 'user-circle'
  | 'mail'
  | 'list'
  | 'search'
  | 'log-out'
  | 'trash'
  | 'pencil';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styles: [':host { display: inline-flex; align-items: center; }'],
})
export class Icon {
  name = input.required<IconName>();
  size = input<number>(20);
  strokeWidth = input<number>(2);
}
