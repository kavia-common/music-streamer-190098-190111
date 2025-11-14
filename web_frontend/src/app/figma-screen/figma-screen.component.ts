import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * PUBLIC_INTERFACE
 * FigmaScreenComponent
 * Renders the extracted Figma screen inside the Angular app by injecting markup from assets/spotify-1-0-3.html.
 * Ensures:
 *  - Full HTML is injected via [innerHTML] (not escaped)
 *  - Angular DomSanitizer bypass is used intentionally for this trusted asset
 *  - CSS/JS assets are loaded
 *  - Relative URLs inside the fetched HTML are rewritten to absolute /assets/... so images/styles resolve
 */
@Component({
  selector: 'app-figma-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="figma-screen-wrapper" aria-live="polite">
      <!-- The Figma HTML is injected into this container -->
      <div [innerHTML]="htmlContent" class="figma-html-container"></div>
    </div>
  `,
  styles: [`
    :host, .figma-screen-wrapper, .figma-html-container {
      display: block;
      height: 100%;
      min-height: 100vh;
      width: 100%;
    }
    /* Ensure the Angular host allows the screen to occupy full height */
    :host { background: transparent; }
  `]
})
export class FigmaScreenComponent implements OnInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);

  // PUBLIC_INTERFACE
  // Holds the sanitized HTML to be rendered into the template.
  htmlContent: SafeHtml | string = '';

  // Keep track of dynamically injected nodes to clean them up on destroy.
  private addedNodes: any[] = [];

  async ngOnInit(): Promise<void> {
    // Guard: Only run in the browser where window, document, and fetch exist.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Use globalThis to avoid linter no-undef in non-browser contexts
    const g: any = (typeof globalThis !== 'undefined') ? globalThis : undefined;
    if (!g || typeof g.fetch !== 'function') {
      // Skip runtime HTML fetch if fetch is not available (e.g., SSR)
      return;
    }

    // Inject global stylesheets so Figma classes apply.
    const css1 = this.appendStylesheet('assets/common.css');
    const css2 = this.appendStylesheet('assets/spotify-1-0-3.css');
    if (css1) this.addedNodes.push(css1);
    if (css2) this.addedNodes.push(css2);

    // Fetch and inject the Figma HTML.
    // We rewrite relative asset refs to absolute /assets/ paths so they resolve inside Angular.
    try {
      const resp = await (globalThis as any).fetch('assets/spotify-1-0-3.html', { credentials: 'same-origin' });
      if (!resp.ok) throw new Error(`Failed to load design HTML: ${resp.status}`);
      let html = await resp.text();

      // Remove the outer <html>, <head>, and <body> wrappers if present and keep inner content.
      html = this.extractBodyInnerHtml(html);

      // Rewrite relative asset paths to absolute /assets/ paths.
      html = this.rewriteAssetUrls(html);

      // Important: Ensure CSS links inside fetched HTML are effectively loaded.
      // We already injected these globally, but if any remain in markup, strip them to avoid duplicates.
      html = html.replace(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi, '');

      // Optionally add a base shim for assets (not required since we rewrote URLs)
      // Keep as documentation reference:
      // this.addBaseShim('/assets/');

      // Inject JS in browser context (ensure they are present)
      const js1 = this.appendScript('assets/app.js', false);
      const js2 = this.appendScript('assets/spotify-1-0-3.js', false);
      if (js1) this.addedNodes.push(js1);
      if (js2) this.addedNodes.push(js2);

      // Sanitize and set [innerHTML]
      this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (e) {
      // Fallback: render a minimal error to help diagnose
      console.error('Error injecting Figma HTML', e);
      this.htmlContent = `
        <div style="padding:16px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
          Failed to load Figma HTML. Check that /assets/spotify-1-0-3.html is accessible.
        </div>
      `;
    }
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Remove injected nodes to prevent duplicates on navigation.
    for (const node of this.addedNodes) {
      if (node && typeof node.remove === 'function') {
        node.remove();
      }
    }
    this.addedNodes = [];
  }

  // PUBLIC_INTERFACE
  private appendStylesheet(href: string): any {
    try {
      const head = this.doc.head || this.doc.getElementsByTagName('head')?.[0];
      if (!head) return null;
      // Avoid duplicates if already present in index.html or previous injection
      const existing = head.querySelector(`link[rel="stylesheet"][href="${href}"]`);
      if (existing) return existing;
      const link = this.doc.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'all';
      head.appendChild(link);
      return link;
    } catch {
      return null;
    }
  }

  // PUBLIC_INTERFACE
  private appendScript(src: string, defer = true): any {
    try {
      const body = this.doc.body || this.doc.getElementsByTagName('body')?.[0];
      if (!body) return null;
      // Avoid duplicates
      const existing = this.doc.querySelector(`script[src="${src}"]`);
      if (existing) return existing;
      const script = this.doc.createElement('script');
      script.src = src;
      (script as any).defer = defer;
      body.appendChild(script);
      return script;
    } catch {
      return null;
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Extracts the body content from a full HTML document string, returning only the inner markup that should be injected.
   */
  private extractBodyInnerHtml(html: string): string {
    try {
      // Fast path: if there's a body tag, extract contents
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        return bodyMatch[1];
      }
      // If no <body>, return as-is
      return html;
    } catch {
      return html;
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Rewrites relative URLs in the fetched HTML markup to absolute /assets/ paths so that images and CSS resolve.
   * - ./figmaimages/... => /assets/figmaimages/...
   * - ./common.css, ./spotify-1-0-3.css => /assets/common.css, /assets/spotify-1-0-3.css
   * - ./app.js, ./spotify-1-0-3.js => /assets/app.js, /assets/spotify-1-0-3.js
   * Also fixes any accidental "assets/..." without leading slash to "/assets/...".
   */
  private rewriteAssetUrls(html: string): string {
    let out = html;

    // Images/icons and other file references starting with ./figmaimages
    out = out.replace(/(["'\(])\.\/figmaimages\//g, '$1/assets/figmaimages/');

    // Stylesheets/scripts referenced relatively
    out = out.replace(/(["'\(])\.\/common\.css/g, '$1/assets/common.css');
    out = out.replace(/(["'\(])\.\/spotify-1-0-3\.css/g, '$1/assets/spotify-1-0-3.css');
    out = out.replace(/(["'\(])\.\/app\.js/g, '$1/assets/app.js');
    out = out.replace(/(["'\(])\.\/spotify-1-0-3\.js/g, '$1/assets/spotify-1-0-3.js');

    // Any src/href="assets/..." -> "/assets/..."
    out = out.replace(/(src|href)=["']assets\//g, '$1="/assets/');

    return out;
  }

  /**
   * PUBLIC_INTERFACE
   * Adds a <base> element pointing to /assets/ to help resolve relative paths in injected HTML.
   * Not strictly required when rewriteAssetUrls runs, so it's unused by default.
   */
  private addBaseShim(href: string): void {
    try {
      const head = this.doc.head || this.doc.getElementsByTagName('head')?.[0];
      if (!head) return;
      const existing = head.querySelector('base[data-role="assets-base-shim"]') as any;
      if (existing) return;
      const base = this.doc.createElement('base');
      base.setAttribute('data-role', 'assets-base-shim');
      base.href = href;
      head.appendChild(base);
      this.addedNodes.push(base);
    } catch {
      // noop
    }
  }
}
