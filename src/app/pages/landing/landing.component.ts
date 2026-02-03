import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-white">
      <!-- Navbar -->
      <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                VerTienda
              </span>
            </div>
            <div class="flex items-center gap-4">
              <a routerLink="/login" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Iniciar Sesión
              </a>
              <a routerLink="/login" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
                Crear Tienda
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-20 pb-32 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span class="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-6">
            Plataforma de E-commerce B2B
          </span>
          <h1 class="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            Tu Catálogo Virtual <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Listo en Minutos
            </span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10">
            Crea espacios de tiendas virtuales profesionales para tu negocio. 
            Gestiona productos, comparte tu catálogo y aumenta tus ventas con VerTienda.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/login" class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 md:text-xl transition-all shadow-xl shadow-blue-600/30 hover:scale-105">
              Comenzar Ahora
            </a>
            <a href="#features" class="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-lg font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 md:text-xl transition-all hover:border-gray-300">
              Conocer más
            </a>
          </div>
          
          <!-- Abstract UI Mockup -->
          <div class="mt-20 relative">
             <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full"></div>
             <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80" 
                  alt="Dashboard Preview" 
                  class="rounded-xl shadow-2xl border border-gray-200 mx-auto max-w-5xl w-full object-cover h-[500px] object-top transform rotate-x-12 perspective-1000">
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-24 bg-white relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-base text-blue-600 font-semibold tracking-wide uppercase">Características</h2>
            <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para vender
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <!-- Feature 1 -->
            <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group">
              <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Gestión de Catálogo</h3>
              <p class="text-gray-600">
                Sube productos ilimitados, organiza por categorías y controla tu inventario en tiempo real con nuestra interfaz intuitiva.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 group">
              <div class="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Planes Flexibles</h3>
              <p class="text-gray-600">
                Elige el plan que mejor se adapte a tu negocio. Desde opciones gratuitas para empezar hasta planes corporativos.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group">
              <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Panel de Control</h3>
              <p class="text-gray-600">
                Accede a estadísticas detalladas, gestiona usuarios y configura tu tienda desde un panel centralizado y seguro.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-20 bg-blue-600">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold text-white mb-6">¿Listo para escalar tu negocio?</h2>
          <p class="text-blue-100 text-lg mb-10">
            Únete a cientos de empresas que ya gestionan sus catálogos con VerTienda.
          </p>
          <a routerLink="/login" class="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
            Crear mi Tienda Gratis
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-50 border-t border-gray-200 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-gray-800">VerTienda</span>
          </div>
          <p class="text-gray-500 text-sm">
            © 2026 VerTienda. Todos los derechos reservados.
          </p>
          <div class="flex gap-6">
            <a href="#" class="text-gray-400 hover:text-gray-600">Términos</a>
            <a href="#" class="text-gray-400 hover:text-gray-600">Privacidad</a>
            <a href="#" class="text-gray-400 hover:text-gray-600">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LandingPageComponent { }
