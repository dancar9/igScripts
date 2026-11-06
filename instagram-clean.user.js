
 // ==UserScript==
 // @name         Instagram Clean
 // @version      2.1
 // @description  Hides Reels, suggested posts and ads on Instagram Web. DOM-only, no network access.
 // @match        https://www.instagram.com/*
 // @match        https://m.instagram.com/*
 // @run-at       document-start
 // @grant        none
 // @noframes
 // ==/UserScript==

 (() => {
   'use strict';

   const CONFIG = {
     reels: true,
     suggested: true,
     ads: true
   };

   const LABELS = {
     ads: /^(sponsored|patrocinado|patrocinada|publicidad|advertisement|paid partnership|colaboración pagada)$/i,
     suggested: /^(suggested for you|suggested posts?|recommended for you|because you follow .+|sugerencias para ti|sugerido para ti|sugerida para ti|publicaciones sugeridas|recomendado para ti|porque sigues a .+)$/i
   };

   const HIDDEN = 'data-ig-clean-hidden';

   const LOADER_ID = 'ig-clean-loader';
   const LOADER_MAX_MS = 5000; // fail-safe: never block the page longer
   const LOADER_SETTLE_MS = 250;

   const css = document.createElement('style');
   css.textContent = `
     [${HIDDEN}] { display: none !important; }
     a[href="/reels/"], a[href^="/reels/?"] {
       display: none !important;
     }
     #${LOADER_ID} {
       position: fixed; inset: 0; z-index: 2147483647;
       display: flex; align-items: center; justify-content: center;
       background: #fff; transition: opacity .2s;
     }
     #${LOADER_ID}.done { opacity: 0; pointer-events: none; }
     #${LOADER_ID} i {
       width: 32px; height: 32px; border-radius: 50%;
       border: 3px solid #ccc; border-top-color: #555;
       animation: ig-clean-spin .8s linear infinite;
     }
     @keyframes ig-clean-spin { to { transform: rotate(360deg); } }
     @media (prefers-color-scheme: dark) {
       #${LOADER_ID} { background: #000; }
       #${LOADER_ID} i { border-color: #444; border-top-color: #ddd; }
     }
     @media (prefers-reduced-motion: reduce) {
       #${LOADER_ID} i { animation-duration: 3s; }
     }
   `;
   document.documentElement.appendChild(css);

   // Cover the page until the first filtering pass is done, so
   // Reels/ads/suggestions never flash on screen.
   const loader = document.createElement('div');
   loader.id = LOADER_ID;
   loader.setAttribute('role', 'status');
   loader.setAttribute('aria-label', 'Loading');
   loader.appendChild(document.createElement('i'));
   document.documentElement.appendChild(loader);

   let loaderDone = false;
   function finishLoader() {
     if (loaderDone) return;
     loaderDone = true;
     loader.classList.add('done');
     setTimeout(() => loader.remove(), 300);
   }

   // Ready once the feed has posts (home) or the page has content (other
   // routes), then wait a short settle period for late-rendered labels.
   let settleTimer = 0;
   function checkLoaderReady() {
     if (loaderDone || settleTimer) return;
     const ready = location.pathname === '/'
       ? document.querySelector('article')
       : document.querySelector('main, [role="main"]');
     if (ready) settleTimer = setTimeout(() => { clean(); finishLoader(); }, LOADER_SETTLE_MS);
   }
   setTimeout(finishLoader, LOADER_MAX_MS);

   function hide(element) {
     if (element) element.setAttribute(HIDDEN, '');
   }

   function isLabel(element, pattern) {
     const text = element.textContent?.trim() || '';
     return text.length < 100 && pattern.test(text);
   }

   function hasLabel(root, pattern) {
     return [...root.querySelectorAll('span, a, div')]
       .some(el =>
         el.children.length === 0 &&
         isLabel(el, pattern)
       );
   }

   function cleanPosts() {
     if (location.pathname !== '/') return;

     document.querySelectorAll(`article:not([${HIDDEN}])`).forEach(post => {
       const header = post.querySelector('header');
       const top = header || post;

       // Anuncios
       if (CONFIG.ads &&
           hasLabel(top, LABELS.ads)) {
         hide(post);
         return;
       }

       // Publicaciones recomendadas
       if (CONFIG.suggested &&
           hasLabel(top, LABELS.suggested)) {
         hide(post);
         return;
       }

       // Reels dentro del Home
       if (CONFIG.reels &&
           post.querySelector(
             'a[href^="/reel/"], a[href^="/reels/"]'
           )) {
         hide(post);
       }
     });
   }

   function cleanNavigation() {
     if (!CONFIG.reels) return;

     document.querySelectorAll(
       'a[href="/reels/"], a[href^="/reels/?"]'
     ).forEach(link => {
       hide(link);
     });
   }

   function cleanSuggestions() {
     if (!CONFIG.suggested) return;

     document.querySelectorAll('h2, h3, h4')
       .forEach(heading => {
         if (!isLabel(heading, LABELS.suggested)) return;

         // Solo ocultar módulos pequeños, nunca el feed entero.
         const parent = heading.parentElement?.parentElement;
         if (parent &&
             !parent.querySelector('article') &&
             parent.querySelectorAll('a').length <= 15) {
           hide(parent);
         }
       });
   }

   function clean() {
     guardRoute();
     cleanNavigation();
     cleanPosts();
     cleanSuggestions();
   }

   // Impedir abrir el feed infinito de Reels.
   document.addEventListener('click', event => {
     if (!CONFIG.reels) return;

     const target = event.target;
     const link = target instanceof Element ? target.closest('a[href]') : null;
     if (link && link.origin === location.origin && isReelsFeed(link.pathname)) {
       event.preventDefault();
       event.stopImmediatePropagation();
     }
   }, true);

   // Block the infinite feed (/reels/ and /reels/<id>/), allow single /reel/<id>/.
   function isReelsFeed(path) {
     return /^\/reels(?:\/|$)/.test(path);
   }

   // Single-page app: no history API overrides; guard runs on popstate and on
   // every DOM mutation batch (route changes re-render the page).
   function guardRoute() {
     if (CONFIG.reels && isReelsFeed(location.pathname)) {
       location.replace('/');
     }
   }

   addEventListener('popstate', guardRoute);

   let pending = false;

   new MutationObserver(() => {
     if (pending) return;
     pending = true;

     requestAnimationFrame(() => {
       pending = false;
       clean();
       checkLoaderReady();
     });
   }).observe(document.documentElement, {
     childList: true,
     subtree: true
   });

   clean();
   checkLoaderReady();
 })();
