import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, DocumentChartBarIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Templates = () => {
  const [activeTab, setActiveTab] = useState('pdf');
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState({
    pdf: {
      'Carta de Postulacion de Pasantias': { name: '', url: '' },
      'Carta de Aceptacion de Pasantias': { name: '', url: '' },
      'Normas para Elaborar informe de Pasantias': { name: '', url: '' },
      'Plan de Trabajo Pasantias': { name: '', url: '' },
      'Evaluacion de tutor Academico': { name: '', url: '' },
      'Evaluacion del tutor Empresarial': { name: '', url: '' },
      'Evaluacion de Coordinacion': { name: '', url: '' },
      'Carta de Culminacion de Pasantias': { name: '', url: '' }
    },
    excel: {
      'Modelo de Notas de los Pasantes': { name: '', url: '' }
    }
  });

  // Load existing templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Load PDF templates
      const { data: pdfFiles } = await supabase.storage
        .from('plantillas')
        .list('PDF');
      
      // Load Excel templates
      const { data: excelFiles } = await supabase.storage
        .from('plantillas')
        .list('EXCEL');

      const updatedTemplates = { ...templates };

      // Update PDF templates with existing files
      if (pdfFiles) {
        pdfFiles.forEach(file => {
          const templateName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
          if (updatedTemplates.pdf[templateName]) {
            const { data: { publicUrl } } = supabase.storage
              .from('plantillas')
              .getPublicUrl(`PDF/${file.name}`);
            updatedTemplates.pdf[templateName] = { 
              name: file.name, 
              url: publicUrl 
            };
          }
        });
      }

      // Update Excel templates with existing files
      if (excelFiles) {
        excelFiles.forEach(file => {
          const templateName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
          if (updatedTemplates.excel[templateName]) {
            const { data: { publicUrl } } = supabase.storage
              .from('plantillas')
              .getPublicUrl(`EXCEL/${file.name}`);
            updatedTemplates.excel[templateName] = { 
              name: file.name, 
              url: publicUrl 
            };
          }
        });
      }

      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleFileUpload = async (e, templateName, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (type === 'pdf' && fileExt !== 'pdf') {
      alert('Por favor, sube un archivo PDF');
      return;
    }
    if (type === 'excel' && !['xls', 'xlsx'].includes(fileExt)) {
      alert('Por favor, sube un archivo Excel (xls o xlsx)');
      return;
    }

    try {
      setUploading(true);
      const filePath = `${type.toUpperCase()}/${templateName.replace(/\s+/g, '_')}.${fileExt}`;
      
      // Upload file to Supabase
      const { error: uploadError } = await supabase.storage
        .from('plantillas')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('plantillas')
        .getPublicUrl(filePath);

      // Update templates state
      const updatedTemplates = { ...templates };
      updatedTemplates[type][templateName] = { 
        name: file.name, 
        url: publicUrl 
      };
      setTemplates(updatedTemplates);

      alert('Archivo subido exitosamente');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plantillas de Documentos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestiona las plantillas de documentos para el proceso de pasantias de los estudiantes.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`${
              activeTab === 'pdf'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Documentos PDF
            </div>
          </button>
          <button
            onClick={() => setActiveTab('excel')}
            className={`${
              activeTab === 'excel'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <div className="flex items-center">
              <DocumentChartBarIcon className="h-5 w-5 mr-2" />
              Documentos Excel
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'pdf' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(templates.pdf).map(([name, file]) => (
              <div key={name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                  <div className="mt-4">
                    {file.url ? (
                      <div className="flex items-center justify-between">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No se ha subido ningún archivo</p>
                    )}
                    <div className="mt-4">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
                        {file.url ? 'Cambiar archivo' : 'Subir archivo'}
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, name, 'pdf')}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'excel' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(templates.excel).map(([name, file]) => (
              <div key={name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                  <div className="mt-4">
                    {file.url ? (
                      <div className="flex items-center justify-between">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No se ha subido ningún archivo</p>
                    )}
                    <div className="mt-4">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
                        {file.url ? 'Cambiar archivo' : 'Subir archivo'}
                        <input
                          type="file"
                          className="sr-only"
                          accept=".xls,.xlsx"
                          onChange={(e) => handleFileUpload(e, name, 'excel')}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;