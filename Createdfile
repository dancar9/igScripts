
 // ==UserScript==
 // @name         Instagram Clean
 // @version      2.0
 // @match        https://www.instagram.com/*
 // @match        https://m.instagram.com/*
 // @run-at       document-idle
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

   const css = document.createElement('style');
   css.textContent = `
     [${HIDDEN}] { display: none !important; }
     a[href="/reels/"], a[href^="/reels/?"] {
       display: none !important;
     }
   `;
   document.documentElement.appendChild(css);

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

     document.querySelectorAll('article').forEach(post => {
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
     cleanNavigation();
     cleanPosts();
     cleanSuggestions();
   }

   // Impedir abrir el feed infinito de Reels.
   document.addEventListener('click', event => {
     if (!CONFIG.reels) return;

     const link = event.target.closest?.('a[href]');
     if (link &&
         /^\/reels(?:\/|$)/.test(new URL(link.href).pathname)) {
       event.preventDefault();
       event.stopImmediatePropagation();
     }
   }, true);

   let pending = false;

   new MutationObserver(() => {
     if (pending) return;
     pending = true;

     requestAnimationFrame(() => {
       pending = false;
       clean();
     });
   }).observe(document.documentElement, {
     childList: true,
     subtree: true
   });

   clean();
 })();
