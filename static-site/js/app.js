/** ENENI Static — thème, auth, i18n, navbar, panier */
const ENENI = {
  lang: localStorage.getItem('eneni_lang') || 'fr',
  theme: localStorage.getItem('eneni_theme') || 'green',

  i18n: {
    fr: {
      nav: { dashboard: 'Tableau de bord', courses: 'Cours', exams: 'Examens', shop: 'Boutique', bulletin: 'Bulletin', logout: 'Déconnexion', notifications: 'Notifications', markAllRead: 'Tout marquer lu', noNotifications: 'Aucune notification.' },
      auth: { platform_desc: 'Plateforme Nationale d\'Éducation — Madagascar' },
    },
    en: {
      nav: { dashboard: 'Dashboard', courses: 'Courses', exams: 'Exams', shop: 'Shop', bulletin: 'Report', logout: 'Logout', notifications: 'Notifications', markAllRead: 'Mark all read', noNotifications: 'No notifications.' },
      auth: { platform_desc: 'National Education Platform — Madagascar' },
    },
    mg: {
      nav: { dashboard: 'Tontolon\'asa', courses: 'Fianarana', exams: 'Fanadinana', shop: 'Fivarotana', bulletin: 'Taratasy', logout: 'Mivoaka', notifications: 'Fampahafantarana', markAllRead: 'Hamaky daholo', noNotifications: 'Tsy misy fampahafantarana.' },
    },
  },

  init() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.initThemeSwitcher();
    this.initLangSwitcher();
    if (document.getElementById('app-navbar')) this.renderNavbar();
    this.renderPageNumber();
    lucide?.createIcons();
  },

  t(key) {
    const parts = key.split('.');
    let v = this.i18n[this.lang];
    for (const p of parts) v = v?.[p];
    return v || key;
  },

  getUser() {
    try { return JSON.parse(sessionStorage.getItem('eneni_user')); } catch { return null; }
  },

  setUser(user) {
    sessionStorage.setItem('eneni_user', JSON.stringify(user));
  },

  logout() {
    sessionStorage.removeItem('eneni_user');
    sessionStorage.removeItem('eneni_token');
    window.location.href = 'index.html';
  },

  requireAuth(redirect = 'login.html') {
    if (!this.getUser()) {
      window.location.href = redirect;
      return false;
    }
    return true;
  },

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('eneni_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  setLang(lang) {
    this.lang = lang;
    localStorage.setItem('eneni_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val !== key) el.textContent = val;
    });
  },

  initThemeSwitcher() {
    document.querySelectorAll('[data-theme-set]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.themeSet);
        document.querySelectorAll('[data-theme-set]').forEach(b => b.classList.toggle('active', b.dataset.themeSet === this.theme));
      });
      btn.classList.toggle('active', btn.dataset.themeSet === this.theme);
    });
  },

  initLangSwitcher() {
    document.querySelectorAll('[data-lang-set]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLang(btn.dataset.langSet);
        document.querySelectorAll('[data-lang-set]').forEach(b => b.classList.toggle('active', b.dataset.langSet === this.lang));
      });
      btn.classList.toggle('active', btn.dataset.langSet === this.lang);
    });
  },

  getCart() {
    try { return JSON.parse(localStorage.getItem('eneni_cart') || '[]'); } catch { return []; }
  },

  saveCart(cart) {
    localStorage.setItem('eneni_cart', JSON.stringify(cart));
  },

  addToCart(product) {
    const cart = this.getCart();
    const ex = cart.find(p => p.id === product.id);
    if (ex) ex.qty++; else cart.push({ ...product, qty: 1 });
    this.saveCart(cart);
    this.showToast('Ajouté au panier');
    return cart;
  },

  pageMap: {
    'index.html': 1, 'dashboard.html': 2, 'courses.html': 3,
    'course-player.html': 4, 'exams.html': 5, 'exam.html': 6,
    'bulletin.html': 7, 'corrections.html': 8, 'shop.html': 9,
  },

  renderPageNumber() {
    const file = window.location.pathname.split('/').pop() || 'index.html';
    const num = this.pageMap[file];
    if (!num) return;
    let el = document.getElementById('page-number-badge');
    if (!el) {
      el = document.createElement('div');
      el.id = 'page-number-badge';
      el.style.cssText = 'position:fixed;bottom:1rem;right:1rem;z-index:99;background:var(--color-primary);color:white;font-size:0.65rem;font-weight:700;padding:0.25rem 0.625rem;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,0.15);opacity:0.7;pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent = `${num} / 9`;
  },

  showToast(msg) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  },

  formatMGA(n) {
    return new Intl.NumberFormat('fr-MG').format(n) + ' Ar';
  },

  renderNavbar() {
    const user = this.getUser();
    if (!user) return;
    const page = document.body.dataset.page || '';
    const isStudent = user.type_utilisateur === 'ETUDIANT';

    const links = [
      { key: 'dashboard', href: 'dashboard.html', icon: 'layout-dashboard' },
      { key: 'courses', href: 'courses.html', icon: 'book-open' },
      { key: 'exams', href: 'exams.html', icon: 'file-text' },
      ...(isStudent ? [{ key: 'bulletin', href: 'bulletin.html', icon: 'award' }] : []),
      { key: 'shop', href: 'shop.html', icon: 'shopping-bag' },
    ];

    const nav = document.getElementById('app-navbar');
    const unread = (ENENI_DATA?.notifications || []).filter(n => !n.read).length;

    nav.innerHTML = `
      <nav class="navbar">
        <div class="navbar-inner">
          <a href="dashboard.html" class="navbar-logo">
            <div class="logo-icon">EN</div>
            <span>EN<span class="text-gradient">ENI</span></span>
          </a>
          <div class="nav-links">
            ${links.map(l => `
              <a href="${l.href}" class="nav-link ${page === l.key ? 'active' : ''}">
                <i data-lucide="${l.icon}" style="width:16px;height:16px"></i>
                <span data-i18n="nav.${l.key}">${this.t('nav.' + l.key)}</span>
              </a>
            `).join('')}
          </div>
          <div class="nav-actions">
            <div class="dropdown">
              <button class="icon-btn" id="theme-btn" title="Thème">
                <i data-lucide="palette" style="width:18px;height:18px"></i>
              </button>
              <div class="dropdown-menu" id="theme-menu">
                <button class="dropdown-item ${this.theme === 'green' ? 'active' : ''}" data-theme-set="green">🟢 Institutionnel</button>
                <button class="dropdown-item ${this.theme === 'dark' ? 'active' : ''}" data-theme-set="dark">🌙 Sombre</button>
                <button class="dropdown-item ${this.theme === 'light' ? 'active' : ''}" data-theme-set="light">☀️ Clair</button>
              </div>
            </div>
            <div class="dropdown">
              <button class="icon-btn" id="lang-btn" title="Langue">
                <i data-lucide="globe" style="width:18px;height:18px"></i>
              </button>
              <div class="dropdown-menu" id="lang-menu">
                <button class="dropdown-item ${this.lang === 'fr' ? 'active' : ''}" data-lang-set="fr">Français</button>
                <button class="dropdown-item ${this.lang === 'en' ? 'active' : ''}" data-lang-set="en">English</button>
                <button class="dropdown-item ${this.lang === 'mg' ? 'active' : ''}" data-lang-set="mg">Malagasy</button>
              </div>
            </div>
            <div class="dropdown">
              <button class="icon-btn" id="notif-btn">
                <i data-lucide="bell" style="width:18px;height:18px"></i>
                ${unread ? `<span class="badge-count">${unread > 9 ? '9+' : unread}</span>` : ''}
              </button>
              <div class="notif-panel" id="notif-panel">
                <div style="padding:0.75rem 1rem;border-bottom:1px solid var(--border-glass);display:flex;justify-content:space-between;align-items:center">
                  <strong style="font-size:0.875rem" data-i18n="nav.notifications">${this.t('nav.notifications')}</strong>
                  <button id="mark-all-read" style="font-size:0.75rem;color:var(--color-primary);background:none;border:none;cursor:pointer" data-i18n="nav.markAllRead">${this.t('nav.markAllRead')}</button>
                </div>
                <div id="notif-list"></div>
              </div>
            </div>
            <div class="hidden md-block" style="display:none" id="profile-chip">
              <span style="font-size:0.75rem;color:var(--text-muted)">${user.prenom} ${user.nom}</span>
            </div>
            <button class="btn-ghost" style="padding:0.5rem 0.75rem;font-size:0.75rem" onclick="ENENI.logout()">
              <i data-lucide="log-out" style="width:14px;height:14px"></i>
            </button>
            <button class="icon-btn mobile-menu-btn" id="mobile-menu-btn">
              <i data-lucide="menu" style="width:20px;height:20px"></i>
            </button>
          </div>
        </div>
      </nav>
      <div class="mobile-drawer" id="mobile-drawer">
        <div class="mobile-drawer-content">
          <button id="close-mobile" style="background:none;border:none;cursor:pointer;margin-bottom:1rem;color:var(--text-primary)">
            <i data-lucide="x" style="width:24px;height:24px"></i>
          </button>
          ${links.map(l => `<a href="${l.href}" class="nav-link" style="margin-bottom:0.5rem">${this.t('nav.' + l.key)}</a>`).join('')}
        </div>
      </div>
    `;

    this.initThemeSwitcher();
    this.initLangSwitcher();
    this._bindNavbarEvents();
    this._renderNotifications();
    if (window.innerWidth >= 768) document.getElementById('profile-chip').style.display = 'block';
    lucide?.createIcons();
  },

  _bindNavbarEvents() {
    const toggle = (menuId, btnId) => {
      const menu = document.getElementById(menuId);
      const btn = document.getElementById(btnId);
      btn?.addEventListener('click', e => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown-menu, .notif-panel').forEach(m => { if (m.id !== menuId) m.classList.remove('open'); });
        menu?.classList.toggle('open');
      });
    };
    toggle('theme-menu', 'theme-btn');
    toggle('lang-menu', 'lang-btn');
    toggle('notif-panel', 'notif-btn');
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu, .notif-panel').forEach(m => m.classList.remove('open'));
    });
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => document.getElementById('mobile-drawer')?.classList.add('open'));
    document.getElementById('close-mobile')?.addEventListener('click', () => document.getElementById('mobile-drawer')?.classList.remove('open'));
    document.getElementById('mark-all-read')?.addEventListener('click', () => {
      ENENI_DATA.notifications.forEach(n => n.read = true);
      this._renderNotifications();
    });
  },

  _renderNotifications() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    const notifs = ENENI_DATA?.notifications || [];
    if (!notifs.length) {
      list.innerHTML = `<p style="text-align:center;padding:2rem;font-size:0.875rem;color:var(--text-muted)">${this.t('nav.noNotifications')}</p>`;
      return;
    }
    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <p style="font-size:0.75rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-primary)">${n.title}</p>
        <p style="font-size:0.75rem;margin:0;color:var(--text-muted)">${n.message}</p>
      </div>
    `).join('');
    list.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const n = ENENI_DATA.notifications.find(x => x.id == el.dataset.id);
        if (n) n.read = true;
        this._renderNotifications();
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => ENENI.init());
