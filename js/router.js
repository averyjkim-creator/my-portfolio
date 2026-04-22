/* Hash-based router + page renderers */
(function () {
  const app = document.getElementById('app');
  let currentCleanup = null;

  // Global scroll handler: toggles `.is-scrolled` on the nav for themes that need a scroll-fade bg
  const updateNavScrolled = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', updateNavScrolled, { passive: true });

  const routes = {
    '/': renderWork,
    '/work': renderWork,
    '/about': renderAbout
  };
  // Register each project as its own route
  window.PROJECTS.forEach(p => {
    routes['/' + p.slug] = (route, path) => renderCaseStudy(p)(route, path);
  });

  function parseHash() {
    const h = location.hash.replace(/^#/, '') || '/';
    return h;
  }

  function navigate() {
    const path = parseHash();
    const handler = routes[path] || renderNotFound;

    if (currentCleanup) { currentCleanup(); currentCleanup = null; }

    // Body theme
    setBodyTheme(path);

    // Render into a new route container
    app.innerHTML = '';
    const route = document.createElement('main');
    route.className = 'route';
    app.appendChild(renderNav(path));
    app.appendChild(route);
    const cleanup = handler(route, path);
    currentCleanup = cleanup || null;
    app.appendChild(renderFooter());

    updateActiveLinks(path);
    initReveals(route);
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateNavScrolled();
  }

  function setBodyTheme(path) {
    const slug = path.replace(/^\//, '');
    const project = window.PROJECTS.find(p => p.slug === slug);
    if (project) document.body.setAttribute('data-theme', 'case-study');
    else if (slug === 'about') document.body.setAttribute('data-theme', 'about');
    else if (slug === '' || slug === 'work') document.body.setAttribute('data-theme', 'work');
    else document.body.removeAttribute('data-theme');
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v !== null && v !== undefined && v !== false) node.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }

  function renderNav(path) {
    const nav = el('header', { class: 'nav' });
    nav.appendChild(el('div', { class: 'nav__brand' }, 'Hello, World'));
    const center = el('nav', { class: 'nav__center' });
    center.appendChild(el('a', { href: '#/work', 'data-path': '/work' }, 'Work'));
    center.appendChild(el('a', { href: '#/about', 'data-path': '/about' }, 'About'));
    nav.appendChild(center);
    const right = el('div', { class: 'nav__right' });
    const linkedin = el('a', {
      class: 'ext',
      href: 'https://www.linkedin.com/in/averyjkim/',
      target: '_blank',
      rel: 'noopener'
    }, 'LinkedIn ');
    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('class', 'arrow');
    arrowSvg.setAttribute('width', '12');
    arrowSvg.setAttribute('height', '12');
    arrowSvg.setAttribute('viewBox', '0 0 12 12');
    arrowSvg.setAttribute('fill', 'none');
    arrowSvg.setAttribute('aria-hidden', 'true');
    arrowSvg.innerHTML = '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.896 0H0.742188C0.327974 0 -0.0078125 0.335786 -0.0078125 0.75C-0.0078125 1.16421 0.327974 1.5 0.742188 1.5H9.08537L0.211857 10.3735C-0.0810358 10.6664 -0.0810358 11.1413 0.211857 11.4342C0.504751 11.7271 0.979624 11.7271 1.27252 11.4342L10.146 2.56066V10.9038C10.146 11.3181 10.4818 11.6538 10.896 11.6538C11.3102 11.6538 11.646 11.3181 11.646 10.9038V0.75C11.646 0.558058 11.5728 0.366117 11.4264 0.21967C11.3545 0.147762 11.2716 0.093509 11.1831 0.0569091C11.0947 0.0202391 10.9977 0 10.896 0Z" fill="currentColor"/>';
    linkedin.appendChild(arrowSvg);
    right.appendChild(linkedin);
    nav.appendChild(right);
    return nav;
  }

  function updateActiveLinks(path) {
    const links = document.querySelectorAll('.nav a[data-path]');
    links.forEach(a => {
      const p = a.getAttribute('data-path');
      const active = (path === p) || (p === '/work' && (path === '/' || path === '/work' || window.PROJECTS.some(x => '/' + x.slug === path)));
      a.classList.toggle('is-active', !!active);
    });
  }

  function renderFooter() {
    // Fade stripes from Figma — progressively-thicker #1D030E bars on page bg,
    // transitioning into the solid footer block below.
    const fadeSvg = `
      <svg class="foot__fade" viewBox="0 0 1440 166" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="1440" height="2" fill="#1D030E"/>
        <rect y="6" width="1440" height="2" fill="#1D030E"/>
        <rect y="16" width="1440" height="4" fill="#1D030E"/>
        <rect y="28" width="1440" height="6" fill="#1D030E"/>
        <rect y="42" width="1440" height="8" fill="#1D030E"/>
        <rect y="66" width="1440" height="10" fill="#1D030E"/>
        <rect y="84" width="1440" height="12" fill="#1D030E"/>
        <rect y="104" width="1440" height="14" fill="#1D030E"/>
        <rect y="126" width="1440" height="16" fill="#1D030E"/>
        <rect y="148" width="1440" height="18" fill="#1D030E"/>
      </svg>`;
    const foot = el('footer', { class: 'foot' });
    const fade = document.createElement('div');
    fade.innerHTML = fadeSvg.trim();
    foot.appendChild(fade.firstChild);
    foot.appendChild(el('div', { class: 'foot__block' },
      el('span', {}, '© 2026 Avery Kim'),
      el('span', {}, 'All rights reserved')
    ));
    return foot;
  }

  /* ---------- /work ---------- */
  function renderWork(route) {
    const initialView = localStorage.getItem('ak.view') || 'carousel';

    // Hero wordmark
    const wordmark = el('section', { class: 'wordmark' });
    wordmark.innerHTML = wordmarkSVG();
    route.appendChild(wordmark);

    // Section header
    const head = el('div', { class: 'work__head' });
    const title = el('h1', { class: 'work__title' }, 'Selected (recent) work');

    const toggle = el('div', { class: 'toggle', role: 'tablist', 'aria-label': 'View mode' });
    const btnList = el('button', { class: 'toggle__btn', 'aria-pressed': initialView === 'list' ? 'true' : 'false', role: 'tab' }, 'List');
    const btnCar = el('button', { class: 'toggle__btn', 'aria-pressed': initialView === 'carousel' ? 'true' : 'false', role: 'tab' }, 'Carousel');
    const thumb = el('span', { class: 'toggle__thumb' });
    toggle.append(thumb, btnList, btnCar);
    head.append(title, toggle);
    route.appendChild(head);

    // Views
    const carouselView = el('section', { class: 'view view--carousel', hidden: initialView === 'list' });
    const listView = el('section', { class: 'view view--list', hidden: initialView === 'carousel' });
    route.appendChild(carouselView);
    route.appendChild(listView);
    route.appendChild(el('div', { class: 'rule-stack' }));

    buildCarousel(carouselView);
    buildList(listView);

    // Position the toggle thumb over the active button
    const positionThumb = () => {
      const activeBtn = toggle.querySelector('[aria-pressed="true"]');
      if (!activeBtn) return;
      const r = activeBtn.getBoundingClientRect();
      const tr = toggle.getBoundingClientRect();
      thumb.style.width = r.width + 'px';
      thumb.style.transform = `translateX(${r.left - tr.left - 4}px)`;
    };
    requestAnimationFrame(positionThumb);
    window.addEventListener('resize', positionThumb);

    const setView = (mode) => {
      localStorage.setItem('ak.view', mode);
      btnList.setAttribute('aria-pressed', mode === 'list' ? 'true' : 'false');
      btnCar.setAttribute('aria-pressed', mode === 'carousel' ? 'true' : 'false');
      positionThumb();
      const show = mode === 'list' ? listView : carouselView;
      const hide = mode === 'list' ? carouselView : listView;
      hide.classList.add('leaving');
      setTimeout(() => {
        hide.hidden = true;
        hide.classList.remove('leaving');
        show.hidden = false;
        show.classList.add('entering');
        setTimeout(() => show.classList.remove('entering'), 640);
      }, 180);
    };
    btnList.addEventListener('click', () => setView('list'));
    btnCar.addEventListener('click', () => setView('carousel'));

    return () => window.removeEventListener('resize', positionThumb);
  }

  function buildCarousel(container) {
    const wrap = el('div', { class: 'carousel' });
    const track = el('div', { class: 'carousel__track', role: 'list' });
    window.PROJECTS.forEach((p, i) => {
      const card = el('a', {
        class: 'card',
        href: '#/' + p.slug,
        role: 'listitem',
        'aria-label': p.name,
        style: `--i:${i}; background: ${p.swatch};`
      });
      card.appendChild(projectCardInner(p));
      card.appendChild(el('span', { class: 'card__label' }, p.name));
      track.appendChild(card);
    });
    wrap.appendChild(track);
    container.appendChild(wrap);
    enableDragScroll(track);
  }

  function projectCardInner(p) {
    if (p.tile) {
      const img = el('img', { class: 'card__media', src: p.tile, alt: p.name, loading: 'lazy', draggable: 'false' });
      return img;
    }
    const panel = el('div', { class: 'panel' });
    panel.innerHTML = projectLogoMark(p);
    return panel;
  }

  function buildList(container) {
    const list = el('div', { class: 'list' });

    // Floating thumbnail that follows the cursor on row hover
    const thumb = el('div', { class: 'list__thumb', 'aria-hidden': 'true' });
    const thumbImg = el('img', { alt: '', draggable: 'false' });
    thumb.appendChild(thumbImg);
    container.appendChild(thumb);

    let activeRow = null;
    let rafId = null;
    let pendingX = 0, pendingY = 0;
    let isScrolling = false;
    let scrollTimer = null;
    const OFFSET_X = -90;
    const OFFSET_Y = 24;

    const scheduleMove = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        thumb.style.transform = `translate3d(${pendingX + OFFSET_X}px, ${pendingY + OFFSET_Y}px, 0)`;
      });
    };

    // Hide thumbnail while user is scrolling (prevents jank from mouseenter spam)
    const onScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        thumb.classList.remove('is-visible');
        activeRow = null;
      }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { isScrolling = false; }, 120);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    window.PROJECTS.forEach((p, i) => {
      const row = el('a', { class: 'list__row', href: '#/' + p.slug, style: `--i:${i};` });
      row.appendChild(el('div', { class: 'list__name' }, p.name, el('span', { class: 'list__arrow' }, ' ↗')));
      row.appendChild(el('div', { class: 'list__roles' }, p.roles));
      row.appendChild(el('div', { class: 'list__year' }, p.year));

      row.addEventListener('mouseenter', () => {
        if (isScrolling || activeRow === row) return;
        activeRow = row;
        if (p.tile && thumbImg.getAttribute('src') !== p.tile) {
          thumbImg.src = p.tile;
          thumbImg.alt = p.name;
        }
        thumb.classList.add('is-visible');
      });
      row.addEventListener('mousemove', (e) => {
        if (isScrolling) return;
        pendingX = e.clientX;
        pendingY = e.clientY;
        scheduleMove();
      });
      row.addEventListener('mouseleave', () => {
        if (activeRow === row) {
          activeRow = null;
          thumb.classList.remove('is-visible');
        }
      });

      list.appendChild(row);
    });
    container.appendChild(list);
  }

  /* ---------- Drag-scroll with inertia ---------- */
  function enableDragScroll(track) {
    let isDown = false;
    let startX = 0, startScroll = 0;
    let lastX = 0, lastT = 0, velocity = 0;
    let raf = null;

    const onDown = (e) => {
      isDown = true;
      track.classList.add('dragging');
      const pt = 'touches' in e ? e.touches[0] : e;
      startX = pt.pageX;
      lastX = pt.pageX;
      lastT = performance.now();
      startScroll = track.scrollLeft;
      velocity = 0;
      if (raf) cancelAnimationFrame(raf);
    };
    const onMove = (e) => {
      if (!isDown) return;
      const pt = 'touches' in e ? e.touches[0] : e;
      const dx = pt.pageX - startX;
      track.scrollLeft = startScroll - dx;
      const now = performance.now();
      velocity = (pt.pageX - lastX) / Math.max(1, now - lastT);
      lastX = pt.pageX;
      lastT = now;
      if ('preventDefault' in e) e.preventDefault();
    };
    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('dragging');
      // Inertia
      let v = velocity * 16; // scale to px/frame
      const decay = 0.94;
      track.classList.add('inertia');
      const step = () => {
        track.scrollLeft -= v;
        v *= decay;
        if (Math.abs(v) > 0.5) raf = requestAnimationFrame(step);
        else {
          track.classList.remove('inertia');
          // Snap to nearest card
          const cards = track.querySelectorAll('.card');
          let nearest = null, nearestD = Infinity;
          const sx = track.scrollLeft;
          const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
          cards.forEach(c => {
            const d = Math.abs(c.offsetLeft - padLeft - sx);
            if (d < nearestD) { nearestD = d; nearest = c; }
          });
          if (nearest) track.scrollTo({ left: nearest.offsetLeft - padLeft, behavior: 'smooth' });
        }
      };
      if (Math.abs(v) > 0.5) step();
    };

    track.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    track.addEventListener('touchstart', onDown, { passive: true });
    track.addEventListener('touchmove', onMove, { passive: false });
    track.addEventListener('touchend', onUp);
    // Scroll wheel horizontal
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
  }

  /* ---------- /about ---------- */
  function renderAbout(route) {
    const wrap = el('section', { class: 'about' });
    const hero = el('div', { class: 'about__hero' });
    hero.innerHTML = wordmarkSVG();
    wrap.appendChild(hero);

    const grid = el('div', { class: 'about__grid' });
    grid.appendChild(el('div', {})); // left col (empty, wordmark bleeds)
    const bio = el('div', { class: 'about__bio' });
    bio.innerHTML = `
      <p>With over a decade of experience, I specialize in crafting compelling visual identities, from initial concept to final execution. My work spans a wide range of industries, including B2B, B2C, health tech, fintech, and e-commerce. I'm passionate about helping businesses of all sizes discover their unique visual voice.</p>
      <p>My key strengths lie in adaptability, collaboration, and a commitment to exceptional design. Having worked in agencies, as a freelancer, and in-house, I bring a versatile perspective to every project. I excel at tailoring design strategies to fit diverse resource constraints, from large-scale operations like Affirm to lean startups like OpenStore. I thrive in collaborative environments, working closely with cross-functional teams to deliver high-quality designs that meet specific needs.</p>
    `;
    grid.appendChild(bio);
    wrap.appendChild(grid);

    // Photo grid
    const imgs = el('div', { class: 'about__images' });
    imgs.appendChild(aboutFigure('portrait-1'));
    imgs.appendChild(aboutFigure('portrait-2'));
    wrap.appendChild(imgs);
    wrap.appendChild(el('div', { class: 'rule-stack' }));

    route.appendChild(wrap);

    initAboutTrail(wrap);
  }

  function initAboutTrail(wrap) {
    const trail = el('div', { class: 'about-trail', 'aria-hidden': 'true' });
    wrap.appendChild(trail);

    const srcs = [
      'assets/about-trail/flower-1.png',
      'assets/about-trail/flower-2.png',
      'assets/about-trail/flower-3.png'
    ];
    srcs.forEach(s => { const i = new Image(); i.src = s; });

    let lastSpawn = 0;
    const minInterval = 80;

    function spawn(x, y) {
      const img = document.createElement('img');
      img.src = srcs[(Math.random() * srcs.length) | 0];
      img.className = 'about-trail__petal';
      img.draggable = false;
      img.alt = '';
      const size = 26 + Math.random() * 14;
      const jitterX = (Math.random() - 0.5) * 16;
      const jitterY = (Math.random() - 0.5) * 16;
      const dx = (Math.random() - 0.5) * 30;
      const dy = 80 + Math.random() * 60;
      const r = (Math.random() - 0.5) * 40;
      const rEnd = (Math.random() - 0.5) * 90;
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.style.left = (x + jitterX) + 'px';
      img.style.top = (y + jitterY) + 'px';
      img.style.setProperty('--dx', dx + 'px');
      img.style.setProperty('--dy', dy + 'px');
      img.style.setProperty('--r', r + 'deg');
      img.style.setProperty('--rEnd', rEnd + 'deg');
      trail.appendChild(img);
      img.addEventListener('animationend', () => img.remove(), { once: true });
    }

    function onMove(e) {
      if (document.body.getAttribute('data-theme') !== 'about') {
        window.removeEventListener('mousemove', onMove);
        return;
      }
      const now = performance.now();
      if (now - lastSpawn < minInterval) return;
      lastSpawn = now;
      spawn(e.clientX, e.clientY);
    }

    window.removeEventListener('mousemove', window.__aboutTrailMove || (() => {}));
    window.__aboutTrailMove = onMove;
    window.addEventListener('mousemove', onMove, { passive: true });
  }

  function aboutFigure(key) {
    const fig = el('figure', { class: 'about__img' });
    const src = key === 'portrait-1' ? 'assets/about/avery-1.png' : 'assets/about/avery-2.png';
    const alt = key === 'portrait-1' ? 'Avery at a photo session' : 'Avery mirror selfie';
    fig.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy" draggable="false" />`;
    return fig;
  }

  /* ---------- Case study ---------- */
  function renderCaseStudy(p) {
    return (route) => {
      const cs = el('section', { class: 'cs', 'data-screen-label': p.name });

      // Hero
      const hero = el('div', { class: 'cs__hero' });
      if (p.slug === 'opendesk') {
        const img = el('img', { src: 'assets/case-studies/opendesk/hero-bg.png', alt: 'OpenDesk hero' });
        hero.appendChild(img);
        const logoWrap = el('div', { class: 'cs__hero-logo' });
        logoWrap.innerHTML = `<svg width="720" height="124" viewBox="0 0 720 124" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_123_13108)"><path d="M62.8656 61.9355V0C28.1468 0.0652639 0 27.8024 0 61.9355C0 96.0685 28.1468 123.74 62.8656 123.871V61.9355Z" fill="#192441"/><path d="M125.799 0H62.8672C97.6524 0 125.866 27.7372 125.866 61.9355C125.866 96.1338 97.6524 123.871 62.8672 123.871H125.866C160.651 123.871 188.864 96.1338 188.864 61.9355C188.864 27.7372 160.584 0 125.799 0Z" fill="#192441"/><path d="M231.812 96.7863C225.638 93.3274 220.726 88.5631 217.207 82.4935C213.689 76.424 211.963 69.5713 211.963 62.0007C211.963 54.4301 213.689 47.5774 217.207 41.5078C220.726 35.4383 225.572 30.674 231.812 27.215C238.052 23.756 244.956 21.9939 252.59 21.9939C260.224 21.9939 267.261 23.6908 273.434 27.215C279.608 30.7393 284.454 35.4383 287.972 41.5078C291.491 47.5774 293.283 54.4301 293.283 62.0007C293.283 69.5713 291.557 76.424 287.972 82.4935C284.454 88.5631 279.608 93.3274 273.434 96.7863C267.261 100.245 260.29 102.007 252.59 102.007C244.889 102.007 238.052 100.311 231.812 96.7863ZM264.672 84.1904C268.256 81.9714 271.045 78.9693 273.036 75.1187C275.028 71.2682 275.957 66.9607 275.957 62.1965C275.957 57.4322 274.961 52.9943 273.036 49.0784C271.045 45.1626 268.256 42.0952 264.672 39.9415C261.087 37.7878 257.038 36.6783 252.59 36.6783C248.142 36.6783 244.093 37.7878 240.574 39.9415C237.056 42.0952 234.268 45.1626 232.21 49.0132C230.218 52.8637 229.223 57.2364 229.223 62.0659C229.223 66.8955 230.218 71.2682 232.21 75.1187C234.201 78.9693 236.99 82.0367 240.574 84.1904C244.159 86.4094 248.142 87.4536 252.59 87.4536C257.038 87.4536 261.087 86.3441 264.672 84.1904Z" fill="#192441"/><path d="M298.262 44.8363H314.127V50.9711C315.787 48.7521 318.044 46.99 320.899 45.75C323.753 44.51 326.94 43.9226 330.458 43.9226C335.769 43.9226 340.416 45.0974 344.332 47.5121C348.315 49.8616 351.369 53.2554 353.56 57.6933C355.75 62.066 356.812 67.1566 356.812 72.9651C356.812 78.7736 355.684 83.8641 353.36 88.2368C351.037 92.6095 347.784 96.0032 343.668 98.418C339.486 100.768 334.706 102.008 329.263 102.008C325.944 102.008 322.957 101.485 320.301 100.441C317.646 99.397 315.588 97.9612 314.194 96.0685V123.871H298.328V44.8363H298.262ZM334.507 86.6052C336.565 85.2999 338.225 83.4726 339.42 81.1231C340.615 78.7736 341.212 76.0977 341.212 73.0303C341.212 68.2661 339.951 64.4807 337.428 61.6091C334.906 58.7375 331.52 57.3017 327.271 57.3017C324.483 57.3017 322.027 57.9544 319.969 59.2596C317.911 60.5649 316.252 62.3923 315.057 64.7418C313.862 67.0913 313.331 69.7671 313.331 72.8345C313.331 77.5988 314.592 81.3841 317.181 84.2557C319.77 87.1273 323.156 88.5631 327.404 88.5631C330.126 88.5631 332.516 87.9105 334.64 86.6052H334.507Z" fill="#192441"/><path d="M373.542 97.7654C369.095 94.959 365.775 91.3695 363.518 86.8663C361.261 82.4283 360.133 77.7293 360.133 72.8345C360.133 67.9397 361.195 63.1755 363.253 58.7375C365.311 54.3648 368.497 50.7753 372.812 48.0342C377.061 45.2932 382.305 43.9226 388.412 43.9226C394.52 43.9226 400.096 45.2931 404.345 47.969C408.593 50.6448 411.713 54.1038 413.705 58.2154C415.696 62.3923 416.692 66.765 416.692 71.3987C416.626 73.0956 416.559 74.7925 416.493 76.4241H369.36V66.6345H400.893C400.693 63.3713 399.432 60.6954 397.175 58.5417C394.918 56.388 391.997 55.3438 388.346 55.3438C385.491 55.3438 383.035 55.9312 381.044 57.1712C379.052 58.4112 377.525 60.3039 376.53 62.7839C375.534 65.2639 375.069 68.5924 375.069 72.5735C375.069 75.9019 375.6 78.8388 376.795 81.3188C377.99 83.7989 379.583 85.7568 381.708 87.1273C383.832 88.4979 386.421 89.2158 389.474 89.2158C392.661 89.2158 395.25 88.6284 397.308 87.3884C399.366 86.1484 400.693 84.3863 401.291 81.9715H416.758C416.094 86.0179 414.501 89.4768 411.912 92.5442C409.39 95.5464 406.203 97.8959 402.353 99.5275C398.503 101.159 394.188 102.008 389.541 102.008C383.367 102.008 378.056 100.637 373.609 97.8306L373.542 97.7654Z" fill="#192441"/><path d="M420.939 44.8363H436.805V52.668C438.398 49.9269 440.722 47.7732 443.776 46.2722C446.829 44.7711 450.348 43.9879 454.264 43.9879C458.446 43.9879 462.097 44.9016 465.35 46.7943C468.537 48.6217 471.059 51.2322 472.852 54.6259C474.644 57.9544 475.507 61.805 475.507 66.1124V101.159H459.641V69.5714C459.641 66.1777 458.646 63.3713 456.588 61.1523C454.53 58.9334 451.874 57.8239 448.622 57.8239C446.365 57.8239 444.307 58.346 442.581 59.4555C440.788 60.565 439.394 62.0008 438.398 63.8934C437.403 65.7861 436.872 67.9398 436.872 70.2893V101.094H421.006V44.8363H420.939Z" fill="#192441"/><path d="M482.609 22.9729H509.428C516.996 22.9729 523.9 24.4087 530.074 27.2803C536.248 30.1519 541.226 34.5246 544.944 40.3984C548.661 46.2721 550.52 53.5164 550.52 62.066C550.52 70.6156 548.661 77.8599 544.944 83.7336C541.226 89.6074 536.248 93.9801 530.074 96.8517C523.834 99.7233 516.996 101.159 509.428 101.159H482.609V22.9729ZM520.448 84.1905C524.232 82.6241 527.286 79.9483 529.676 76.2935C532.065 72.6388 533.26 67.8745 533.26 62.0007C533.26 56.127 532.065 51.3627 529.676 47.7079C527.286 44.0532 524.166 41.4426 520.448 39.811C516.664 38.1794 512.416 37.3962 507.703 37.3962H499.736V86.4747H507.703C512.416 86.4747 516.664 85.6915 520.448 84.0599V84.1905Z" fill="#192441"/><path d="M566.519 97.7654C562.071 94.959 558.752 91.3695 556.495 86.8663C554.238 82.4283 553.109 77.7293 553.109 72.8345C553.109 67.9397 554.172 63.1755 556.229 58.7375C558.287 54.3648 561.474 50.7753 565.789 48.0342C570.037 45.2932 575.282 43.9226 581.389 43.9226C587.496 43.9226 593.073 45.2931 597.321 47.969C601.57 50.6448 604.69 54.1038 606.681 58.2154C608.673 62.3923 609.668 66.765 609.668 71.3987C609.602 73.0956 609.536 74.7925 609.469 76.4241H562.337V66.6345H593.869C593.67 63.3713 592.409 60.6954 590.152 58.5417C587.895 56.388 584.974 55.3438 581.323 55.3438C578.468 55.3438 576.012 55.9312 574.02 57.1712C572.029 58.4112 570.502 60.3039 569.506 62.7839C568.51 65.2639 568.046 68.5924 568.046 72.5735C568.046 75.9019 568.577 78.8388 569.772 81.3188C570.967 83.7989 572.56 85.7568 574.684 87.1273C576.808 88.4979 579.397 89.2158 582.451 89.2158C585.637 89.2158 588.226 88.6284 590.284 87.3884C592.342 86.1484 593.67 84.3863 594.267 81.9715H609.735C609.071 86.0179 607.478 89.4768 604.889 92.5442C602.366 95.5464 599.18 97.8959 595.33 99.5275C591.479 101.159 587.164 102.008 582.517 102.008C576.344 102.008 571.033 100.637 566.585 97.8306L566.519 97.7654Z" fill="#192441"/><path d="M623.476 99.5275C619.892 97.8959 617.104 95.6116 615.046 92.6095C612.988 89.6074 611.859 86.1484 611.727 82.102H625.335C625.667 84.6473 626.729 86.6052 628.654 88.041C630.513 89.4768 632.903 90.1947 635.824 90.1947C638.214 90.1947 640.205 89.6726 641.798 88.6284C643.325 87.5842 644.122 86.2789 644.122 84.7126C644.122 83.1462 643.657 82.102 642.728 81.2536C641.798 80.4052 640.604 79.8178 639.21 79.4262C637.815 79.0346 635.758 78.5778 633.036 78.1209C629.053 77.4683 625.734 76.6851 623.078 75.7714C620.489 74.8577 618.166 73.2261 616.241 70.9419C614.316 68.5924 613.32 65.1987 613.32 60.826C613.32 57.5628 614.183 54.6259 615.975 52.0806C617.767 49.5353 620.157 47.5121 623.277 46.0763C626.397 44.6405 629.849 43.9226 633.7 43.9226C638.214 43.9226 642.263 44.7058 645.781 46.2068C649.3 47.7079 652.088 49.8616 654.079 52.6027C656.071 55.3438 657.133 58.607 657.332 62.327H643.591C643.259 60.0428 642.197 58.2154 640.404 56.8449C638.612 55.5396 636.554 54.8217 634.297 54.8217C632.04 54.8217 630.181 55.2785 628.854 56.2575C627.526 57.2365 626.796 58.5417 626.796 60.3039C626.796 61.7397 627.26 62.7839 628.19 63.5671C629.119 64.3502 630.314 64.9376 631.774 65.3292C633.235 65.7208 635.226 66.0471 637.815 66.3081C641.998 66.8955 645.383 67.6134 648.105 68.4618C650.76 69.3103 653.15 70.9419 655.075 73.4219C657 75.9019 657.996 79.4262 657.996 84.1252C657.996 87.6495 657.067 90.7169 655.274 93.3927C653.482 96.0685 650.893 98.157 647.507 99.658C644.122 101.159 640.205 101.877 635.758 101.877C631.31 101.877 627.061 101.029 623.476 99.397V99.5275Z" fill="#192441"/><path d="M662.311 20.3623H678.309V101.094H662.311V20.3623ZM676.185 65.9818L698.224 44.771H718.206L675.986 85.7568L676.185 65.9818ZM682.425 73.8135L693.777 64.6765L719.998 101.029H700.946L682.425 73.8135Z" fill="#192441"/></g><defs><clipPath id="clip0_123_13108"><rect width="720" height="123.871" fill="white"/></clipPath></defs></svg>`;
        hero.appendChild(logoWrap);
      } else if (p.slug === 'aetherflux') {
        const img = el('img', { src: 'assets/case-studies/aetherflux/Hero.png', alt: 'Aetherflux hero' });
        hero.appendChild(img);
      } else if (p.slug === 'openstore-shopping') {
        const img = el('img', { src: 'assets/case-studies/openstore-shopping/hero.png', alt: 'OpenStore: Shopping hero' });
        hero.appendChild(img);
      } else if (p.slug === 'gumdrop') {
        const img = el('img', { src: 'assets/case-studies/gumdrop/hero.png', alt: 'Gumdrop — wordmark' });
        hero.appendChild(img);
      } else if (p.slug === 'affirm_rebrand') {
        const img = el('img', { src: 'assets/case-studies/affirm-rebrand/Affirm_Hero.png', alt: 'Affirm Rebrand hero' });
        hero.appendChild(img);
      } else if (p.slug === 'affirm_product-marketing') {
        const img = el('img', { src: 'assets/case-studies/affirm-product-marketing/Affirm_debit_Hero.png', alt: 'Affirm Product Marketing hero' });
        hero.appendChild(img);
      } else if (p.slug === 'affirm_photography') {
        const img = el('img', { src: 'assets/case-studies/affirm-photography/Affirm_photography_Hero.png', alt: 'Affirm Photography hero' });
        hero.appendChild(img);
      } else if (p.slug === 'openstore') {
        const img = el('img', { src: 'assets/case-studies/openstore/OpenStore_Hero.png', alt: 'OpenStore Rebrand hero' });
        hero.appendChild(img);
      } else if (p.slug === 'collective-health') {
        const img = el('img', { src: 'assets/case-studies/collective-health/CH_Hero.png', alt: 'Collective Health hero' });
        hero.appendChild(img);
      } else if (p.slug === 'collective-health_open-enrollment') {
        const img = el('img', { src: 'assets/case-studies/collective-health-open-enrollment/CHOE_Hero.png', alt: 'Collective Health Open Enrollment hero' });
        hero.appendChild(img);
      } else if (p.slug === 'collective-health_innovation-day') {
        hero.style.background = '#021689';
        const logoWrap = el('div', { class: 'cs__hero-logo' });
        logoWrap.innerHTML = `<img src="assets/case-studies/collective-health-innovation-day/CH_innovation_hero.png" alt="Collective Health Innovation Day" style="width:692px;height:auto;max-width:90%;object-fit:contain;" />`;
        hero.appendChild(logoWrap);
      } else if (p.tile) {
        const img = el('img', { src: p.tile, alt: p.name + ' hero' });
        hero.appendChild(img);
      } else {
        hero.style.background = p.swatch;
        hero.innerHTML = `<div class="fig--placeholder" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7)">${p.name.toUpperCase()} — HERO</div>`;
      }
      cs.appendChild(hero);

      // Spacer reserves the hero's space in normal flow so content begins below it
      cs.appendChild(el('div', { class: 'cs__hero-spacer', 'aria-hidden': 'true' }));

      // Intro — title + columns
      const intro = el('div', { class: 'cs__intro' });
      intro.appendChild(el('h1', { class: 'cs__title' }, p.name));
      const cols = el('div', { class: 'cs__columns' });
      const meta = el('dl', { class: 'cs__meta' });
      meta.innerHTML = `
        <dt>Date</dt><dd>${p.year}</dd>
        <dt>Role</dt><dd>${p.roles}</dd>
        <dt>Scope</dt><dd>${p.scope || '—'}</dd>
      `;
      cols.appendChild(meta);
      const body = el('div', { class: 'cs__body' });
      body.innerHTML = caseStudyCopy(p);
      cols.appendChild(body);
      intro.appendChild(cols);
      cs.appendChild(intro);

      // Reel — real assets for opendesk, placeholders otherwise
      const reel = el('div', { class: 'cs__reel' });
      if (p.slug === 'opendesk') {
        const BASE = 'assets/case-studies/opendesk/';
        reel.appendChild(videoFig('wide', BASE + '01-laptop.mov', BASE + '01-laptop.png', 'OpenDesk landing page on laptop'));
        reel.appendChild(figRow(2, [
          videoFig('square', BASE + '02-brand-system.mov', BASE + '02-brand-system.png', 'Brand system — logo, mark, color palette'),
          videoFig('square', BASE + '04-typography.mov', BASE + '04-typography.png', 'Typography system — Roobert display, Inter body')
        ]));
        reel.appendChild(imgFig('wide', BASE + '03-ui-detail.png', 'Tickets UI — filters and inbox'));
        reel.appendChild(videoFig('wide', BASE + '05-social.mov', BASE + '05-social.png', 'Social campaign — coming soon posts'));
        reel.appendChild(videoFig('wide', BASE + '06-mark.mov', BASE + '06-mark.png', 'Brand mark on navy'));
      } else if (p.slug === 'aetherflux') {
        const AF = 'assets/case-studies/aetherflux/';
        reel.appendChild(imgFig('wide', AF + '02-wordmark-light.png', 'Aetherflux wordmark — light'));
        reel.appendChild(imgFig('wide', AF + '03-colors.png', 'Color system — Carbon, Dune, Nebula Blue, Corona Red'));
        reel.appendChild(videoFig('wide', AF + '04-website.mov', AF + '04-website.png', 'Aetherflux.com — Space Solar Power'));
        reel.appendChild(figRow(2, [
          imgFig('tall', AF + '05-satellite.png', 'APEX satellite render'),
          imgFig('tall', AF + '06-social.png', 'Social — X post on iPhone')
        ]));
        reel.appendChild(imgFig('wide', AF + '07-stage.png', 'Launch announcement stage')); 
        reel.appendChild(imgFig('wide', AF + '08-building.png', 'Headquarters — building mural'));
        reel.appendChild(imgFig('wide', AF + '09-billboard.png', 'Billboard — Our mission'));
        reel.appendChild(figRow(2, [
          imgFig('tall', AF + '10-cards.png', 'Business cards — Baiju Bhatt, Founder & CEO'),
          imgFig('tall', AF + '11-packaging.png', 'Packaging — bagged poster')
        ]));
        reel.appendChild(imgFig('wide', AF + '12-stationery.png', 'Stationery — letterhead and folder'));
        reel.appendChild(figRow(2, [
          imgFig('tall', AF + '13-jacket-back.png', 'Team jacket — wordmark on back'),
          imgFig('tall', AF + '14-jacket-front.png', 'Team jacket — logo on chest')
        ]));
        reel.appendChild(figRow(2, [
          imgFig('tall', AF + '15-stickers.png', 'Laptop stickers'),
          imgFig('tall', AF + '16-patches.png', 'Embroidered patches')
        ]));
      } else if (p.slug === 'openstore-shopping') {
        const OS = 'assets/case-studies/openstore-shopping/';
        reel.appendChild(imgFig('wide', OS + '01-hero-laptop.png', 'Landing page on laptop'));
        reel.appendChild(videoFig('wide', OS + '04-category-home.mov', OS + '04-category-home.png', 'Shop by Category — Home module'));
        reel.appendChild(figRow(2, [
          videoFig('tall', OS + '02-phone-category.mp4', OS + '02-phone-category.png', 'Shop by Category — mobile'),
          imgFig('tall', OS + '03-phones-trio.png', 'Mobile product tour — featured collections, trending, founder spotlight')
        ]));
        reel.appendChild(imgFig('wide', OS + '05-billboard.png', 'Subway billboard — shop.open.store'));
        reel.appendChild(imgFig('wide', OS + '06-featured-brands.png', 'Featured brands — editorial photography'));
      } else if (p.slug === 'gumdrop') {
        const GD = 'assets/case-studies/gumdrop/';
        reel.appendChild(imgFig('wide', GD + '01-wordmark-blue.png', 'Gumdrop wordmark — primary'));
        reel.appendChild(figRow(2, [
          imgFig('tall', GD + '02-logo-yellow.png', 'Logo mark on chartreuse'),
          imgFig('tall', GD + '03-phone-in-hand.png', 'App launch screen — phone in hand')
        ]));
        reel.appendChild(imgFig('wide', GD + '04-mobile-screens.png', 'Mobile product tour — collab flow'));
        reel.appendChild(figRow(2, [
          imgFig('tall', GD + '05-drops-hero.png', 'Drops — featured drops'),
          videoFig('tall', GD + '06-say-hello.mov', GD + '06-say-hello.png', 'Splash — Say hello')
        ]));
        reel.appendChild(videoFig('wide', GD + '07-landing.mov', GD + '07-landing.png', 'Landing page — Weekly pre-approved collabs'));
        reel.appendChild(imgFig('wide', GD + '08-billboards.png', 'OOH — billboards under the bridge'));
        reel.appendChild(imgFig('wide', GD + '09-posters.png', 'Poster triptych — positioning'));
        reel.appendChild(imgFig('wide', GD + '10-packaging.png', 'Packaging — branded tape'));
        reel.appendChild(figRow(2, [
          imgFig('tall', GD + '11-tshirt.png', 'Merch — t-shirt'),
          imgFig('tall', GD + '12-hat.png', 'Merch — cap')
        ]));
      } else if (p.slug === 'affirm_rebrand') {
        const AR = 'assets/case-studies/affirm-rebrand/';
        const ar = (n) => imgFigNat(AR + `Affirm_${n}.png`, `Affirm — ${n}`);
        const splitCols = (left, right) => {
          const wrap = el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,1.4vw,20px);align-items:start;' });
          const L = el('div', { style: 'display:flex;flex-direction:column;gap:clamp(12px,1.4vw,20px);' });
          left.forEach(c => L.appendChild(c));
          wrap.appendChild(L);
          const R = el('div', { style: 'display:flex;flex-direction:column;gap:clamp(12px,1.4vw,20px);' });
          right.forEach(c => R.appendChild(c));
          wrap.appendChild(R);
          return wrap;
        };
        reel.appendChild(videoFigNat(AR + 'Affirm_01.mov', AR + 'Affirm_01.png'));
        reel.appendChild(figRow(2, [ar('02'), ar('03')]));
        reel.appendChild(ar('04'));
        reel.appendChild(splitCols([ar('05'), ar('06')], [ar('07')]));
        reel.appendChild(videoFigNat(AR + 'Affirm_08.mov', AR + 'Affirm_08.png'));
        reel.appendChild(splitCols([ar('09')], [ar('10'), ar('11')]));
        reel.appendChild(ar('12'));
        reel.appendChild(ar('13'));
        reel.appendChild(ar('14'));
      } else if (p.slug === 'openstore') {
        const OS = 'assets/case-studies/openstore/';
        const os = (n) => imgFigNat(OS + `OpenStore_assets_${n}.png`, `OpenStore — ${n}`);
        const osv = (n) => videoFigNat(OS + `OpenStore_assets_${n}.mov`, OS + `OpenStore_assets_${n}.png`);
        reel.appendChild(os('01'));
        reel.appendChild(figRow(2, [osv('02'), osv('03')]));
        reel.appendChild(os('04'));
        reel.appendChild(os('05'));
        reel.appendChild(osv('06'));
        reel.appendChild(os('07'));
        reel.appendChild(osv('08'));
        reel.appendChild(figRow(2, [os('09'), os('10')]));
      } else if (p.slug === 'affirm_photography') {
        const AP = 'assets/case-studies/affirm-photography/';
        const ap = (n) => imgFigNat(AP + `Affirm_Photography_Assets_${n}.png`, `Affirm Photography — ${n}`);
        reel.appendChild(ap('01'));
        reel.appendChild(figRow(2, [ap('02'), ap('03')]));
        reel.appendChild(ap('04'));
        reel.appendChild(ap('05'));
        reel.appendChild(ap('06'));
        reel.appendChild(figRow(2, [ap('07'), ap('08')]));
        reel.appendChild(figRow(2, [ap('09'), ap('10')]));
        reel.appendChild(ap('11'));
      } else if (p.slug === 'affirm_product-marketing') {
        const APM = 'assets/case-studies/affirm-product-marketing/';
        reel.appendChild(videoFigNat(APM + 'Affirm_debit_01.mov', APM + 'Affirm_debit_01.png'));
        reel.appendChild(imgFigNat(APM + 'Affirm_debit_02.png', 'Affirm Debit+ — 02'));
        reel.appendChild(videoFigNat(APM + 'Affirm_debit_03.mov', APM + 'Affirm_debit_03.png'));
        reel.appendChild(videoFigNat(APM + 'Affirm_debit_04.mov', APM + 'Affirm_debit_04.png'));
        reel.appendChild(videoFigNat(APM + 'Affirm_debit_05.mov', APM + 'Affirm_debit_05.png'));
      } else if (p.slug === 'collective-health') {
        const CH = 'assets/case-studies/collective-health/';
        const chNat = (n) => imgFigNat(CH + `CH_${n}.png`, `Collective Health — ${n}`);
        reel.appendChild(chNat('01'));
        reel.appendChild(chNat('02'));
        reel.appendChild(chNat('03'));
        reel.appendChild(figRow(2, [chNat('04'), chNat('05')]));
        reel.appendChild(chNat('06'));
        reel.appendChild(figRow(2, [chNat('07'), chNat('08')]));
        reel.appendChild(chNat('09'));
        reel.appendChild(figRow(2, [chNat('10'), chNat('11')]));
        reel.appendChild(chNat('12'));
      } else if (p.slug === 'collective-health_open-enrollment') {
        const CHOE = 'assets/case-studies/collective-health-open-enrollment/';
        reel.appendChild(imgFig('wide', CHOE + 'CHOE_01.png', 'Open Enrollment — HR Email'));
        reel.appendChild(imgFig('wide', CHOE + 'CHOE_02.png', 'Open Enrollment — Awareness Materials'));
        reel.appendChild(imgFig('wide', CHOE + 'CHOE_03.png', 'Open Enrollment — OE Plan Info'));
        reel.appendChild(imgFig('wide', CHOE + 'CHOE_04.png', 'Open Enrollment — Onsite Presentation'));
      } else if (p.slug === 'collective-health_innovation-day') {
        const CHID = 'assets/case-studies/collective-health-innovation-day/';
        reel.appendChild(imgFig('wide', CHID + 'CH_innovation_01.png', 'Innovation Day — 01'));
        reel.appendChild(figRow(2, [
          imgFig('tall', CHID + 'CH_innovation_02.png', 'Innovation Day — 02'),
          imgFig('tall', CHID + 'CH_innovation_03.png', 'Innovation Day — 03')
        ]));
        reel.appendChild(imgFig('wide', CHID + 'CH_innovation_04.png', 'Innovation Day — 04'));
        reel.appendChild(imgFig('wide', CHID + 'CH_innovation_05.png', 'Innovation Day — 05'));
        reel.appendChild(imgFig('wide', CHID + 'CH_innovation_06.png', 'Innovation Day — 06'));
        const chidSplit = el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,1.4vw,20px);' });
        const chidLeft = el('div', { style: 'display:flex;flex-direction:column;gap:clamp(12px,1.4vw,20px);' });
        chidLeft.appendChild(imgFig('wide', CHID + 'CH_innovation_07.png', 'Innovation Day — 07'));
        chidLeft.appendChild(imgFig('wide', CHID + 'CH_innovation_08.png', 'Innovation Day — 08'));
        chidSplit.appendChild(chidLeft);
        const chidRight = el('figure', { class: 'fig fig--img reveal', style: 'aspect-ratio:auto;' });
        chidRight.appendChild(el('img', { src: CHID + 'CH_innovation_09.png', alt: 'Innovation Day — 09', loading: 'lazy' }));
        chidSplit.appendChild(chidRight);
        reel.appendChild(chidSplit);
      } else {
        reel.appendChild(fig(p, 'wide', 'Editorial hero'));
        reel.appendChild(figRow(2, [
          fig(p, 'tall', 'Detail'),
          fig(p, 'tall', 'Detail')
        ]));
        reel.appendChild(fig(p, 'wide', 'Billboard / environment'));
        reel.appendChild(figRow(3, [
          fig(p, 'square', 'Product'),
          fig(p, 'square', 'Product'),
          fig(p, 'square', 'Product')
        ]));
        reel.appendChild(fig(p, 'tight', 'System overview'));
      }
      cs.appendChild(reel);

      // Prev / Next
      const idx = window.PROJECTS.findIndex(x => x.slug === p.slug);
      const prev = window.PROJECTS[(idx - 1 + window.PROJECTS.length) % window.PROJECTS.length];
      const next = window.PROJECTS[(idx + 1) % window.PROJECTS.length];
      const nav = el('nav', { class: 'cs__nav' });
      const prevA = el('a', { class: 'prev', href: '#/' + prev.slug });
      prevA.insertAdjacentHTML('beforeend', '<svg class="cs__nav-arrow" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g clip-path="url(#clip0_879_3813)"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.532004 8.77126L7.71186 15.9511C8.00475 16.244 8.47962 16.244 8.77252 15.9511C9.06541 15.6582 9.06541 15.1833 8.77252 14.8905L2.87299 8.99093L15.422 8.99093C15.8363 8.99093 16.172 8.65514 16.172 8.24093C16.172 7.82672 15.8363 7.49093 15.422 7.49093L2.87299 7.49093L8.77252 1.59141C9.06541 1.29851 9.06541 0.823641 8.77252 0.530748C8.47962 0.237854 8.00475 0.237854 7.71186 0.530748L0.532004 7.7106C0.39628 7.84632 0.312334 8.03382 0.312333 8.24093C0.312333 8.34262 0.332572 8.43959 0.369242 8.52802C0.405842 8.61648 0.460096 8.69935 0.532004 8.77126Z" fill="#FFE9D2"/></g><defs><clipPath id="clip0_879_3813"><rect width="16.481" height="16.481" fill="white"/></clipPath></defs></svg> ');
      prevA.appendChild(document.createTextNode(prev.name));
      nav.appendChild(prevA);
      const nextA = el('a', { class: 'next', href: '#/' + next.slug }, next.name);
      nextA.insertAdjacentHTML('beforeend', ' <svg class="cs__nav-arrow" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g clip-path="url(#clip0_879_3824)"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.968 8.77126L8.78814 15.9511C8.49525 16.244 8.02038 16.244 7.72748 15.9511C7.43459 15.6582 7.43459 15.1833 7.72748 14.8905L13.627 8.99093L1.07796 8.99093C0.663745 8.99093 0.327958 8.65514 0.327958 8.24093C0.327959 7.82672 0.663745 7.49093 1.07796 7.49093L13.627 7.49093L7.72748 1.59141C7.43459 1.29851 7.43459 0.823641 7.72748 0.530748C8.02038 0.237854 8.49525 0.237854 8.78814 0.530748L15.968 7.7106C16.1037 7.84632 16.1877 8.03382 16.1877 8.24093C16.1877 8.34262 16.1674 8.43959 16.1308 8.52802C16.0942 8.61648 16.0399 8.69935 15.968 8.77126Z" fill="#FFE9D2"/></g><defs><clipPath id="clip0_879_3824"><rect width="16.481" height="16.481" fill="white"/></clipPath></defs></svg>');
      nav.appendChild(nextA);
      cs.appendChild(nav);

      cs.appendChild(el('div', { class: 'rule-stack' }));

      route.appendChild(cs);
    };
  }

  function fig(p, variant, label) {
    const f = el('figure', { class: `fig fig--${variant} reveal` });
    f.appendChild(el('div', { class: 'fig--placeholder', style: 'position:absolute;inset:0;' }, label));
    return f;
  }
  function imgFig(variant, src, alt) {
    const f = el('figure', { class: `fig fig--${variant} reveal fig--img` });
    const img = el('img', { src: src, alt: alt || '', loading: 'lazy' });
    f.appendChild(img);
    return f;
  }
  function imgFigNat(src, alt) {
    const f = el('figure', { class: 'fig fig--img reveal', style: 'aspect-ratio:auto;background:transparent;' });
    const img = el('img', { src: src, alt: alt || '', loading: 'lazy', style: 'height:auto;object-fit:contain;' });
    f.appendChild(img);
    return f;
  }
  function videoFig(variant, src, poster, alt) {
    const f = el('figure', { class: `fig fig--${variant} reveal fig--img` });
    const v = el('video', {
      src: src,
      autoplay: '',
      loop: '',
      muted: '',
      playsinline: '',
      preload: 'metadata',
      poster: poster || null,
      'aria-label': alt || ''
    });
    v.muted = true;
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    f.appendChild(v);
    return f;
  }
  function videoFigNat(src, poster) {
    const f = el('figure', { class: 'fig fig--img reveal', style: 'aspect-ratio:auto;background:transparent;' });
    const v = el('video', {
      src: src,
      autoplay: '',
      loop: '',
      muted: '',
      playsinline: '',
      preload: 'metadata',
      poster: poster || null,
      style: 'width:100%;height:auto;display:block;object-fit:contain;'
    });
    v.muted = true;
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    f.appendChild(v);
    return f;
  }
  function figRow(n, children) {
    const r = el('div', { class: `fig-row fig-row--${n}` });
    children.forEach(c => r.appendChild(c));
    return r;
  }

  function caseStudyCopy(p) {
    const overrides = {
      opendesk: `
        <p>OpenDesk is OpenStore\u2019s AI-powered customer support tool built to help brands respond faster, automate confidently, and unlock growth with actionable insights.</p>
        <p>The challenge was to create a brand identity that felt distinct from OpenStore, but still part of the family. As the design lead, I worked closely with the product, marketing, and stakeholder teams to establish a shared vision and created a logo that nods to OpenStore\u2019s geometric style and its negative space. The OpenDesk logo is a geometric representation of the letters \u2018O\u2019 and \u2018D\u2019, designed to evoke the concept of a toggle switch\u2014symbolizing the transformation from before to after using OpenDesk. From there, we developed the visual elements, including color palette, graphic style, and motion, to create a cohesive visual foundation that extends to the website and go-to-market assets such as emails, ads, and social media.</p>
      `,
      aetherflux: `
        <p>Aetherflux, a U.S. aerospace company founded by Baiju Bhatt (co-founder of Robinhood), is on a mission to commercialize space-based solar power.</p>
        <p>I had the privilege of working directly with the founder to translate his audacious vision into a visual identity. Inspired by Isaac Asimov\u2019s 1941 concept of space solar power, the visual direction pays homage to the visionary author\u2019s work and its era of science fiction.</p>
        <p>A dramatic, exaggerated logotype was paired with an enhanced version of the existing logo mark to create a strong visual identity. The overall design incorporated elements of drama, dynamism, and illustration from the era, and was extended to create Aetherflux\u2019s website in time for the company\u2019s launch announcement.</p>
      `,
      'openstore-shopping': `
        <p>OpenStore is the leading acquirer and operator of Shopify brands. To create a unified shopping experience, we launched a single destination for over 100,000 products from our 40+ brands.</p>
        <p>As a project and design lead, I collaborated with cross-functional teams, including design, product, engineering, marketing, operations, and supply chain, to align and design the shopping experience.</p>
        <p>A key component of this project was developing a new photography style to showcase a curated range of categories and products. The photography style was designed to reflect the vision of providing a joyful, effortless, and reliable shopping experience. It features a balanced, airy aesthetic that evokes brightness and artistry.</p>
        <p>(Photographer: Chloe Lukas)</p>
      `,
      'collective-health': `
        <p>Collective Health is a technology company dedicated to improving healthcare experiences for employers and their employees. They offer a comprehensive health benefits platform that integrates medical, dental, vision, pharmacy, and program partners into a single solution. This platform empowers individuals to better understand, navigate, and pay for their healthcare.</p>
        <p>As an art director and senior brand designer, I led visual communications to support Collective Health's mission of improving healthcare experiences. I worked on a range of projects, from creating sales collateral to developing B2B marketing materials for digital, events, and out-of-home channels. Additionally, I played a key role in reimagining the open enrollment experience for members, designing visuals for every touchpoint of the enrollment process.</p>
      `,
      'collective-health_open-enrollment': `
        <p>At Collective Health, we recognized the challenges of Open Enrollment. By reimagining the entire member journey, we designed a configurable, multi-touch launch campaign that included digital tools, in-office branding, print materials, innovative outreach and events, and human support. Our goal was to create a consistent and powerful experience across all touchpoints, focusing on easy-to-understand information about health benefits options. As a senior brand designer, I played a key role in reimagining the Open Enrollment experience and developing visuals to support every touchpoint.</p>
        <p>Collective Health was recognized by Fast Company as a finalist in the 2018 Innovation by Design Awards for our Open Enrollment program.</p>
      `,
      'collective-health_innovation-day': `
        <p>Collective Health Innovation Day is an annual event that brings together clients, partners, and industry leaders to learn from each other and shape the future of employer-driven healthcare.</p>
        <p>As the lead brand designer, I utilized a block motif to symbolize collaboration and the building of the future of employer-driven healthcare. This motif was then integrated into a cohesive visual system that spanned environmental design, print materials, and promotional merchandise.</p>
      `,
      'openstore': `
        <p>I joined OpenStore, a leading Shopify brand acquirer and operator, to spearhead their rebranding effort. With the logo already in place, I swiftly developed the foundational visual identity, including typography, color palette, and graphic style. This was essential for the timely launch of our new website.</p>
        <p>Unlike traditional, lengthy rebranding projects, our fast-paced startup environment demanded a more agile approach. To maximize impact with limited resources, we prioritized redesigning four high-traffic web pages, while simultaneously testing visual elements like color palette, typography, and graphic styles. This strategic approach allowed us to introduce our new visual identity and establish a foundation for future iterations.</p>
        <p>Despite the constraints, I\u2019m incredibly proud of the team\u2019s ability to adapt and deliver in just eight weeks. While this wasn\u2019t a \u201Cfully packaged rebrand\u201D, it marks a significant milestone for OpenStore.</p>
      `,
      'affirm_photography': `
        <p>In my 3.5 years at Affirm, I\u2019ve led numerous photoshoots as an art director and lead designer. These projects spanned various categories, including brand, campaign, web, and marketing. As the project lead, I was responsible for developing creative briefs, selecting photographers, providing on-set art direction, conducting post-production feedback sessions, and integrating the final imagery across multiple channels.</p>
        <p>All photography was grounded in Affirm\u2019s \u201Cworlds colliding\u201D concept, which highlights how desired products and experiences can seamlessly integrate into consumers\u2019 lives. Striking a balance between inspiration and attainability was crucial, as we explored the intersection of wants and reality. Each photoshoot extended the art direction to suit its specific goals and applications, while maintaining a cohesive overall vision.</p>
        <p>(Photographers: Gregory Reid, Stephanie Gonot, LM Chabot)</p>
      `,
      'affirm_product-marketing': `
        <p>Affirm Debit+ was a new debit card that offered users the flexibility to pay for purchases immediately or over time through the Affirm app. This innovative approach combined traditional debit card functionality with flexible payment options, making it a significant player in the evolving landscape of consumer finance.</p>
        <p>As an art director and lead designer, I played a crucial role in the product marketing visual design for Debit+. I worked closely with product, marketing, and stakeholder teams to establish the overall art direction for visual communications. I designed key visuals that could be seamlessly integrated across social media, email, web, and marketing campaigns.</p>
        <p>Beyond Debit+, I\u2019ve contributed to various product marketing initiatives, leveraging visual communication to enhance user understanding.</p>
      `,
      'affirm_rebrand': `
        <p>To elevate Affirm\u2019s position as the industry leader in buy now, pay later industry, we undertook a comprehensive rebranding initiative. As the lead designer, I collaborated closely with product, marketing, sales, and C-suite executives to develop a visually compelling brand identity that aligned with our new brand strategy.</p>
        <p>My responsibilities encompassed crafting and aligning compelling visual concepts, leading the creation of new visual tools such as color palettes, typography, photography, and illustration guidelines, and ensuring seamless implementation across various touchpoints, including merchants, partners, and consumers.</p>
        <p>Despite the significant challenge of implementing a new brand across diverse audiences, our team successfully executed a smooth transition, guaranteeing a consistent and seamless brand experience.</p>
      `,
      gumdrop: `
        <p>Gumdrop is OpenStore\u2019s new creator marketplace, designed to streamline personalized collaborations between brands and creators. Rather than relying on endless DMs, Gumdrop brings these connections directly to consumers.</p>
        <p>As a new platform targeting Gen Z and Millennial micro-influencers, our primary goal was to establish Gumdrop as the premier destination for collaborative opportunities. Inspired by the fluid and expressive nature of youth, I crafted a visual identity that embodies the spirit of risk-taking and exploration.</p>
        <p>The logo, a playful nod to the brand name, and the vibrant color palette convey a sense of fun and daring. Working closely with our product designer, I translated this brand identity into a cohesive design system, ensuring a seamless experience from marketing materials to the product interface.</p>
      `
    };
    if (overrides[p.slug]) return overrides[p.slug];
    // Generic frame so structure is right even without Figma-specific copy
    return `
      <p>${p.name} — ${p.roles.toLowerCase()}. A brand program built to move at the speed of the product, balancing editorial craft with operational rigor.</p>
      <p>Work shown here reflects the end-to-end system: identity foundations, product marketing surfaces, and field-built collateral that scales across channels.</p>
    `;
  }

  function renderNotFound(route) {
    route.appendChild(el('section', {
      style: 'padding:120px var(--pad-x);font-family:var(--font-mono);color:var(--fg);'
    }, 'Not found. ', el('a', { href: '#/work', style: 'text-decoration:underline;' }, 'Back to work')));
  }

  /* ---------- Reveals on scroll ---------- */
  function initReveals(root) {
    const targets = root.querySelectorAll('.reveal, .fig');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach(t => io.observe(t));
  }

  /* ---------- Shared visuals ---------- */
  function wordmarkSVG() {
    // Uses the uploaded SVG (sized to full width)
    return `
      <svg viewBox="0 0 1392 207" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-label="Avery Kim">
        <g>
          <path d="M0 165.555L96.5739 0H124.166L220.74 165.555H196.597L175.902 127.616H44.8379L24.1435 165.555H0ZM55.1851 110.37H165.555L110.37 13.7963L55.1851 110.37Z"/>
          <path d="M522.287 128.683C522.287 137.963 520.891 145.244 518.127 150.555C515.362 155.865 511.146 159.752 505.453 162.188C499.786 164.625 492.532 166.185 483.745 166.869C474.931 167.554 464.475 167.882 452.321 167.882C438.442 167.882 426.699 167.17 417.009 165.774C407.346 164.378 399.544 161.504 393.632 157.152C387.692 152.799 383.394 146.284 380.711 137.58C378.029 128.875 376.66 117.268 376.66 102.76C376.66 88.2524 377.974 77.3851 380.602 68.9267C383.23 60.4409 387.473 54.0628 393.385 49.7378C399.271 45.4128 407.017 42.5659 416.626 41.1152C426.206 39.6917 437.95 38.9526 451.828 38.9526C467.705 38.9526 480.844 40.075 491.273 42.2922C501.703 44.5095 509.477 48.7524 514.595 55.0209C519.742 61.2621 522.287 70.4322 522.287 82.504V109.138H397.464C397.546 118.336 398.176 125.699 399.408 131.229C400.639 136.758 403.076 140.919 406.744 143.739C410.412 146.531 415.886 148.392 423.168 149.295C430.449 150.199 440.167 150.637 452.321 150.637C463.243 150.637 472.057 150.418 478.791 149.98C485.497 149.542 490.616 148.611 494.093 147.133C497.569 145.655 499.923 143.465 501.155 140.509C502.387 137.552 502.989 133.61 502.989 128.656H522.287V128.683ZM451.801 56.2527C440.085 56.2527 430.668 56.6907 423.496 57.5393C416.352 58.3879 410.904 60.0577 407.154 62.5486C403.404 65.0396 400.886 68.7077 399.544 73.6076C398.203 78.5074 397.519 84.9128 397.437 92.9059H502.414V82.5587C502.414 77.3851 501.812 73.0875 500.635 69.6658C499.458 66.2441 497.131 63.5615 493.682 61.5906C490.233 59.6197 485.142 58.2236 478.435 57.4298C471.701 56.636 462.832 56.2527 451.746 56.2527H451.801Z"/>
          <path d="M551.168 165.555V41.3887H571.862V58.5246C574.162 54.8565 576.488 51.818 578.815 49.3544C581.142 46.8908 584.208 44.9747 587.985 43.5239C591.763 42.1004 596.882 41.0602 603.342 40.458C609.802 39.8558 618.315 39.5547 628.881 39.5547V56.9095C614.647 56.9095 603.643 57.4022 595.842 58.4151C588.04 59.4279 582.456 61.125 579.089 63.5339C575.722 65.9428 573.669 69.255 572.957 73.4979C572.246 77.7408 571.89 83.1334 571.89 89.6757V165.555H551.195H551.168Z"/>
          <path d="M674.703 206.944V189.699C682.093 189.699 688.225 189.535 693.07 189.206C697.915 188.878 701.967 187.974 705.252 186.524C708.536 185.073 711.465 182.664 714.093 179.352C716.721 176.039 719.458 171.441 722.333 165.555H715.434L646.453 41.3889H670.159L729.231 150.144L778.914 41.3889H803.167L740.208 172.454C737.415 178.284 734.514 183.348 731.53 187.646C728.546 191.971 724.824 195.557 720.334 198.431C715.845 201.305 709.96 203.44 702.706 204.836C695.452 206.232 686.117 206.944 674.675 206.944H674.703Z"/>
          <path d="M893.938 165.555V0H914.632V72.4304H942.115L1049.15 0H1080.19L962.919 81.0531L1083.64 165.555H1052.59L942.224 89.6758H914.632V165.555H893.938Z"/>
          <path d="M1104.33 20.6944V0H1125.03V20.6944H1104.33ZM1104.33 165.555V48.287H1125.03V165.555H1104.33Z"/>
          <path d="M1153.05 165.555V41.3888H1173.75V56.8001C1176.84 52.6393 1180.54 49.1355 1184.86 46.3434C1189.19 43.5513 1194.69 41.4435 1201.4 40.0475C1208.1 38.6514 1216.73 37.9397 1227.21 37.9397C1240.21 37.9397 1250.81 39.6916 1259.02 43.2228C1267.2 46.754 1273.25 52.8036 1277.14 61.4262C1280.67 55.9789 1284.89 51.4896 1289.87 48.0132C1294.85 44.5368 1301.06 41.9636 1308.56 40.3486C1316.06 38.7336 1325.32 37.9124 1336.32 37.9124C1349.41 37.9124 1360.03 39.6916 1368.24 43.2502C1376.42 46.8088 1382.45 52.8583 1386.3 61.3989C1390.14 69.9394 1392.08 81.6553 1392.08 96.5465V165.528H1371.39V96.5465C1371.39 85.1865 1370.21 76.5638 1367.83 70.6237C1365.45 64.6837 1361.53 60.6324 1356.03 58.4425C1350.53 56.2526 1343.11 55.1577 1333.77 55.1577C1315.46 55.1577 1302.4 57.8403 1294.6 63.2329C1286.8 68.6255 1282.91 77.4124 1282.91 89.6484V89.5389C1283 91.7561 1283.02 94.1103 1283.02 96.5465V165.528H1262.33V96.5465C1262.33 85.1865 1261.15 76.5638 1258.77 70.6237C1256.39 64.6837 1252.48 60.6324 1246.97 58.4425C1241.47 56.2526 1234.05 55.1577 1224.72 55.1577C1206.41 55.1577 1193.35 57.8403 1185.55 63.2329C1177.75 68.6255 1173.86 77.4124 1173.86 89.6484V165.528H1153.16L1153.05 165.555Z"/>
          <path d="M283.18 151.759L220.111 41.3889H196.953L269.384 165.555H296.976L369.407 41.3889H346.248L283.18 151.759Z"/>
        </g>
      </svg>
    `;
  }

  function projectLogoMark(p) {
    // Lightweight logo glyph per project — typographic marks w/ no copyrighted recreation
    const styles = `
      display:flex;align-items:center;justify-content:center;width:100%;height:100%;
      font-family: var(--font-sans);
      color: #fff; mix-blend-mode: normal;
    `;
    switch (p.slug) {
      case 'opendesk':
        return `<div style="${styles}">
          <div style="display:flex;align-items:center;gap:10px;color:#14213D">
            <svg width="38" height="38" viewBox="0 0 40 40"><circle cx="14" cy="20" r="12" fill="#14213D"/><circle cx="26" cy="20" r="12" fill="#14213D" opacity="0.55"/></svg>
            <span style="font-size:28px;font-weight:600;letter-spacing:-0.02em">OpenDesk</span>
          </div>
        </div>`;
      case 'aetherflux':
        return `<div style="${styles};color:#F1E6D0;font-size:26px;letter-spacing:0.26em;font-weight:500">AETHERFLUX</div>`;
      case 'openstore-shopping':
        return `<div style="${styles};color:#1A1612;font-size:20px;letter-spacing:0.22em;font-weight:500">OPENSTORE</div>`;
      case 'gumdrop':
        return `<div style="${styles};color:#2A211A;font-size:38px;font-weight:500;font-style:italic;letter-spacing:-0.02em">gumdrop</div>`;
      case 'openstore':
        return `<div style="${styles};color:#1A1612;font-size:22px;letter-spacing:0.22em;font-weight:500">OPENSTORE</div>`;
      case 'affirm_photography':
      case 'affirm_rebrand':
        return `<div style="${styles};color:#F4E7D3;font-size:40px;font-weight:500;letter-spacing:-0.02em;font-style:italic">affirm</div>`;
      case 'affirm_product-marketing':
        return `<div style="${styles};color:#F4E7D3;font-size:28px;font-weight:500;letter-spacing:-0.01em;text-align:center;line-height:1.1">
          Hello,<br/>Debit+
        </div>`;
      case 'collective-health':
      case 'collective-health_open-enrollment':
        return `<div style="${styles};color:#E9EEF8;font-size:18px;letter-spacing:0.18em;font-weight:500;text-align:center;line-height:1.2">
          COLLECTIVE<br/>HEALTH
        </div>`;
      case 'collective-health_innovation-day':
        return `<div style="${styles};color:#E9EEF8;font-size:64px;font-weight:500;letter-spacing:-0.02em">CHID</div>`;
      default:
        return `<div style="${styles};font-size:18px">${p.name}</div>`;
    }
  }

  window.addEventListener('hashchange', navigate);
  window.addEventListener('load', navigate);
})();
