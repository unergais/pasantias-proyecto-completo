// src/components/superadmin/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';

// =============================================
// CONFIGURACIÓN INICIAL - NO MODIFICAR
// =============================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Las variables de entorno de Supabase no están configuradas correctamente');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
const DashboardHome = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    ci: '',
    phone: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // =============================================
  // EFECTOS SECUNDARIOS
  // =============================================
  useEffect(() => {
    fetchAdmins();
  }, []);

  // =============================================
  // MANEJADORES DE EVENTOS
  // =============================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // =============================================
  // VALIDACIÓN DEL FORMULARIO
  // =============================================
  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) errors.full_name = 'El nombre completo es requerido';
    if (!formData.ci.trim()) errors.ci = 'La cédula es requerida';
    if (!formData.phone.trim()) errors.phone = 'El teléfono es requerido';
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }
    if (!editingAdmin && !formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    }
    if (!formData.role) errors.role = 'El rol es requerido';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // =============================================
  // FUNCIONES DE LA API
  // =============================================
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['superadmin', 'admin'])
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setAdmins(data || []);
    } catch (err) {
      console.error('Error al cargar administradores:', err);
      setError('Error al cargar los administradores. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    try {
      if (editingAdmin) {
        // Preparar datos para actualización
        const updateData = {
          full_name: formData.full_name,
          ci: formData.ci,
          phone: formData.phone,
          email: formData.email,
          role: formData.role
        };
        
        // Solo incluir password si se proporcionó uno nuevo
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        // Actualizar administrador existente
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', editingAdmin.id);
        
        if (updateError) throw updateError;
      } else {
        // Crear nuevo administrador
        const { error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            full_name: formData.full_name,
            ci: formData.ci,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            role: formData.role
          }]);
        
        if (createError) throw createError;
      }
      
      // Cerrar modal y limpiar formulario
      setShowModal(false);
      setEditingAdmin(null);
      setFormData({
        full_name: '',
        ci: '',
        phone: '',
        email: '',
        password: '',
        role: 'admin'
      });
      setFormErrors({});
      setShowPassword(false);
      fetchAdmins();
    } catch (err) {
      console.error('Error al guardar administrador:', err);
      setError('Error al guardar el administrador. Por favor, intente de nuevo.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este administrador?')) {
      try {
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        
        if (deleteError) throw deleteError;
        
        fetchAdmins();
      } catch (err) {
        console.error('Error al eliminar administrador:', err);
        setError('Error al eliminar el administrador. Por favor, intente de nuevo.');
      }
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      full_name: admin.full_name || '',
      ci: admin.ci || '',
      phone: admin.phone || '',
      email: admin.email || '',
      password: '',
      role: admin.role || 'admin'
    });
    setFormErrors({});
    setShowPassword(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
    setFormData({
      full_name: '',
      ci: '',
      phone: '',
      email: '',
      password: '',
      role: 'admin'
    });
    setFormErrors({});
    setShowPassword(false);
  };

  // =============================================
  // RENDERIZADO CONDICIONAL
  // =============================================
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md">
        <div className="flex">
          <div style={{ flexShrink: 0 }}>
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Filtrar administradores por término de búsqueda
  const filteredAdmins = admins.filter(admin =>
    (admin.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (admin.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (admin.ci || '').includes(searchTerm) ||
    (admin.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // =============================================
  // RENDERIZADO PRINCIPAL
  // =============================================
  return (
    <div className="space-y-6 p-6">
      {/* Sección de encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Administradores</h1>
      </div>

      {/* Barra de búsqueda y botón de agregar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="relative rounded-md shadow-sm w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="Buscar administradores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingAdmin(null);
            setFormData({
              full_name: '',
              ci: '',
              phone: '',
              email: '',
              password: '',
              role: 'admin'
            });
            setFormErrors({});
            setShowPassword(false);
            setShowModal(true);
          }}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Agregar administrador
        </button>
      </div>

      {/* Tabla de administradores */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cédula
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {admin.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.ci}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.role === 'superadmin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal corregido - Fondo casi transparente */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo con overlay casi transparente */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-5 transition-opacity backdrop-blur-[1px]"
              onClick={closeModal}
            ></div>

            {/* Contenido del modal */}
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-200">
              {/* Botón de cerrar */}
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={closeModal}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingAdmin ? 'Editar Administrador' : 'Agregar Nuevo Administrador'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 text-left">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        id="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          formErrors.full_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.full_name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="ci" className="block text-sm font-medium text-gray-700 text-left">
                        Cédula de Identidad *
                      </label>
                      <input
                        type="text"
                        name="ci"
                        id="ci"
                        value={formData.ci}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          formErrors.ci ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.ci && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.ci}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-left">
                        Número Telefónico *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          formErrors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          formErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 text-left">
                        Rol *
                      </label>
                      <select
                        name="role"
                        id="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          formErrors.role ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                      {formErrors.role && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
                        Contraseña {editingAdmin ? '(Dejar en blanco para no cambiar)' : '*'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                            formErrors.password ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} - Click en el icono del ojo
                      </p>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {editingAdmin ? 'Actualizar' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;