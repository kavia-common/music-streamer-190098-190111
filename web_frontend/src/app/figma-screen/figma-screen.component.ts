import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * PUBLIC_INTERFACE
 * FigmaScreenComponent
 * Renders the extracted Figma screen inside the Angular app by injecting markup from assets/spotify-1-0-3.html.
 * Hardened to avoid blank screens:
 *  - Validates fetch success and non-empty response
 *  - Provides inline fallback content if fetch fails
 *  - Uses DomSanitizer.bypassSecurityTrustHtml correctly and binds via [innerHTML]
 *  - Rewrites asset paths to valid /assets/... URLs (figmaimages, css, js)
 *  - Strips <script> tags from injected HTML to avoid unsafe inline execution
 *  - Guards against duplicate CSS/JS injection if index.html already includes them
 *  - Shows a visible error message instead of a blank screen on failures
 */
@Component({
  selector: 'app-figma-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="figma-screen-wrapper" aria-live="polite">
      <!-- The Figma HTML is injected into this container -->
      <div [innerHTML]="htmlContent" class="figma-html-container"></div>

      <!-- Accessible error fallback if content couldn't load -->
      <div *ngIf="showError" class="error-fallback" role="alert">
        <div class="error-title">We couldn't load the preview.</div>
        <div class="error-desc">Please check that the design HTML is available and try again.</div>
      </div>
    </div>
  `,
  styles: [`
    :host, .figma-screen-wrapper, .figma-html-container {
      display: block;
      height: 100%;
      min-height: 100vh;
      width: 100%;
    }
    :host { background: transparent; }

    .error-fallback {
      margin: 16px;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #fecaca;
      background: #fef2f2;
      color: #991b1b;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    }
    .error-title { font-weight: 600; margin-bottom: 4px; }
    .error-desc { font-size: 14px; opacity: 0.9; }
  `]
})
export class FigmaScreenComponent implements OnInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);

  // PUBLIC_INTERFACE
  // Holds the sanitized HTML to be rendered into the template.
  htmlContent: SafeHtml | string = '';

  // PUBLIC_INTERFACE
  // Indicates if a visible error fallback should be shown for accessibility.
  showError = false;

  // Keep track of dynamically injected nodes to clean them up on destroy.
  private addedNodes: any[] = [];

  async ngOnInit(): Promise<void> {
    // Guard: Only run in the browser where window, document, and fetch exist.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const g: any = (typeof globalThis !== 'undefined') ? globalThis : undefined;
    if (!g || typeof g.fetch !== 'function') {
      // No fetch in this environment (e.g., SSR). Show safe fallback instead of blank.
      this.showError = true;
      this.setInlineFallbackHtml();
      return;
    }

    // Inject global stylesheets so Figma classes apply, avoiding duplicates.
    const css1 = this.appendStylesheet('/assets/common.css') || this.appendStylesheet('assets/common.css');
    const css2 = this.appendStylesheet('/assets/spotify-1-0-3.css') || this.appendStylesheet('assets/spotify-1-0-3.css');
    if (css1) this.addedNodes.push(css1);
    if (css2) this.addedNodes.push(css2);

    // Fetch and inject the Figma HTML.
    try {
      const html = await this.fetchDesignHtmlWithValidation('assets/spotify-1-0-3.html');

      // Sanitize and set [innerHTML]
      this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
      this.showError = false;

      // Only append scripts after content is present and avoid duplicates
      const js1 = this.appendScript('/assets/app.js', false) || this.appendScript('assets/app.js', false);
      const js2 = this.appendScript('/assets/spotify-1-0-3.js', false) || this.appendScript('assets/spotify-1-0-3.js', false);
      if (js1) this.addedNodes.push(js1);
      if (js2) this.addedNodes.push(js2);
    } catch (e) {
      console.error('Error injecting Figma HTML', e);
      this.showError = true;
      // Fallback to inline snippet so users never see a blank screen.
      this.setInlineFallbackHtml();
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
    } catch (err) {
      console.error('appendStylesheet error', err);
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
    } catch (err) {
      console.error('appendScript error', err);
      return null;
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Extracts the body content from a full HTML document string, returning only the inner markup that should be injected.
   * Also strips any <script> tags to prevent inline execution; scripts are loaded via controlled appendScript.
   */
  private extractBodyInnerHtml(html: string): string {
    let content = html;
    try {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        content = bodyMatch[1];
      }
    } catch { /* keep original */ }

    // Strip script tags entirely for safety; we manage scripts via appendScript
    try {
      content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
    } catch { /* ignore */ }

    return content;
  }

  /**
   * PUBLIC_INTERFACE
   * Rewrites relative URLs in the fetched HTML markup to absolute /assets/ paths so that images and CSS resolve.
   * - ./figmaimages/... or figmaimages/... => /assets/figmaimages/...
   * - ./common.css, ./spotify-1-0-3.css => /assets/common.css, /assets/spotify-1-0-3.css
   * - ./app.js, ./spotify-1-0-3.js => /assets/app.js, /assets/spotify-1-0-3.js
   * Also fixes any accidental src/href="assets/..." to include the leading slash.
   * Removes any remaining <link rel="stylesheet"> and <script> tags to avoid duplicate injections.
   */
  private rewriteAssetUrls(html: string): string {
    let out = html;

    // Normalize any 'figmaimages/...' or './figmaimages/...' to '/assets/figmaimages/...'
    out = out.replace(/(["'\(])(?:\.\/)?figmaimages\//g, '$1/assets/figmaimages/');

    // Stylesheets/scripts referenced relatively
    out = out.replace(/(["'\(])\.\/common\.css/g, '$1/assets/common.css');
    out = out.replace(/(["'\(])\.\/spotify-1-0-3\.css/g, '$1/assets/spotify-1-0-3.css');
    out = out.replace(/(["'\(])\.\/app\.js/g, '$1/assets/app.js');
    out = out.replace(/(["'\(])\.\/spotify-1-0-3\.js/g, '$1/assets/spotify-1-0-3.js');

    // Any src/href="assets/..." -> "/assets/..."
    out = out.replace(/(src|href)=["']assets\//g, '$1="/assets/');

    // Strip stylesheet links and scripts from injected HTML (we add them in a controlled way)
    out = out.replace(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi, '');
    out = out.replace(/<script[\s\S]*?<\/script>/gi, '');

    return out;
    }

  /**
   * PUBLIC_INTERFACE
   * Fetches the design HTML, validates response, rewrites URLs, and returns the final HTML string.
   * Throws on errors so the caller can show a visible fallback UI instead of a blank screen.
   */
  private async fetchDesignHtmlWithValidation(url: string): Promise<string> {
    const resp = await (globalThis as any).fetch(url, { credentials: 'same-origin' }).catch((err: any) => {
      console.error('Fetch failed for design HTML:', err);
      throw err;
    });
    if (!resp || !resp.ok) {
      const status = resp ? `${resp.status} ${resp.statusText || ''}`.trim() : 'no-response';
      throw new Error(`Failed to load design HTML: ${status}`);
    }
    let html = await resp.text();
    if (!html || !html.trim()) {
      throw new Error('Design HTML is empty');
    }

    // Extract body content and rewrite asset URLs
    html = this.extractBodyInnerHtml(html);
    html = this.rewriteAssetUrls(html);

    // Final sanity check: ensure we have a minimal root (#screen) or any content
    if (!/#screen\b/.test(html) && html.trim().length < 32) {
      console.warn('Design HTML did not contain expected #screen root; injecting nonetheless.');
    }
    return html;
  }

  /**
   * PUBLIC_INTERFACE
   * Provides a minimal inline fallback UI to ensure the app doesn't render a blank page.
   */
  private setInlineFallbackHtml(): void {
    const fallback = `
      <div id="screen" style="position:relative;min-height:60vh;padding:24px;background:#f9fafb;color:#111827;">
        <h1 style="font:600 20px/1.3 Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin-bottom:8px;">
          Spotify UI preview unavailable
        </h1>
        <p style="font:400 14px/1.6 Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;">
          We couldn't load the preview HTML. Please verify that:
        </p>
        <ul style="margin-top:8px;padding-left:18px;font:400 14px/1.6 Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
          <li><code>/assets/spotify-1-0-3.html</code> is accessible</li>
          <li>Images exist under <code>/assets/figmaimages/</code></li>
          <li>Stylesheets <code>assets/common.css</code> and <code>assets/spotify-1-0-3.css</code> are present</li>
        </ul>
      </div>
    `;
    this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(fallback);
  }
}
