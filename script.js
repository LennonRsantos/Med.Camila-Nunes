document.addEventListener('DOMContentLoaded', () => {
  // Dynamic year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const header = document.getElementById('top-nav');
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  // Mobile menu
  if (header && menuBtn && navLinks) {
    const setMenu = (open) => {
      header.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };
    const isOpen = () => header.classList.contains('is-open');

    menuBtn.addEventListener('click', () => setMenu(!isOpen()));

    // Close when clicking nav items
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    // Close with Escape or a click outside the header
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen() && !header.contains(e.target)) {
        setMenu(false);
      }
    });

    // Reset when the desktop navigation takes over
    window.matchMedia('(min-width: 1080px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  // Plan lists: accordion on mobile, always open on wider screens for comparison
  const planDetails = [...document.querySelectorAll('.plan-details')];
  const wideQuery = window.matchMedia('(min-width: 720px)');
  const syncPlanDetails = () => {
    planDetails.forEach((details) => {
      details.open = wideQuery.matches;
      const summary = details.querySelector('summary');
      if (wideQuery.matches) summary.setAttribute('tabindex', '-1');
      else summary.removeAttribute('tabindex');
    });
  };
  planDetails.forEach((details) => {
    details.querySelector('summary').addEventListener('click', (e) => {
      if (wideQuery.matches) e.preventDefault();
    });
  });
  syncPlanDetails();
  wideQuery.addEventListener('change', syncPlanDetails);

  // Phones: the plan cards sit side by side at equal height, so their lists open and close together
  planDetails.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (wideQuery.matches) return;
      planDetails.forEach((other) => {
        if (other.open !== details.open) other.open = details.open;
      });
    });
  });

  // Swipe rails (phones only): region semantics on the track + position dots below it
  const rails = [...document.querySelectorAll('[data-rail]')];
  const railQuery = window.matchMedia('(max-width: 719.98px)');
  const railScroll = window.matchMedia('(prefers-reduced-motion: no-preference)').matches ? 'smooth' : 'auto';

  const syncRails = () => {
    rails.forEach((rail) => {
      if (railQuery.matches) {
        // Lists keep their list role; other tracks become labelled regions
        if (!['UL', 'OL'].includes(rail.tagName)) rail.setAttribute('role', 'region');
        rail.setAttribute('aria-labelledby', rail.dataset.railLabel);
        rail.tabIndex = 0;
      } else {
        rail.removeAttribute('role');
        rail.removeAttribute('aria-labelledby');
        rail.removeAttribute('tabindex');
      }
    });
  };

  rails.forEach((rail) => {
    const cards = [...rail.children];
    const startOf = () => rail.scrollLeft + parseFloat(getComputedStyle(rail).paddingLeft);

    // Dots are a visual aid only; the track itself is scrollable by touch and keyboard
    const dots = document.createElement('div');
    dots.className = 'rail-dots';
    dots.setAttribute('aria-hidden', 'true');
    cards.forEach((card) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.tabIndex = -1;
      dot.addEventListener('click', () => {
        rail.scrollTo({ left: card.offsetLeft - (startOf() - rail.scrollLeft), behavior: railScroll });
      });
      dots.append(dot);
    });
    rail.after(dots);

    let frame = 0;
    const updateDots = () => {
      frame = 0;
      const start = startOf();
      let active = 0;
      cards.forEach((card, i) => {
        if (Math.abs(card.offsetLeft - start) < Math.abs(cards[active].offsetLeft - start)) active = i;
      });
      [...dots.children].forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };

    rail.addEventListener('scroll', () => {
      if (!frame) frame = requestAnimationFrame(updateDots);
    }, { passive: true });
    updateDots();

    // Mouse/pen drag (touch already scrolls natively): follow the pointer, then snap to a card
    let drag = null;
    let justDragged = false;

    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.button !== 0 || rail.scrollWidth <= rail.clientWidth) return;
      drag = { id: e.pointerId, x: e.clientX, left: rail.scrollLeft, moved: false };
    });

    rail.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 6) return; // small moves stay clicks
        drag.moved = true;
        rail.setPointerCapture(e.pointerId);
        rail.classList.add('is-dragging');
      }
      rail.scrollLeft = drag.left - dx;
    });

    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { moved, left } = drag;
      drag = null;
      if (!moved) return;

      // Nearest card, nudged in the drag direction so a short flick still advances
      const offset = startOf() - rail.scrollLeft;
      const width = cards[0].offsetWidth;
      const target = rail.scrollLeft + Math.sign(rail.scrollLeft - left) * width * 0.3 + offset;
      const card = cards.reduce((a, b) => (Math.abs(b.offsetLeft - target) < Math.abs(a.offsetLeft - target) ? b : a));
      rail.scrollTo({ left: card.offsetLeft - offset, behavior: railScroll });

      // Snapping comes back once the glide ends; the click that ends a drag is swallowed
      setTimeout(() => rail.classList.remove('is-dragging'), railScroll === 'smooth' ? 500 : 50);
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 0);
    };

    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);
    rail.addEventListener('click', (e) => {
      if (!justDragged) return;
      e.preventDefault();
      e.stopPropagation();
    }, true);
  });

  syncRails();
  railQuery.addEventListener('change', syncRails);

  // Care map, tablet and up: orbital view (adapted from 21st.dev "Radial Orbital Timeline").
  // The pillars orbit "Paciente no centro"; choosing one shows its card next to the orbit.
  // Tabs pattern: the orbit buttons are tabs, the existing cards are their panels.
  const orbitMap = document.querySelector('.care-map');
  if (orbitMap) {
    const angles = { a: -90, b: 30, c: 150 };
    const items = ['center', 'a', 'b', 'c'].map((key) => {
      const panel = orbitMap.querySelector(`.care-node-${key}`);
      panel.id = `cuidado-${key}`;
      return {
        key,
        panel,
        title: panel.querySelector('h3').textContent.trim(),
        icon: panel.querySelector('.care-icon i').className,
      };
    });

    const orbit = document.createElement('div');
    orbit.className = 'orbit';
    const nodes = items.slice(1).map(({ key, title, icon }, i) => {
      const rad = (angles[key] * Math.PI) / 180;
      return `<button type="button" class="orbit-node" data-key="${key}"
        style="left:${50 + 36 * Math.cos(rad)}%;top:${50 + 36 * Math.sin(rad)}%;--d:${0.8 + i * 0.15}s">
        <span class="orbit-node-inner"><span class="orbit-node-icon"><i class="${icon}" aria-hidden="true"></i></span>
        <span class="orbit-node-label">${title}</span></span></button>`;
    }).join('');
    const spokes = items.slice(1)
      .map(({ key }) => `<span class="orbit-spoke" style="--angle:${angles[key]}deg" aria-hidden="true"></span>`)
      .join('');
    orbit.innerHTML = `<span class="orbit-ring" aria-hidden="true"></span>
      <div class="orbit-track">${spokes}${nodes}</div>
      <button type="button" class="orbit-center" data-key="center">
        <i class="${items[0].icon}" aria-hidden="true"></i><span>${items[0].title}</span></button>`;
    orbitMap.prepend(orbit);

    const tabs = items.map(({ key }) => orbit.querySelector(`[data-key="${key}"]`));
    const orbitQuery = window.matchMedia('(min-width: 720px)');
    let active = 'center';

    const select = (key, focus = false) => {
      active = key;
      items.forEach(({ key: k, panel }) => {
        const show = k === key;
        if (show && panel.hidden) {
          panel.classList.remove('is-entering');
          void panel.offsetWidth; // restart the fade-in
          panel.classList.add('is-entering');
        }
        panel.hidden = !show;
      });
      tabs.forEach((tab) => {
        const on = tab.dataset.key === key;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });
      // The orbit stops turning while a pillar is chosen, so it stays where it was clicked
      orbit.classList.toggle('is-paused', key !== 'center');
    };

    const syncOrbit = () => {
      const on = orbitQuery.matches;
      orbitMap.classList.toggle('has-orbit', on);
      if (on) {
        orbit.setAttribute('role', 'tablist');
        orbit.setAttribute('aria-labelledby', 'abordagem-titulo');
        tabs.forEach((tab) => {
          tab.setAttribute('role', 'tab');
          tab.id = `aba-${tab.dataset.key}`;
          tab.setAttribute('aria-controls', `cuidado-${tab.dataset.key}`);
        });
        items.forEach(({ key, panel }) => {
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', `aba-${key}`);
          panel.tabIndex = 0;
        });
        select(active);
      } else {
        // Phones use the swipe row: every card visible again, no tab semantics
        orbit.removeAttribute('role');
        items.forEach(({ panel }) => {
          panel.hidden = false;
          panel.classList.remove('is-entering');
          panel.removeAttribute('role');
          panel.removeAttribute('aria-labelledby');
          panel.removeAttribute('tabindex');
        });
      }
    };

    tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.key)));
    orbit.addEventListener('keydown', (e) => {
      const i = tabs.findIndex((tab) => tab.dataset.key === active);
      const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length].dataset.key, true);
    });

    syncOrbit();
    orbitQuery.addEventListener('change', syncOrbit);
  }

  // Hero background: flowing lines (adapted from 21st.dev "Background Paths")
  const hero = document.querySelector('.hero');
  if (hero) {
    const perGroup = window.matchMedia('(max-width: 719.98px)').matches ? 12 : 24;
    const group = (position) => Array.from({ length: perGroup }, (_, n) => {
      const i = n * (36 / perGroup); // spread over the original 36-line fan
      const k = i * 5 * position;
      const j = i * 6;
      const d = `M-${380 - k} -${189 + j}C-${380 - k} -${189 + j} -${312 - k} ${216 - j} ${152 - k} ${343 - j}`
        + `C${616 - k} ${470 - j} ${684 - k} ${875 - j} ${684 - k} ${875 - j}`;
      const style = `--w:${(0.5 + i * 0.03).toFixed(2)};--o:${Math.min(0.1 + i * 0.03, 1).toFixed(2)};`
        + `--dur:${(20 + Math.random() * 10).toFixed(1)}s;--delay:-${(Math.random() * 20).toFixed(1)}s`;
      return `<path d="${d}" pathLength="1" style="${style}"/>`;
    }).join('');

    const paths = document.createElement('div');
    paths.className = 'hero-paths';
    paths.setAttribute('aria-hidden', 'true');
    paths.innerHTML = [1, -1]
      .map((p) => `<svg viewBox="0 0 696 316" preserveAspectRatio="xMidYMid slice" fill="none">${group(p)}</svg>`)
      .join('');
    hero.prepend(paths);

    // No animation work while the hero is off screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        paths.classList.toggle('is-offscreen', !entry.isIntersecting);
      }).observe(hero);
    }
  }

  // Spotlight cards (adapted from 21st.dev "Spotlight Card"): glow follows the mouse
  document.querySelectorAll('.plan, .care-node, .diff-item, .info-item, .proc-list, .contact-item')
    .forEach((el) => el.classList.add('spotlight'));
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let spot = null;
    let spotFrame = 0;
    let px = 0;
    let py = 0;
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      spot = e.target.closest('.spotlight');
      px = e.clientX;
      py = e.clientY;
      if (!spot || spotFrame) return;
      spotFrame = requestAnimationFrame(() => {
        spotFrame = 0;
        if (!spot) return;
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${px - r.left}px`);
        spot.style.setProperty('--my', `${py - r.top}px`);
      });
    }, { passive: true });
  }

  // Nav state on scroll: header border + link of the section in view.
  // Sections without a nav link (Abordagem, Informações) keep the previous link lit.
  const links = navLinks ? [...navLinks.querySelectorAll('a[href^="#"]')] : [];
  const tracked = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((item) => item.section);

  let ticking = false;
  const updateNav = () => {
    ticking = false;

    // Read layout first, then write, to avoid forced reflows
    const scrolled = window.scrollY > 8;
    const probe = window.innerHeight * 0.45;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = tracked[0];
    tracked.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= probe) current = item;
    });
    if (atBottom && tracked.length) current = tracked[tracked.length - 1];

    if (header) header.classList.toggle('is-scrolled', scrolled);
    tracked.forEach(({ link }) => {
      if (current && link === current.link) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  updateNav();
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateNav);
    }
  }, { passive: true });
  window.addEventListener('resize', updateNav);

  // Hide the floating WhatsApp button while the contact block is on screen
  const wppFloat = document.getElementById('wppFloat');
  const contact = document.getElementById('contato');
  if (wppFloat && contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      wppFloat.classList.toggle('is-hidden', entry.isIntersecting);
    }, { rootMargin: '0px 0px -25% 0px' }).observe(contact);
  }

  // Scroll reveal. Only when motion is allowed; otherwise nothing is ever hidden.
  const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!motionOk || !('IntersectionObserver' in window)) return;

  // [container selector, items to reveal in sequence]
  const revealGroups = [
    ['.section-head', (el) => el.querySelectorAll('.section-label, .section-title, .section-intro')],
    ['.about-text', (el) => el.children],
    ['.plans', (el) => el.children],
    ['.proc-wrap', (el) => el.querySelectorAll('.notice, .proc')],
    ['.diff-grid', (el) => el.children],
    ['.info-list', (el) => el.children],
  ];
  const revealSingles = [
    ['.about-photo', 'leaf'],
    ['.credential', ''],
    ['.info-highlight', ''],
    ['.contact-panel', ''],
  ];

  const targets = [];
  revealGroups.forEach(([selector, getItems]) => {
    document.querySelectorAll(selector).forEach((group) => {
      [...getItems(group)].forEach((el, i) => {
        el.dataset.reveal = '';
        el.style.setProperty('--reveal-i', i);
        targets.push(el);
      });
    });
  });
  revealSingles.forEach(([selector, variant]) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.dataset.reveal = variant;
      targets.push(el);
    });
  });

  // Once shown, hand the element back to its own transitions (hover effects)
  const settle = (el) => {
    const property = ['leaf', 'mask'].includes(el.dataset.reveal) ? 'clip-path' : 'opacity';
    const onEnd = (e) => {
      if (e.target !== el || e.pseudoElement || e.propertyName !== property) return;
      el.removeEventListener('transitionend', onEnd);
      el.removeAttribute('data-reveal');
      el.style.removeProperty('--reveal-i');
      el.classList.remove('is-revealed');
    };
    el.addEventListener('transitionend', onEnd);
  };

  // trigger element -> elements it reveals
  const triggers = new Map();
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      triggers.get(entry.target).forEach((el) => {
        settle(el);
        el.classList.add('is-revealed');
      });
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.documentElement.classList.add('js-reveal');
  targets.forEach((el) => {
    // A fully clipped leaf reports no intersection, so watch its parent instead.
    // Cards in a swipe rail reveal together with the rail, never one by one while swiping.
    const trigger = el.dataset.reveal === 'leaf' ? el.parentElement : el.closest('[data-rail]') || el;
    if (!triggers.has(trigger)) {
      triggers.set(trigger, []);
      revealObserver.observe(trigger);
    }
    triggers.get(trigger).push(el);
  });

  // Footer name rises out of its mask once the page has slid up far enough to show it
  // (the footer is pinned under the page, so an observer would fire too early)
  const footerName = document.querySelector('.footer-name');
  const page = document.querySelector('main');
  if (footerName && page) {
    footerName.dataset.reveal = 'mask';
    const revealFooter = () => {
      if (page.getBoundingClientRect().bottom > window.innerHeight * 0.85) return;
      window.removeEventListener('scroll', revealFooter);
      settle(footerName);
      footerName.classList.add('is-revealed');
    };
    window.addEventListener('scroll', revealFooter, { passive: true });
    revealFooter();
  }

  // Care map: center, lines, items and dots play as one connected sequence
  const careMap = document.querySelector('.care-map');
  if (careMap) {
    const careObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      careObserver.disconnect();
      careMap.classList.add('is-revealed');
      // After the sequence, drop its delays so hover reacts immediately
      setTimeout(() => careMap.classList.add('is-settled'), 2200);
    }, { threshold: 0.25 });
    careObserver.observe(careMap);
  }
});
