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
