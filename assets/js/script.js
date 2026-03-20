// ============================================================
// VARIÁVEIS GLOBAIS DO CARROSSEL
// ============================================================
const cardWidth = 320;
const gap = 16;

// ============================================================
// CARROSSEL — rolar e verificar posição das setas
// ============================================================
function scrollProjects(sectionId, direction) {
  const container = document.querySelector(`#${sectionId} .scrollable-projects`);
  if (!container) return;
  container.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' });
  setTimeout(() => checkScrollPosition(sectionId), 500);
}

function checkScrollPosition(sectionId) {
  const container  = document.querySelector(`#${sectionId} .scrollable-projects`);
  const leftArrow  = document.querySelector(`#${sectionId} .arrowbtn-left`);
  const rightArrow = document.querySelector(`#${sectionId} .arrowbtn-right`);
  if (!container || !leftArrow || !rightArrow) return;

  const { scrollLeft, scrollWidth, clientWidth } = container;

  leftArrow.style.opacity       = scrollLeft <= 1 ? '0.3' : '1';
  leftArrow.style.pointerEvents = scrollLeft <= 1 ? 'none' : 'auto';

  const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  rightArrow.style.opacity       = atEnd ? '0.3' : '1';
  rightArrow.style.pointerEvents = atEnd ? 'none' : 'auto';
}

// ============================================================
// TRADUÇÃO
// ============================================================
function translatePage(lang) {
  const dictionary = translations[lang];
  if (!dictionary) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && dictionary[key]) {
      el.tagName === 'TITLE'
        ? (el.textContent = dictionary[key])
        : (el.innerHTML = dictionary[key]);
    }
  });

  document.documentElement.lang = lang;
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  translatePlaceholders(lang);
}

function translatePlaceholders(lang) {
  const dictionary = translations[lang];
  if (!dictionary) return;
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && dictionary[key]) el.placeholder = dictionary[key];
  });
}

// ============================================================
// SEÇÃO DEV — GitHub API
// ============================================================
const GITHUB_USER    = 'victorhasse';
const CARDS_PER_PAGE = 6;
let allRepos         = [];
let visibleCount     = CARDS_PER_PAGE;

// Repos de colab que quero exibir manualmente
const COLLAB_REPOS = [
  'lmitsuol/UNISOULS',
  // adicionar outros repos aqui futuramente se eu precisar
];

const LANG_COLORS = {
  'GDScript':   'lang-godot',
  'Godot':      'lang-godot',
  'Python':     'lang-python',
  'JavaScript': 'lang-javascript',
  'TypeScript': 'lang-typescript',
  'HTML':       'lang-html',
  'CSS':        'lang-css',
  'Java':       'lang-java',
  'C#':         'lang-csharp',
  'C++':        'lang-cpp',
};

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(document.documentElement.lang || 'pt-BR', {
    month: 'short',
    year:  'numeric',
  });
}

function buildCard(repo) {
  const langClass = LANG_COLORS[repo.language] || 'lang-default';
  const desc      = repo.description || '—';
  const date      = formatDate(repo.pushed_at);
  const collabBadge = repo._isCollab
    ? `<span class="dev-card__collab-badge">colab</span>`
    : '';

  const topicsHTML = (repo.topics && repo.topics.length)
    ? repo.topics.slice(0, 4).map(t =>
        `<span class="dev-card__topic">${t}</span>`
      ).join('')
    : '';

  const langHTML = repo.language
    ? `<span class="dev-card__lang">
         <span class="dev-card__lang-dot ${langClass}"></span>
         ${repo.language}
       </span>`
    : '<span></span>';

  return `
    <a
      class="dev-card"
      href="${repo.html_url}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="${repo.name}"
    >
      <div class="dev-card__header">
        <span class="dev-card__name">${repo.name} ${collabBadge}</span>
        <svg class="dev-card__arrow" viewBox="0 0 16 16" fill="none"
             stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 13L13 3M13 3H6M13 3v7"/>
        </svg>
      </div>

      <p class="dev-card__desc">${desc}</p>

      ${topicsHTML
        ? `<div class="dev-card__topics">${topicsHTML}</div>`
        : ''}

      <div class="dev-card__footer">
        ${langHTML}
        <span class="dev-card__date">${date}</span>
      </div>
    </a>
  `;
}

function renderCards() {
  const grid        = document.getElementById('dev-grid');
  const moreBtnWrap = document.getElementById('dev-more-wrapper');

  const visible = allRepos.slice(0, visibleCount);
  grid.innerHTML = visible.map(buildCard).join('');

  moreBtnWrap.style.display = visibleCount < allRepos.length ? 'flex' : 'none';
}

async function fetchRepos() {
  const loading = document.getElementById('dev-loading');
  const error   = document.getElementById('dev-error');
  const grid    = document.getElementById('dev-grid');

  loading.style.display = 'flex';
  error.style.display   = 'none';
  grid.style.display    = 'none';

  try {
    // 1. Meus próprios repos
    const ownRes = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=100`,
      { headers: { 'Accept': 'application/vnd.github.mercy-preview+json' } }
    );
    if (!ownRes.ok) throw new Error(`HTTP ${ownRes.status}`);
    const ownData = await ownRes.json();

    // 2. Repos de colab hardcodados
    const collabResults = await Promise.all(
      COLLAB_REPOS.map(async (repoName) => {
        const res = await fetch(
          `https://api.github.com/repos/${repoName}`,
          { headers: { 'Accept': 'application/vnd.github.mercy-preview+json' } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return { ...data, _isCollab: true };
      })
    );

    const collabRepos = collabResults.filter(Boolean);

    // 3. Junta e ordena por data
    const combined = [
      ...ownData.filter(r => !r.fork), // meus repos (sem forks simples)
      ...collabRepos                   // repos de colaboração
    ];

    allRepos = combined.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    loading.style.display = 'none';
    grid.style.display    = 'grid';
    renderCards();

  } catch (err) {
    console.error('GitHub API error:', err);
    loading.style.display = 'none';
    error.style.display   = 'block';
  }
}

// ============================================================
// INICIALIZAÇÃO — um único DOMContentLoaded
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // ----------------------------------------------------------
  // A. TEMA
  // ----------------------------------------------------------
  const sunIcons  = [document.getElementById('icon-sun'),  document.getElementById('icon-sun-m')];
  const moonIcons = [document.getElementById('icon-moon'), document.getElementById('icon-moon-m')];

  function applyTheme(dark) {
    body.classList.toggle('dark-mode', dark);
    sunIcons.forEach(el  => { if (el) el.style.display = dark ? 'none'  : 'block'; });
    moonIcons.forEach(el => { if (el) el.style.display = dark ? 'block' : 'none';  });
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  function toggleTheme() {
    applyTheme(!body.classList.contains('dark-mode'));
  }

  const savedTheme  = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));

  const themeBtn = document.getElementById('toggle-theme');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const themeBtnMobile = document.getElementById('toggle-theme-mobile');
  if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);

  // ----------------------------------------------------------
  // B. IDIOMA
  // ----------------------------------------------------------
  const supportedLangs = Object.keys(translations);
  const defaultLang    = 'pt';

  function setLang(lang) {
    if (!supportedLangs.includes(lang)) lang = defaultLang;
    localStorage.setItem('lang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    translatePage(lang);
  }

  document.addEventListener('click', e => {
    if (e.target.classList.contains('lang-btn')) {
      setLang(e.target.dataset.lang);
    }
  });

  setLang(localStorage.getItem('lang') || defaultLang);

  // ----------------------------------------------------------
  // C. HAMBÚRGUER / MENU MOBILE
  // ----------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu   = document.getElementById('mobile-menu');
  const navOverlay   = document.getElementById('nav-overlay');

  function openMobileMenu() {
    hamburgerBtn.classList.add('is-active');
    mobileMenu.classList.add('open');
    navOverlay.classList.add('visible');
    body.classList.add('menu-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    hamburgerBtn.classList.remove('is-active');
    mobileMenu.classList.remove('open');
    navOverlay.classList.remove('visible');
    body.classList.remove('menu-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // ----------------------------------------------------------
  // D. BARRA DE PROGRESSO DE SCROLL
  // ----------------------------------------------------------
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%';
    }, { passive: true });
  }

  // ----------------------------------------------------------
  // E. CARROSSEL — inicialização
  // ----------------------------------------------------------
  ['dev', 'design'].forEach(id => {
    const scrollable = document.querySelector(`#${id} .scrollable-projects`);
    if (scrollable) {
      checkScrollPosition(id);
      scrollable.addEventListener('scroll', () => checkScrollPosition(id));
    }
  });

  // ----------------------------------------------------------
  // F. SEÇÃO DEV — GitHub API
  // ----------------------------------------------------------
  fetchRepos();

  const moreBtn = document.getElementById('dev-more-btn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      visibleCount += CARDS_PER_PAGE;
      renderCards();
    });
  }

  const retryBtn = document.getElementById('dev-retry');
  if (retryBtn) {
    retryBtn.addEventListener('click', fetchRepos);
  }

  // ============================================================
  // SEÇÃO CONTATO — Formspree + feedback + placeholders i18n
  // ============================================================

  // ----------------------------------------------------------
  // G. FORMULÁRIO DE CONTATO
  // ----------------------------------------------------------
  const contactForm     = document.getElementById('contact-form');
  const contactSubmit   = document.getElementById('contact-submit');
  const contactFeedback = document.getElementById('contact-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Desabilita botão e mostra loading
      contactSubmit.disabled = true;
      const submitText = contactSubmit.querySelector('.contact-submit__text');
      const originalText = submitText.textContent;
      submitText.textContent = '...';

      contactFeedback.style.display = 'none';
      contactFeedback.className = 'contact-feedback';

      try {
        const formData = new FormData(contactForm);
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          // Sucesso
          const lang = localStorage.getItem('lang') || 'pt';
          contactFeedback.textContent = translations[lang]?.contact_success
            || 'Mensagem enviada! Entrarei em contato em breve.';
          contactFeedback.classList.add('success');
          contactFeedback.style.display = 'block';
          contactForm.reset();
        } else {
          throw new Error('Formspree error');
        }
      } catch {
        const lang = localStorage.getItem('lang') || 'pt';
        contactFeedback.textContent = translations[lang]?.contact_error
          || 'Ocorreu um erro. Tente novamente ou envie um e-mail diretamente.';
        contactFeedback.classList.add('error');
        contactFeedback.style.display = 'block';
      } finally {
        contactSubmit.disabled = false;
        submitText.textContent = originalText;
      }
    });
  }

});