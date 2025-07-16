import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createProducto } from "@/service/Catalogos/ProductoService";
import { useAuth } from "@/hooks/useAuth";
import GlassLoader from "@/components/ui/GlassLoader";

// Catálogo quemado de formas de pago
const FORMAS_PAGO = [
  { idFormaPago: 1, formaPagoNombre: "No Aplica" },
  { idFormaPago: 2, formaPagoNombre: "Al finalizar" },
  { idFormaPago: 3, formaPagoNombre: "Según su periodicidad" },
];

export default function ProductoForm({ onClose, onSaved, initialData }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estado del formulario
  const [form, setForm] = useState({
    productoNombre: "",
    nombreComercial: "",
    productoCodigo: "",
    iniciales: "",
    descripcion: "",
    idFormaPago: "",
    periocidad: "",
    montoMinimoIncremento: "",
    penalidad: "",
    ...initialData
  });

  // Manejo de cambios de campo
  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Guardar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        productoNombre: form.productoNombre?.trim(),
        nombreComercial: form.nombreComercial?.trim(),
        productoCodigo: form.productoCodigo?.trim(),
        iniciales: form.iniciales?.trim(),
        descripcion: form.descripcion?.trim(),
        idFormaPago: Number(form.idFormaPago),
        periocidad: Number(form.periocidad),
        montoMinimoIncremento: Number(form.montoMinimoIncremento),
        penalidad: Number(form.penalidad),
        idUsuarioCreacion: user?.id,
        fechaCreacion: new Date().toISOString(),
      };

      // Validación rápida
      if (
        !payload.productoNombre ||
        !payload.nombreComercial ||
        !payload.productoCodigo ||
        !payload.iniciales ||
        !payload.descripcion ||
        !payload.idFormaPago ||
        isNaN(payload.periocidad) ||
        isNaN(payload.montoMinimoIncremento) ||
        isNaN(payload.penalidad)
      ) {
        toast.error("Completa todos los campos obligatorios.");
        setLoading(false);
        return;
      }

      await createProducto(payload);
      toast.success("Producto creado correctamente");
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(`Error al crear producto: ${error.message ?? error}`);
    } finally {
      setLoading(false);
    }
  };

  // Opciones de periodicidad
  const periodicidadOptions = [
    { value: 0, label: "Al finalizar" },
    { value: 1, label: "Mensual" },
    { value: 2, label: "Bimensual" },
    { value: 3, label: "Trimestral" },
    { value: 6, label: "Semestral" },
  ];

  return (
    <div className="relative px-2 py-3 md:px-7 md:py-7">
      <GlassLoader visible={loading} message="Guardando producto..." />
      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-xl mx-auto"
        autoComplete="off"
      >
        <section className="bg-white rounded-2xl border border-gray-300 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-blue-900 mb-3 border-b pb-2">Datos del Producto</h3>
          <FormGroup label="Nombre del Producto">
            <Input
              type="text"
              value={form.productoNombre}
              maxLength={50}
              onChange={(e) => handleChange("productoNombre", e.target.value)}
              required
              placeholder="Ej: Renta Fija"
            />
          </FormGroup>
          <FormGroup label="Nombre Comercial">
            <Input
              type="text"
              value={form.nombreComercial}
              maxLength={80}
              onChange={(e) => handleChange("nombreComercial", e.target.value)}
              required
              placeholder="Ej: Fondo de renta fija"
            />
          </FormGroup>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormGroup label="Código">
              <Input
                type="text"
                value={form.productoCodigo}
                maxLength={10}
                onChange={(e) => handleChange("productoCodigo", e.target.value)}
                required
                placeholder="Ej: RF01"
              />
            </FormGroup>
            <FormGroup label="Iniciales">
              <Input
                type="text"
                value={form.iniciales}
                maxLength={6}
                onChange={(e) => handleChange("iniciales", e.target.value)}
                required
                placeholder="Ej: FRF"
              />
            </FormGroup>
            <FormGroup label="Periodicidad">
              <select
                className="w-full border rounded-md p-2 bg-white text-sm"
                value={form.periocidad}
                onChange={(e) => handleChange("periocidad", e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {periodicidadOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FormGroup>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Forma de Pago">
              <select
                className="w-full border rounded-md p-2 bg-white text-sm"
                value={form.idFormaPago}
                onChange={(e) => handleChange("idFormaPago", e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {FORMAS_PAGO.map((fp) => (
                  <option key={fp.idFormaPago} value={fp.idFormaPago}>
                    {fp.formaPagoNombre}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Monto Mínimo Incremento">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.montoMinimoIncremento}
                onChange={(e) => handleChange("montoMinimoIncremento", e.target.value)}
                required
                placeholder="Ej: 1000.00"
              />
            </FormGroup>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Penalidad (%)">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.penalidad}
                onChange={(e) => handleChange("penalidad", e.target.value)}
                required
                placeholder="Ej: 0.20"
              />
            </FormGroup>
            <FormGroup label="Descripción">
              <textarea
                className="w-full border rounded-md p-2 bg-white text-sm"
                value={form.descripcion}
                maxLength={255}
                rows={3}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                required
                placeholder="Breve descripción del producto"
              />
            </FormGroup>
          </div>
        </section>
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="px-6 py-2">
            Cancelar
          </Button>
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2">
            {initialData ? "Actualizar Producto" : "Crear Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Agrupador de campo y label
function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}
