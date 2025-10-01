const navBarra=document.getElementById("navBarra")
navBarra.innerHTML=`
    <header class="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-lg py-3 z-50 border-b border-blue-100">
        <div class="container mx-auto flex justify-between items-center px-6">
            <a href="abulingo.html" class="text-3xl font-bold font-heading">Abulingo<span style="color: #FF7A00;">.</span></a>
            <nav class="hidden md:flex items-center space-x-2">
                <a href="abulingo.html" class="nav-link">Continuar Aventura</a>
                <a href="gramatica.html" class="nav-link active">Gramática</a>
                <a href="pro.html" class="nav-link text-center" >Pronunciación</a>
                <a href="club.html" class="nav-link">Club</a>
                <a href="traductor.html" class="nav-link">Traductor</a>
                <a href="soporte.html" class="nav-link">Soporte</a>
            </nav>
            <button id="menu-button" class="md:hidden text-[#0D47A1]"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg></button>
            <div class="relative">
                <button id="profile-menu-button" class="flex items-center space-x-2 cursor-pointer group">
                    <img id="user-avatar" src="https://picsum.photos/seed/user-avatar/40/40" alt="Avatar de usuario" class="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-[#FF7A00] transition">
                    <span id="user-name-nav" class="font-semibold text-slate-700 hidden lg:block">Mi Perfil</span>
                </button>
                <div id="profile-menu-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                    <div class="p-4 border-b"><h3 id="user-name-dropdown" class="font-bold text-slate-800">Cargando...</h3><p id="user-email-dropdown" class="text-sm text-slate-500">...</p></div>
                    <div class="py-2">
                        <div class="flex items-center px-4 py-2 text-slate-700"><i class="fas fa-star w-6 text-yellow-500"></i><span><span id="user-points" class="font-bold">0</span> Puntos</span></div>
                        <div class="flex items-center px-4 py-2 text-slate-700"><i class="fas fa-coins w-6 text-yellow-600"></i><span><span id="user-lingots" class="font-bold">0</span> Lingots</span></div>
                         <a href="#" class="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100">
                            <i class="fas fa-trophy w-6 text-slate-500"></i>
                            <span>Ranking Global</span>
                        </a>
                        <a href="#" class="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100">
                            <i class="fas fa-trophy w-6 text-slate-500"></i>
                            <span>Ranking Equipo</span>
                        </a>
                        <a href="#" class="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100">
                            <i class="fas fa-trophy w-6 text-slate-500"></i>
                            <span>Nivel</span>
                        </a>
                        <a href="#" class="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100">
                            <i class="fas fa-trophy w-6 text-slate-500"></i>
                            <span>Progreso nivel</span>
                        </a>
                        <a href="#" class="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100">
                            <i class="fas fa-trophy w-6 text-slate-500"></i>
                            <span>Mazo</span>
                        </a>
                         <a href="#" class="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100">
                            <i class="fas fa-key w-6 text-slate-500"></i>
                            <span>Cambiar Contraseña</span>
                        </a>
                    </div>
                    <div class="py-2 border-t"><button id="logout-btn" class="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50"><i class="fas fa-sign-out-alt w-6"></i><span>Cerrar Sesión</span></button></div>
                </div>
            </div>
        </div>
    </header>
    
    <div id="mobile-menu" class="hidden md:hidden fixed top-20 right-4 w-56 bg-white/90 backdrop-blur-lg p-4 rounded-lg shadow-xl z-40 space-y-2 flex flex-col">
        <a href="abulingo.html" class="nav-link active text-center">Continuar Aventura</a>
        <a href="gramatica.html" class="nav-link text-center">Gramática</a>
        <a href="club.html" class="nav-link text-center">Club</a>
        <a href="traductor.html" class="nav-link text-center">Traductor</a>
        <a href="soporte.html" class="nav-link text-center">Soporte</a>
    </div>
`
// Añadir event listeners para togglear los modales
const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

const profileButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-menu-dropdown');
if (profileButton && profileDropdown) {
    profileButton.addEventListener('click', () => {
        profileDropdown.classList.toggle('hidden');
    });
}

// Opcional: Cerrar menús al hacer clic fuera (mejora de UX)
document.addEventListener('click', (event) => {
    if (!menuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.add('hidden');
    }
    if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.add('hidden');
    }
});