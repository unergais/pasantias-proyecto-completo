// src/components/superadmin/Sidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  RectangleGroupIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const navigation = [
  { name: 'Dashboard', href: '/superadmin/dashboard', icon: HomeIcon },
  { name: 'Plantillas', href: '/superadmin/plantillas', icon: RectangleGroupIcon },
  { name: 'Ayuda', href: '/superadmin/ayuda', icon: QuestionMarkCircleIcon },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  return (
    <div className="hidden md:flex md:flex-col h-screen md:w-64 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-indigo-600">Panel Admin</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                location.pathname === item.href
                  ? 'bg-gray-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  location.pathname === item.href
                    ? 'text-indigo-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 flex-shrink-0 h-6 w-6`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Botón de Cerrar Sesión en la parte inferior */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;