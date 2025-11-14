import { Routes } from '@angular/router';
import { FigmaScreenComponent } from './figma-screen/figma-screen.component';

/**
 * PUBLIC_INTERFACE
 * Root application routes.
 * Maps the root path to the Figma screen integration component.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: FigmaScreenComponent
  },
  // Fallback to root
  { path: '**', redirectTo: '' }
];
