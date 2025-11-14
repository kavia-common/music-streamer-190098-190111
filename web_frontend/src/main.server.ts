import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * PUBLIC_INTERFACE
 * Server bootstrap entrypoint for Angular SSR.
 * Must export default a function returning Promise<ApplicationRef>, which bootstrapApplication does.
 */
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
