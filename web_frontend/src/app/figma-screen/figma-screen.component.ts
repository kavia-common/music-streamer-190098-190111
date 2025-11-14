import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * PUBLIC_INTERFACE
 * FigmaScreenComponent
 * Renders the extracted Figma screen inside the Angular app by inlining the markup from assets/spotify-1-0-3.html
 * without performing any fetch. Ensures asset paths are absolute (/assets/...), and retains guarded CSS/JS injection.
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

  // Track dynamically injected nodes to clean them up on destroy.
  private addedNodes: any[] = [];

  ngOnInit(): void {
    // Inject global stylesheets so Figma classes apply, avoiding duplicates.
    if (isPlatformBrowser(this.platformId)) {
      const css1 = this.appendStylesheet('/assets/common.css') || this.appendStylesheet('assets/common.css');
      const css2 = this.appendStylesheet('/assets/spotify-1-0-3.css') || this.appendStylesheet('assets/spotify-1-0-3.css');
      if (css1) this.addedNodes.push(css1);
      if (css2) this.addedNodes.push(css2);
    }

    // Inline the HTML from assets with absolute asset paths and stripped scripts/links.
    const inlineHtml = this.rewriteAssetUrls(this.extractBodyInnerHtml(this.getSourceHtml()));
    this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(inlineHtml);

    // Append scripts after content is present and avoid duplicates
    if (isPlatformBrowser(this.platformId)) {
      const js1 = this.appendScript('/assets/app.js', false) || this.appendScript('assets/app.js', false);
      const js2 = this.appendScript('/assets/spotify-1-0-3.js', false) || this.appendScript('assets/spotify-1-0-3.js', false);
      if (js1) this.addedNodes.push(js1);
      if (js2) this.addedNodes.push(js2);
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
   * Returns the full source HTML from assets/spotify-1-0-3.html as a string constant.
   * This is embedded to avoid any runtime fetch and asset path ambiguity.
   */
  private getSourceHtml(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Spotify 1 - 0:3</title>
  <link rel="stylesheet" href="./common.css">
  <link rel="stylesheet" href="./spotify-1-0-3.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div id="screen" role="application" aria-label="Spotify home layout">
    <img id="root-bg" src="./figmaimages/figma_image_0_3_4c041435.png" alt="" aria-hidden="true">

    <!-- Sidebar -->
    <aside id="sidebar" class="style-2-bg" aria-label="Primary navigation">
      <a href="#" class="logo brand-logo-link" aria-label="Spotify home">
        <img
          class="brand-logo"
          src="./figmaimages/figma_image_0_3.png"
          alt="Spotify"
          width="131"
          height="40"
          loading="eager"
          decoding="async"
        >
      </a>

      <nav class="nav" aria-label="Main">
        <button id="nav-home" class="item style-165-navitem" type="button" aria-current="page">
          <img class="icon" alt="" src="./figmaimages/figma_image_0_150_dfe9f153.svg" width="20" height="21" loading="lazy">
          <span class="typo-316 style-4-text">Home</span>
        </button>
        <button id="nav-search" class="item style-165-navitem" type="button">
          <img class="icon" alt="" src="./figmaimages/figma_image_0_156_f3418fc8.svg" width="21" height="21" loading="lazy">
          <span class="typo-311 style-36-text">Search</span>
        </button>
        <button id="nav-library" class="item style-165-navitem" type="button">
          <span class="icon placeholder" aria-hidden="true"></span>
          <span class="typo-311 style-36-text">Your Library</span>
        </button>
      </nav>

      <div class="lists" aria-label="Quick actions">
        <button class="row style-37-row" type="button">
          <span class="typo-317 style-4-text">Create Playlist</span>
          <span class="icon-wrap" aria-hidden="true">
            <img class="icon" alt="" src="./figmaimages/figma_image_0_172_5db8df1c.svg" width="11" height="11" loading="lazy">
          </span>
        </button>
        <button class="row style-37-row" type="button">
          <span class="typo-316 style-4-text">Liked Songs</span>
          <span class="icon-wrap" aria-hidden="true">
            <img class="icon" alt="" src="./figmaimages/figma_image_0_179_f17b253f.svg" width="12" height="11" loading="lazy">
          </span>
        </button>
      </div>

      <div class="footer" aria-label="Legal links">
        <div class="footer-links">
          <a href="#" class="typo-318 style-18-text">Legal</a>
          <a href="#" class="typo-318 style-18-text">Privacy Center</a>
          <a href="#" class="typo-319 style-18-text">Privacy Policy</a>
          <a href="#" class="typo-318 style-18-text">Cookies</a>
          <a href="#" class="typo-318 style-18-text">About Ads</a>
        </div>
        <div class="footer-meta">
          <span class="typo-320 style-36-text">Cookies</span>
        </div>
      </div>

      <button class="lang style-167-chip" type="button" aria-label="Change language">
        <img class="icon" alt="" src="./figmaimages/figma_image_0_198_e5e3c5fe.svg" width="16" height="16" loading="lazy">
        <span class="typo-321 style-4-text">English</span>
      </button>
    </aside>

    <!-- Header -->
    <header id="header" class="style-2-bg" role="banner" aria-label="Top bar">
      <a href="#" class="header-brand brand-logo-link" aria-label="Spotify home">
        <img
          class="brand-logo"
          src="assets/figmaimages/figma_image_0_3.png"
          alt="Spotify"
          width="88"
          height="28"
          loading="lazy"
          decoding="async"
        >
      </a>
      <div class="nav-arrows" role="group" aria-label="History navigation">
        <button class="circle-btn" type="button" aria-label="Go back">
          <img class="icon" src="./figmaimages/figma_image_0_9_d39f66c1.svg" alt="" width="9" height="16" loading="lazy">
        </button>
        <button class="circle-btn" type="button" aria-label="Go forward" disabled></button>
      </div>
      <div class="actions">
        <a class="typo-306 style-18-text" href="#" role="button">Sign up</a>
        <a class="btn-login style-149-btn" href="#" role="button" aria-label="Log in">
          <span class="typo-307">Log in</span>
        </a>
      </div>
    </header>

    <!-- Main content -->
    <main id="main" role="main">
      <div id="featured" class="style-47-bg" aria-hidden="true"></div>

      <div id="sections">
        <!-- Section: Focus -->
        <section class="section" aria-labelledby="sec-focus">
          <div class="section-head">
            <h2 id="sec-focus" class="typo-310 style-4-text">Focus</h2>
            <a href="#" class="typo-311 style-36-text">Show all</a>
          </div>
          <div class="cards" role="list">
            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="./figmaimages/figma_image_0_48_141caf28.png" alt="Peaceful Piano cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Peaceful Piano</h3>
              <p class="desc typo-313 style-18-text">Relax and indulge with beautiful piano pieces</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="./figmaimages/figma_image_0_57_167612ff.png" alt="Deep Focus cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Deep Focus</h3>
              <p class="desc typo-313 style-18-text">Keep calm and focus with ambient and post-rock music.</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="./figmaimages/figma_image_0_66_3cdc49a7.png" alt="Instrumental Study cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Instrumental Study</h3>
              <p class="desc typo-313 style-18-text">Focus with soft study music in the background.</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="./figmaimages/figma_image_0_75_343a17da.png" alt="Jazz Vibes cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Jazz Vibes</h3>
              <p class="desc typo-313 style-18-text">The original chill instrumental beats playlist.</p>
            </article>
          </div>
        </section>

        <!-- Section: Spotify Playlists -->
        <section class="section" aria-labelledby="sec-spotify-playlists">
          <div class="section-head">
            <h2 id="sec-spotify-playlists" class="typo-314 style-4-text">Spotify Playlists</h2>
            <a href="#" class="typo-311 style-36-text">Show all</a>
          </div>
          <div class="cards" role="list">
            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="./figmaimages/figma_image_0_99_9026a9ed.png" alt="Today's Top Hits cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Today's Top Hits</h3>
              <p class="desc typo-313 style-18-text">Ed Sheeran is on top of the Hottest 50!</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="./figmaimages/figma_image_0_108_b185b849.png" alt="RapCaviar cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">RapCaviar</h3>
              <p class="desc typo-313 style-18-text">New music from Roddy Ricch, Kodak Black, NLE Choppa and BIA.</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="./figmaimages/figma_image_0_117_036fe14c.png" alt="All Out 2010s cover art" loading="lazy">
              </div>
              <h3 class="title typo-315 style-4-text">All Out 2010s</h3>
              <p class="desc typo-313 style-18-text">The biggest songs of the 2010s.</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="./figmaimages/figma_image_0_135_623b0d88.png" alt="Chill Hits cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Chill Hits</h3>
              <p class="desc typo-313 style-18-text">Kick back to the best new and recent chill hits.</p>
            </article>
          </div>
        </section>
      </div>
    </main>

    <!-- Promo bar -->
    <div id="promo" class="style-150-promo" role="region" aria-label="Sign up promotion">
      <div class="content">
        <div>
          <div class="typo-308 style-4-text">Preview of Spotify</div>
          <div class="typo-309 style-4-text">Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.</div>
        </div>
        <a class="cta" href="#" role="button" aria-label="Sign up free"><span class="typo-307">Sign up free</span></a>
      </div>
    </div>

  </div>
  <script src="./app.js"></script>

  <!-- Persistent bottom playback bar -->
  <div class="playback-bar" role="region" aria-label="Playback controls">
    <div class="pb-controls" role="group" aria-label="Primary playback controls">
      <button class="pb-btn pb-prev" type="button" aria-label="Previous track" role="button">
        <span class="pb-icon" aria-hidden="true">⏮</span>
      </button>
      <button class="pb-btn pb-play" type="button" aria-label="Play/Pause" aria-pressed="false" role="button">
        <span class="pb-icon" aria-hidden="true">▶</span>
      </button>
      <button class="pb-btn pb-next" type="button" aria-label="Next track" role="button">
        <span class="pb-icon" aria-hidden="true">⏭</span>
      </button>
    </div>

    <div class="pb-meta" aria-live="polite">
      <div class="pb-title" id="pb-title">Nothing playing</div>
      <div class="pb-times">
        <span class="pb-current" id="pb-current" aria-live="off">0:00</span>
        <input
          class="pb-scrubber"
          id="pb-scrubber"
          type="range"
          min="0"
          max="100"
          step="1"
          value="0"
          role="slider"
          aria-label="Seek"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="0"
          aria-controls="pb-title"
        />
        <span class="pb-duration" id="pb-duration" aria-live="off">0:00</span>
      </div>
    </div>
  </div>
</body>
</html>
    `;
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
   * Rewrites relative URLs in the inlined HTML markup to absolute /assets/ paths so that images and CSS resolve.
   * - ./figmaimages/... or figmaimages/... => /assets/figmaimages/...
   * - ./common.css, ./spotify-1-0-3.css => /assets/common.css, /assets/spotify-1-0-3.css
   * - ./app.js, ./spotify-1-0-3.js => /assets/app.js, /assets/spotify-1-0-3.js
   * Also fixes any accidental src/href="assets/..." to include the leading slash.
   * Removes any remaining <link rel="stylesheet"> tags to avoid duplicate injections.
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

    // Strip stylesheet links from injected HTML (we add them in a controlled way)
    out = out.replace(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi, '');

    return out;
  }
}
