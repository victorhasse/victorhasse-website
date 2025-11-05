// --- VARIÁVEIS GLOBAIS ---
// Funções de rolagem de carrossel usam estas constantes
const cardWidth = 320; 
const gap = 16; 
// O objeto 'translations' é assumido como carregado do seu 'translations.js'

// ----------------------------------------------------------------------
// FUNÇÕES AUXILIARES (DEFINIDAS FORA DO DOMContentLoaded)
// ----------------------------------------------------------------------

// Função para rolar o carrossel dos projetos
function scrollProjects(sectionId, direction) {
    const scrollContainer = document.querySelector(`#${sectionId} .scrollable-projects`);
    if (!scrollContainer) return;
    
    const scrollAmount = cardWidth + gap;
    
    scrollContainer.scrollBy({
        left: direction * scrollAmount, 
        behavior: 'smooth' 
    });

    setTimeout(() => {
        checkScrollPosition(sectionId);
    }, 500); 
}

// Função para verificar a posição do carrossel (Desabilitar Setas)
function checkScrollPosition(sectionId) {
    const scrollContainer = document.querySelector(`#${sectionId} .scrollable-projects`);
    if (!scrollContainer) return;
    
    const leftArrow = document.querySelector(`#${sectionId} .arrowbtn-left`);
    const rightArrow = document.querySelector(`#${sectionId} .arrowbtn-right`);

    const scrollLeft = scrollContainer.scrollLeft;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;

    // Garante que os seletores de seta existem antes de tentar usar o estilo
    if (!leftArrow || !rightArrow) return; 

    // INÍCIO do Scroll
    if (scrollLeft <= 1) {
        leftArrow.style.opacity = '0.3';
        leftArrow.style.pointerEvents = 'none';
    } else {
        leftArrow.style.opacity = '1';
        leftArrow.style.pointerEvents = 'auto';
    }

    // FIM do Scroll
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
        rightArrow.style.opacity = '0.3';
        rightArrow.style.pointerEvents = 'none';
    } else {
        rightArrow.style.opacity = '1';
        rightArrow.style.pointerEvents = 'auto';
    }
}

// Função de Tradução
function translatePage(lang) {
    const dictionary = translations[lang];
    if (!dictionary) return;

    const elements = document.querySelectorAll('.i18n, [data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && dictionary[key]) {
            if (el.tagName === 'TITLE') {
                 el.textContent = dictionary[key];
                 return;
            }
            el.innerHTML = dictionary[key];
        }
    });
    
    document.documentElement.lang = lang;
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


// ----------------------------------------------------------------------
// INICIALIZAÇÃO DE EVENTOS (Executado após o carregamento do DOM)
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // --- Seletores Comuns ---
    const toggleButton = document.getElementById('toggle-theme');
    const themeIcon = document.getElementById('theme-icon');
    const logoImg = document.querySelector('.logo img');
    
    // --- Seletores do Hambúrguer/Menu ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // --- Seletores do Idioma ---
    const langDisplayButton = document.getElementById('lang-active-display');
    const langDropdownMenu = document.getElementById('lang-dropdown');
    const currentLangFlagSpan = document.getElementById('current-lang-flag');
    const currentLangCodeSpan = document.getElementById('current-lang-code');

    
    // =================================================================
    // A. LÓGICA DE TEMA (MOVENDO FUNÇÕES PARA DENTRO PARA USO DE SELETORES)
    // =================================================================

    function updateIcon() {
        if (body.classList.contains('dark-mode')) {
            themeIcon.src = "assets/images/dia-e-noite.svg";
        } else {
            themeIcon.src = "assets/images/dia-e-noite-3.svg";
        }
    }

    function updateLogo() {
        if (body.classList.contains('dark-mode')) {
            logoImg.src = 'assets/images/logo-branco.png';
        } else {
            logoImg.src = 'assets/images/logo-preto.png';
        }
    }

    // Aplica e salva tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }

    // Inicializa ícones e logos
    if (themeIcon) updateIcon();
    if (logoImg) updateLogo();

    // Evento de clique do tema
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            updateIcon();
            updateLogo();
            localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    // =================================================================
    // B. LÓGICA DO HAMBÚRGUER (A CORREÇÃO PRINCIPAL)
    // =================================================================
    if (hamburgerBtn && mobileMenu) {
        // 🚀 CORREÇÃO: O clique agora funciona pois os elementos já estão carregados
        hamburgerBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            hamburgerBtn.classList.toggle('is-active'); 
            body.classList.toggle('menu-open'); // Adiciona classe para bloquear o scroll
        });

        // Fechar o menu ao clicar em um link
        document.querySelectorAll('#mobile-menu .nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                hamburgerBtn.classList.remove('is-active');
                body.classList.remove('menu-open');
            });
        });
    }

    // =================================================================
    // C. LÓGICA DE IDIOMAS (Corrigida)
    // =================================================================

    const defaultLang = 'en';
    const supportedLangs = Object.keys(translations);
    let currentLang = localStorage.getItem('lang') || defaultLang;

    function updateLanguage(newLang) {
        if (!supportedLangs.includes(newLang)) return;
        currentLang = newLang;
        localStorage.setItem('lang', currentLang);
        
        currentLangFlagSpan.textContent = translations[currentLang].flag;
        currentLangCodeSpan.textContent = currentLang.toUpperCase();
        
        translatePage(currentLang);
    }

    function populateDropdown() {
        if (!langDropdownMenu) return;

        langDropdownMenu.innerHTML = ''; 
        
        supportedLangs.forEach(lang => {
            const langData = translations[lang];
            if (lang !== currentLang) {
                const listItem = document.createElement('li');
                listItem.setAttribute('data-lang', lang);
                listItem.innerHTML = `${langData.flag} ${langData.name}`;
                langDropdownMenu.appendChild(listItem);
            }
        });
    }
    
    // Eventos do Dropdown
    if (langDisplayButton && langDropdownMenu) {
        langDisplayButton.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdownMenu.classList.toggle('visible');
        });

        document.addEventListener('click', (e) => {
            if (!langDisplayButton.contains(e.target) && !langDropdownMenu.contains(e.target)) {
                langDropdownMenu.classList.remove('visible');
            }
        });

        langDropdownMenu.addEventListener('click', (e) => {
            const clickedItem = e.target.closest('li');
            if (clickedItem) {
                const newLang = clickedItem.getAttribute('data-lang');
                updateLanguage(newLang);
                langDropdownMenu.classList.remove('visible');
                populateDropdown(); // Recria a lista
            }
        });
    }

    // Inicialização da Lógica de Idioma
    populateDropdown();
    updateLanguage(currentLang);


    // =================================================================
    // D. INICIALIZAÇÃO DO CARROSSEL (Listeners de Scroll)
    // =================================================================
    const devScrollable = document.querySelector('#dev .scrollable-projects');
    const designScrollable = document.querySelector('#design .scrollable-projects');

    if(devScrollable) {
        checkScrollPosition('dev');
        devScrollable.addEventListener('scroll', () => checkScrollPosition('dev'));
    }
    if(designScrollable) {
        checkScrollPosition('design');
        designScrollable.addEventListener('scroll', () => checkScrollPosition('design'));
    }
});