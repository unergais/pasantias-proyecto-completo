// src/components/superadmin/TopNav.jsx
import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const TopNav = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Botón para mostrar/ocultar sidebar en móviles */}
        <button
          type="button"
          className="md:hidden bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sr-only">Abrir menú</span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Espacio flexible para mantener el layout */}
        <div className="flex-1"></div>

        {/* Perfil del usuario */}
        <div className="flex items-center">
          <div className="relative">
            <div>
              <button
                type="button"
                className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                id="user-menu"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span className="sr-only">Abrir menú de usuario</span>
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;