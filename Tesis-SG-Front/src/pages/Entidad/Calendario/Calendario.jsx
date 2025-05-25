// OperationCalendar.jsx
import React from "react";

export default function Calendario() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">20 MAYO 2025</h1>
          <p className="text-sm text-gray-600">Calendario de operaciones</p>
        </div>
      </header>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left card */}
        <section className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                defaultValue="20 MAYO 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de corte <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                defaultValue="2025-05-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Calendario de inversión
              </label>
              <select className="w-full border rounded-md p-2 bg-white">
                <option value="">— Selecciona día —</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Right card */}
        <section className="bg-white shadow rounded-lg p-6 space-y-4 lg:col-span-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha para generar Terminaciones{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-md p-2"
              defaultValue="2025-05-15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha para generar registros de pagos{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-md p-2"
              defaultValue="2025-05-15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de cálculo por No abono{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-md p-2"
              defaultValue="2025-06-01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de envíos de estado de cuenta{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-md p-2"
              defaultValue="2025-06-01"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
