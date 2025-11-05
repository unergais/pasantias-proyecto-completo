import React from 'react';
import { QuestionMarkCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const Help = () => {
  const email = 'unergpasantias2.0@gmail.com';
  const subject = 'Soporte Técnico - UNERG Pasantías 2.0';
  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
          <QuestionMarkCircleIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Centro de Ayuda</h2>
        <p className="text-gray-600">¿Necesitas asistencia? Estamos aquí para ayudarte.</p>
      </div>

      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Soporte Técnico</h3>
        <p className="text-gray-700 mb-4">
          Si necesitas ayuda con el sistema o tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte técnico.
        </p>
        <div className="flex items-center">
          <EnvelopeIcon className="h-5 w-5 text-indigo-500 mr-2" />
          <a 
            href={mailtoLink}
            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center"
          >
            {email}
          </a>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preguntas Frecuentes</h3>
        <p className="text-gray-700 mb-4">
          Estamos trabajando en nuestra sección de preguntas frecuentes. Mientras tanto, no dudes en contactarnos por correo electrónico.
        </p>
      </div>
    </div>
  );
};

export default Help;