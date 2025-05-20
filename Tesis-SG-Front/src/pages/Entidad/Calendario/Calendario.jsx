// PaymentScreen.jsx
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


export default function PaymentScreen() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Pagos 10/5/2025
          </h1>
        </div>
      </header>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Calendario de pagos */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Calendario de pagos <span className="text-red-500">*</span>
              </label>
              <select className="w-full border rounded-md p-2 bg-white">
                <option>— Selecciona calendario —</option>
                <option>10 MAYO 2025</option>
                <option>20 MAYO 2025</option>
              </select>
            </div>
          </section>

          {/* Opciones */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Opciones</h2>

            <div className="space-y-3">
              {[
                "Generar casos de pago",
                "Confirmar registros de pago",
                "Confirmar pagos cargados en Banco",
              ].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <label className="inline-flex items-center cursor-not-allowed">
                    {/* <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                      disabled
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600" />
                    <span className="ml-2 text-sm">Sí</span> */}
                    <FormSwitch
                    
                    />
                  </label>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Detalles
                </label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows="3"
                  placeholder="---"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <aside className="lg:col-span-2">
          <section className="bg-white shadow rounded-lg p-6 space-y-6">
            {/* Summary row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cantidad de pagos
                </label>
                <input
                  type="text"
                  readOnly
                  defaultValue="87"
                  className="w-full border rounded-md p-2 bg-gray-100"
                />
              </div>
              <div className="md:col-span-2 flex items-center space-x-3">
                <label className="block text-sm font-medium">
                  Descartar pagos
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  {/* <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600" />
                  <span className="ml-2 text-sm">No</span> */}
                  <FormSwitch>

                  </FormSwitch>
                </label>
              </div>
            </div>

            {/* Casos de pago */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold">Casos de pago</h3>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function FormSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          className={`
            peer
            inline-flex
            h-6 w-11 shrink-0
            cursor-pointer
            items-center
            rounded-full
            border
            border-black
            transition-colors
            duration-200
            ease-in-out
            ${checked ? "bg-primary" : "bg-gray-300"}
          `}
        />
        {/* Círculo */}
        <span
          className={`
            pointer-events-none
            absolute
            left-0.5 top-0.5
            h-5 w-5
            transform
            rounded-full
            bg-white
            shadow
            transition-transform
            duration-200
            ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
    </div>
  );
}
