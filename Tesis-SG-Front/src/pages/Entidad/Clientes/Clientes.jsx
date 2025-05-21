import React from "react";
import InversionesTable from "../Inversiones/InversionesTable";
import SolicitudInversion from "../Solicitudes/SolicitudInversion";

export default function ClientDetails() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center border-b pb-4">
 
        <h1 className="text-xl font-semibold">Detalles del Cliente</h1>
      </header>

      {/* Contenedor único para todas las secciones */}
      <div className="space-y-6">
        {/* Info identificación */}
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

        {/* Info contacto */}
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

        {/* Info ubicación */}
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

        {/* Inversiones */}
        <section className="bg-white shadow rounded-lg p-1 space-y-4">
          <h3 className="text-md font-semibold">Inversiones</h3>
          <InversionesTable />
        </section>

        {/* Solic inversión */}
        <section className="bg-white shadow rounded-lg p-1 space-y-4">
          <h3 className="text-md font-semibold">Solicitud de inversión</h3>
          <SolicitudInversion />
        </section>
      </div>
    </div>
  );
}
