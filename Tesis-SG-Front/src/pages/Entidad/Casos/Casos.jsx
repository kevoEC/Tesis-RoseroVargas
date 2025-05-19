// CaseForm.jsx
import React from "react";

export default function CaseForm() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            CAS202302854 – Tratamiento de datos personales
          </h1>
          <p className="text-sm text-gray-500">Estado: Iniciado</p>
        </div>
        <div className="space-x-6 text-sm text-gray-600">
          <span>
            <strong>Número de caso:</strong> CAS202302854
          </span>
          <span>
            <strong>Cliente:</strong> ABRIL CARDENAS MARGARITA
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* General */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Producto de inversión */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Producto de inversión <span className="text-red-500">*</span>
                </label>
                <select className="w-full border rounded-md p-2 bg-white">
                  <option value="">— Selecciona producto —</option>
                  <option value="SG-WISO-2021-0313136">
                    SG-WISO-2021-0313136 – $40 000 (13 meses)
                  </option>
                  <option value="OTRO-PRODUCTO">
                    Otro producto de inversión
                  </option>
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select className="w-full border rounded-md p-2 bg-white">
                  <option value="">— Selecciona tipo —</option>
                  <option value="Solicitud">Solicitud</option>
                  <option value="Informe">Informe</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Motivo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Motivo <span className="text-red-500">*</span>
                </label>
                <select className="w-full border rounded-md p-2 bg-white">
                  <option value="">— Selecciona motivo —</option>
                  <option value="TratamientoDatos">
                    Tratamiento de datos personales
                  </option>
                  <option value="Actualizacion">Actualización de datos</option>
                  <option value="Consulta">Consulta general</option>
                </select>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows="3"
                  placeholder="---"
                />
              </div>
            </div>
          </section>

          {/* Detalle de tratamiento de datos */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Detalle de tratamiento de datos
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Detalle <span className="text-red-500">*</span>
              </label>
              <select className="w-full border rounded-md p-2 bg-white">
                <option value="Acceso">Acceso</option>
                <option value="Modificacion">Modificación</option>
                <option value="Eliminacion">Eliminación</option>
              </select>
            </div>
          </section>
        </div>

        {/* Derecha */}
        <aside className="space-y-6">
          {/* Adjuntos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-md font-semibold mb-4">Adjuntos</h3>
            <table className="w-full text-sm"></table>
          </div>
        </aside>
      </div>
    </div>
  );
}
