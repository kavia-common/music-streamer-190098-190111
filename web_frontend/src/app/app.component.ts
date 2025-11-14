import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * PUBLIC_INTERFACE
 * Root application component that hosts the router outlet.
 * The default route renders FigmaScreenComponent.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  /** PUBLIC_INTERFACE: Title for debugging */
  title = 'web_frontend is being generated';
}
