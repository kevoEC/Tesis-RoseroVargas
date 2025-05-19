// InvestmentScreen.jsx
import React from "react";

export default function InvestmentScreen() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            SG-FRP-2024-01702 – $70 000.00 (12 meses)
          </h1>
          <p className="text-sm text-gray-500">Guardado</p>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del producto */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Información del producto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Producto */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Producto
                </label>
                <select className="w-full border rounded-md p-2">
                  <option>— Selecciona producto —</option>
                  <option>Renta Periódica</option>
                </select>
              </div>
              {/* Plazo */}
              <div>
                <label className="block text-sm font-medium mb-1">Plazo</label>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="12"
                />
              </div>
              {/* Tasa rendimiento mensual */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tasa de rendimiento mensual
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-md p-2"
                  placeholder="1.70"
                />
              </div>
              {/* Notif. en inglés */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notificación en Inglés
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  placeholder="---"
                />
              </div>
              {/* Capital */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Capital <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="$ 70 000.00"
                  readOnly
                />
              </div>
              {/* Estado del producto */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Estado del producto
                </label>
                <select className="w-full border rounded-md p-2">
                  <option>Vigente</option>
                  <option>Cancelado</option>
                </select>
              </div>
              {/* Enviar EECC */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enviar EECC
                </label>
                <button className="w-full border rounded-md p-2 text-left">
                  Enviar
                </button>
              </div>
            </div>
          </section>

          {/* Información de apertura */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Información de apertura</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha de inicio */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de inicio
                </label>
                <input type="date" className="w-full border rounded-md p-2" />
              </div>
              {/* Fecha de solicitud */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de solicitud
                </label>
                <input type="date" className="w-full border rounded-md p-2" />
              </div>
              {/* Fecha proyectada */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de finalización proyectada
                </label>
                <input type="date" className="w-full border rounded-md p-2" />
              </div>
              {/* Corte de inversión */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Corte de inversión
                </label>
                <select className="w-full border rounded-md p-2">
                  <option>1ro</option>
                  <option>15</option>
                </select>
              </div>
            </div>
          </section>

          {/* Valores y proyecciones */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Aporte mensual
                </label>
                <input type="number" className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Valor proyectado a liquidar
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="$ 70 000.00"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Costo operativo
                </label>
                <input type="text" className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Valor actual a liquidar
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="$ 1 130.50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Costo notarización
                </label>
                <input type="text" className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Valor liquidado
                </label>
                <input type="number" className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Capital de inicio
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border rounded-md p-2"
                  value="$ 70 000.00"
                  readOnly
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium">
                  Actualizar inversión
                </label>
                <input type="checkbox" className="h-4 w-4" />
                <span className="text-sm">No</span>
              </div>
            </div>
          </section>

          {/* Totales */}
          <section className="bg-white shadow rounded-lg p-6 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span>Total rentabilidad</span>
                <span>$ 14 260.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total capital y rendimiento</span>
                <span>$ 88 566.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total costo operativo</span>
                <span>$ 714.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total incrementos de capital</span>
                <span>$ 0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total renta del periodo</span>
                <span>$ 0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total aportes mensuales</span>
                <span>$ 0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total renta del producto</span>
                <span>$ 0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total aportes mensuales</span>
                <span>$ 0.00</span>
              </div>
              {/* …otros totales */}
            </div>
          </section>

          {/* Beneficiarios */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Beneficiarios</h2>
          </section>

          {/* Banco */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Banco</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Banco</label>
                <select className="w-full border rounded-md p-2">
                  <option>— Seleccionar banco —</option>
                  <option>Produbanco</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de cuenta
                </label>
                <select className="w-full border rounded-md p-2">
                  <option>Ahorros</option>
                  <option>Corriente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  N° de cuenta
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  value="12096034586"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Derecha */}
        <aside className="space-y-6">
          {/* Tareas */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-md font-semibold mb-4">
              Solicitud de Inversion
            </h3>
          </div>
        </aside>
      </div>
    </div>
  );
}
