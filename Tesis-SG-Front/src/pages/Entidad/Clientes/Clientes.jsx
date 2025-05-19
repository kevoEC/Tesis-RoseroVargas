// ClientDetails.jsx
import React from "react";

export default function ClientDetails() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4"></header>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información de identificación */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Información de identificación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="MARGARITA"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="ABRIL CARDENAS"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de documento <span className="text-red-500">*</span>
                </label>
                <select className="w-full border rounded-md p-2 bg-white">
                  <option>CI</option>
                  <option>Pasaporte</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">
                  Número de documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="1709741415"
                  readOnly
                />
              </div>
            </div>
          </section>

          {/* Información de contacto */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Información de contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="margaritaabrilc@hotmail.com"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Teléfono celular
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="0960543743"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Teléfono fijo
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border rounded-md p-2"
                  placeholder="---"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Otro teléfono
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border rounded-md p-2"
                  placeholder="---"
                  readOnly
                />
              </div>
            </div>
          </section>

          {/* Información de ubicación */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Información de ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de vía
                </label>
                <select className="w-full border rounded-md p-2 bg-white">
                  <option>—</option>
                  <option>Calle</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Calle principal
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="Iñaquito N-35119 E Ignacio San María"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border rounded-md p-2"
                  placeholder="---"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Provincia
                </label>
                <select className="w-full border rounded-md p-2 bg-white">
                  <option>Pichincha</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border rounded-md p-2"
                  placeholder="---"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de vivienda
                </label>
                <select className="w-full border rounded-md p-2 bg-white">
                  <option>—</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          {/* Tareas */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-md font-semibold mb-4">Inversiones</h3>
          </div>

          {/* Adjuntos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-md font-semibold mb-4">
              {" "}
              Solicitud de inversión
            </h3>
            <table className="w-full text-sm"></table>
          </div>
        </aside>
      </div>
    </div>
  );
}
