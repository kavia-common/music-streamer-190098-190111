import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

/**
 * PUBLIC_INTERFACE
 * FigmaScreenComponent
 * This component renders the extracted Figma screen (spotify-1-0-3) inside the Angular app.
 * It safely injects the HTML structure, loads the required CSS from assets, and initializes the JS.
 * Assets are referenced from the root /assets path to ensure correctness across environments.
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
    :host { background: #000; }
  `]
})
export class FigmaScreenComponent implements OnInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  // PUBLIC_INTERFACE
  // Core HTML content for the screen. All assets use absolute /assets paths to ensure they
  // resolve correctly regardless of the current router URL.
  htmlContent = `
  <div id="screen" role="application" aria-label="Spotify home layout">
    <img id="root-bg" src="/assets/figmaimages/figma_image_0_3_4c041435.png" alt="" aria-hidden="true">

    <!-- Sidebar -->
    <aside id="sidebar" class="style-2-bg" aria-label="Primary navigation">
      <a href="#" class="logo brand-logo-link" aria-label="Spotify home">
        <img
          class="brand-logo"
          src="/assets/figmaimages/figma_image_0_3.png"
          alt="Spotify"
          width="131"
          height="40"
          loading="eager"
          decoding="async"
        >
      </a>

      <nav class="nav" aria-label="Main">
        <button id="nav-home" class="item style-165-navitem" type="button" aria-current="page">
          <img class="icon" alt="" src="/assets/figmaimages/figma_image_0_150_dfe9f153.svg" width="20" height="21" loading="lazy">
          <span class="typo-316 style-4-text">Home</span>
        </button>
        <button id="nav-search" class="item style-165-navitem" type="button">
          <img class="icon" alt="" src="/assets/figmaimages/figma_image_0_156_f3418fc8.svg" width="21" height="21" loading="lazy">
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
            <img class="icon" alt="" src="/assets/figmaimages/figma_image_0_172_5db8df1c.svg" width="11" height="11" loading="lazy">
          </span>
        </button>
        <button class="row style-37-row" type="button">
          <span class="typo-316 style-4-text">Liked Songs</span>
          <span class="icon-wrap" aria-hidden="true">
            <img class="icon" alt="" src="/assets/figmaimages/figma_image_0_179_f17b253f.svg" width="12" height="11" loading="lazy">
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
        <img class="icon" alt="" src="/assets/figmaimages/figma_image_0_198_e5e3c5fe.svg" width="16" height="16" loading="lazy">
        <span class="typo-321 style-4-text">English</span>
      </button>
    </aside>

    <!-- Header -->
    <header id="header" class="style-2-bg" role="banner" aria-label="Top bar">
      <a href="#" class="header-brand brand-logo-link" aria-label="Spotify home">
        <img
          class="brand-logo"
          src="/assets/figmaimages/figma_image_0_3.png"
          alt="Spotify"
          width="88"
          height="28"
          loading="lazy"
          decoding="async"
        >
      </a>
      <div class="nav-arrows" role="group" aria-label="History navigation">
        <button class="circle-btn" type="button" aria-label="Go back">
          <img class="icon" src="/assets/figmaimages/figma_image_0_9_d39f66c1.svg" alt="" width="9" height="16" loading="lazy">
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
                <img src="/assets/figmaimages/figma_image_0_48_141caf28.png" alt="Peaceful Piano cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Peaceful Piano</h3>
              <p class="desc typo-313 style-18-text">Relax and indulge with beautiful piano pieces</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="/assets/figmaimages/figma_image_0_57_167612ff.png" alt="Deep Focus cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Deep Focus</h3>
              <p class="desc typo-313 style-18-text">Keep calm and focus with ambient and post-rock music.</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="/assets/figmaimages/figma_image_0_66_3cdc49a7.png" alt="Instrumental Study cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Instrumental Study</h3>
              <p class="desc typo-313 style-18-text">Focus with soft study music in the background.</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="/assets/figmaimages/figma_image_0_75_343a17da.png" alt="Jazz Vibes cover art" loading="lazy">
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
                <img src="/assets/figmaimages/figma_image_0_99_9026a9ed.png" alt="Today's Top Hits cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">Today's Top Hits</h3>
              <p class="desc typo-313 style-18-text">Ed Sheeran is on top of the Hottest 50!</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="/assets/figmaimages/figma_image_0_108_b185b849.png" alt="RapCaviar cover art" loading="lazy">
              </div>
              <h3 class="title typo-312 style-4-text">RapCaviar</h3>
              <p class="desc typo-313 style-18-text">New music from Roddy Ricch, Kodak Black, NLE Choppa and BIA.</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="/assets/figmaimages/figma_image_0_117_036fe14c.png" alt="All Out 2010s cover art" loading="lazy">
              </div>
              <h3 class="title typo-315 style-4-text">All Out 2010s</h3>
              <p class="desc typo-313 style-18-text">The biggest songs of the 2010s.</p>
            </article>

            <article class="card style-153-card" role="listitem">
              <div class="cover style-155-image">
                <img src="/assets/figmaimages/figma_image_0_135_623b0d88.png" alt="Chill Hits cover art" loading="lazy">
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
  `;

  // Keep track of dynamically injected nodes to clean them up on destroy.
  private addedNodes: any[] = [];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Inject global stylesheets so Figma classes apply.
    const css1 = this.appendStylesheet('/assets/common.css');
    const css2 = this.appendStylesheet('/assets/spotify-1-0-3.css');
    if (css1) this.addedNodes.push(css1);
    if (css2) this.addedNodes.push(css2);

    // Inject JS in browser context.
    const js1 = this.appendScript('/assets/app.js', false);
    const js2 = this.appendScript('/assets/spotify-1-0-3.js', false);
    if (js1) this.addedNodes.push(js1);
    if (js2) this.addedNodes.push(js2);
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
      const script = this.doc.createElement('script');
      script.src = src;
      (script as any).defer = defer;
      body.appendChild(script);
      return script;
    } catch {
      return null;
    }
  }
}
