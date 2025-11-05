const toggleButton = document.getElementById('toggle-theme');
const body = document.body;
const themeIcon = document.getElementById('theme-icon');
const logoImg = document.querySelector('.logo img');

// Função para atualizar o ícone
function updateIcon() {
  if (body.classList.contains('dark-mode')) {
    themeIcon.src = "assets/images/dia-e-noite.svg"; // ícone do modo escuro
  } else {
    themeIcon.src = "assets/images/dia-e-noite-3.svg"; // ícone do modo claro
  }
}

// Função para atualizar o logo
function updateLogo() {
  if (body.classList.contains('dark-mode')) {
    logoImg.src = 'assets/images/logo-branco.png'; // Logo branca para modo escuro
  } else {
    logoImg.src = 'assets/images/logo-preto.png'; // Logo preta para modo claro
  }
}

// Verifica se o usuário já tem uma preferência salva
const savedTheme = localStorage.getItem('theme');

// Aplica preferência salva ou detecta tema do sistema
if (savedTheme === 'dark') {
  body.classList.add('dark-mode');
} else if (savedTheme === 'light') {
  body.classList.remove('dark-mode');
} else {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
}

// Atualiza ícone e logo ao carregar a página
updateIcon();
updateLogo();

// Alterna tema ao clicar no botão
toggleButton.addEventListener('click', () => {
  body.classList.toggle('dark-mode');

  // Atualiza ícone e logo
  updateIcon();
  updateLogo();

  // Salva preferência
  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Função para verificar se os botões devem ser habilitados/desabilitados
function checkScrollPosition(sectionId) {
    const scrollContainer = document.querySelector(`#${sectionId} .scrollable-projects`);
    if (!scrollContainer) return;
    
    const leftArrow = document.querySelector(`#${sectionId} .arrowbtn-left`);
    const rightArrow = document.querySelector(`#${sectionId} .arrowbtn-right`);

    // Valor de rolagem atual
    const scrollLeft = scrollContainer.scrollLeft;
    // Largura total do conteúdo rolável
    const scrollWidth = scrollContainer.scrollWidth;
    // Largura visível do contêiner
    const clientWidth = scrollContainer.clientWidth;

    // INÍCIO do Scroll
    if (scrollLeft <= 1) {
        leftArrow.style.opacity = '0.3'; // Desativa visualmente
        leftArrow.style.pointerEvents = 'none'; // Impede o clique
    } else {
        leftArrow.style.opacity = '1';
        leftArrow.style.pointerEvents = 'auto';
    }

    // FIM do Scroll
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
        rightArrow.style.opacity = '0.3'; // Desativa visualmente
        rightArrow.style.pointerEvents = 'none'; // Impede o clique
    } else {
        rightArrow.style.opacity = '1';
        rightArrow.style.pointerEvents = 'auto';
    }
}

// Função para rolar o carrossel dos projetos (Atualizada)
function scrollProjects(sectionId, direction) {
    const scrollContainer = document.querySelector(`#${sectionId} .scrollable-projects`);
    if (!scrollContainer) return;
    
    const cardWidth = 320; // Largura fixa do cartão
    const gap = 16; // Espaçamento entre os cartões
    const scrollAmount = cardWidth + gap;
    
    // Rola a div suavemente
    scrollContainer.scrollBy({
        left: direction * scrollAmount, 
        behavior: 'smooth' 
    });

    // Verifica a posição após a rolagem. 
    // É necessário um pequeno atraso para que a animação (smooth scroll) termine.
    setTimeout(() => {
        checkScrollPosition(sectionId);
    }, 500); // 500ms é o tempo suficiente para o scroll terminar
}


// Adiciona um listener para verificar a posição no carregamento e rolagem manual
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa a verificação de scroll para ambas as seções
  if(document.querySelector('#dev .scrollable-projects')) {
    checkScrollPosition('dev');
    document.querySelector('#dev .scrollable-projects').addEventListener('scroll', () => checkScrollPosition('dev'));
  }
  if(document.querySelector('#design .scrollable-projects')) {
    checkScrollPosition('design');
    document.querySelector('#design .scrollable-projects').addEventListener('scroll', () => checkScrollPosition('design'));
  }
});