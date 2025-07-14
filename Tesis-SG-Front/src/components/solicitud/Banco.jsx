import { useEffect, useState } from "react";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
import {
  getSolicitudById,
  updateSolicitud,
} from "@/service/Entidades/SolicitudService";
import {
  getCatalogoBancos,
  getCatalogoTiposCuenta,
} from "@/service/Catalogos/BancoService";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import GlassLoader from "@/components/ui/GlassLoader";
import { toast } from "sonner";

export default function BancoForm({ id }) {
  const [loading, setLoading] = useState(true);
  const [solicitudData, setSolicitudData] = useState(null);
  const [banco, setBanco] = useState({
    idBanco: "",
    bancoNombre: "",
    idTipoCuenta: "",
    nombreTipoCuenta: "",
    numeroCuenta: "",
  });
  const [bancos, setBancos] = useState([]);
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [bloquearTodo, setBloquearTodo] = useState(false);

  const [filtroBanco, setFiltroBanco] = useState("");
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        const bancosRaw = await getCatalogoBancos();
        const tiposCuentaRaw = await getCatalogoTiposCuenta();
        setSolicitudData(data);

        setBloquearTodo(data.faseProceso !== 1);

        setBanco({
          idBanco: data.banco.idBanco ?? "",
          bancoNombre: data.banco.bancoNombre ?? "",
          idTipoCuenta: data.banco.idTipoCuenta ?? "",
          nombreTipoCuenta: data.banco.nombreTipoCuenta ?? "",
          numeroCuenta: data.banco.numeroCuenta ?? "",
        });

        setBancos(
          bancosRaw.map((b) => ({ id: String(b.idBanco), nombre: b.bancoNombre }))
        );
        setTiposCuenta(
          tiposCuentaRaw.map((t) => ({ id: String(t.idTipoCuenta), nombre: t.nombre }))
        );
      } catch (err) {
        toast.error("Error al cargar datos de banco: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const validarCampos = () => {
    const nuevosErrores = {};
    if (!banco.idBanco) nuevosErrores.idBanco = "Banco es obligatorio";
    if (!banco.idTipoCuenta) nuevosErrores.idTipoCuenta = "Tipo de cuenta es obligatorio";
    if (!banco.numeroCuenta || banco.numeroCuenta.trim() === "")
      nuevosErrores.numeroCuenta = "Número de cuenta es obligatorio";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!solicitudData || bloquearTodo) return;

    if (!validarCampos()) {
      toast.error("Por favor complete los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        banco,
      };
      const res = await updateSolicitud(id, payload);
      if (res.success) toast.success("Datos de banco actualizados.");
      else toast.error("Error al actualizar datos de banco.");
    } catch (err) {
      toast.error("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtro bancos por texto fuera del dropdown
  const bancosFiltrados = bancos.filter((b) =>
    b.nombre.toLowerCase().includes(filtroBanco.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 relative">
      <GlassLoader visible={loading} message="Cargando datos de banco..." />
      {!loading && (
        <>
          <h2 className="text-xl font-semibold">Datos bancarios del cliente</h2>
          {bloquearTodo && (
            <div className="w-full flex items-center px-6 py-2 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold">
              <span>No se permite editar datos bancarios en esta fase.</span>
            </div>
          )}
          <Button onClick={handleGuardar} disabled={loading || bloquearTodo} className="text-white">
            Guardar datos
          </Button>
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Banco <span className="text-red-600">*</span>
                </Label>
                <Input
                  placeholder="Buscar banco..."
                  value={filtroBanco}
                  onChange={(e) => setFiltroBanco(e.target.value)}
                  disabled={bloquearTodo}
                  className="mb-2"
                />
                <Select
                  value={String(banco.idBanco)}
                  onValueChange={(value) => setBanco({ ...banco, idBanco: value })}
                  disabled={bloquearTodo}
                  className={errores.idBanco ? "border-red-600" : ""}
                >
                  <SelectTrigger className={`bg-white border ${errores.idBanco ? "border-red-600" : "border-gray-700"}`}>
                    <SelectValue placeholder="Seleccione un banco" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-xl z-[9999] max-h-60 overflow-auto">
                    {bancosFiltrados.length > 0 ? (
                      bancosFiltrados.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500">No se encontraron bancos</div>
                    )}
                  </SelectContent>
                </Select>
                {errores.idBanco && (
                  <p className="text-sm text-red-600 mt-1">{errores.idBanco}</p>
                )}
              </div>

              <FormSelect
                label="Tipo de Cuenta *"
                options={tiposCuenta}
                value={banco.idTipoCuenta}
                onChange={(value) => setBanco({ ...banco, idTipoCuenta: value })}
                disabled={bloquearTodo}
                error={errores.idTipoCuenta}
              />
              <FormInput
                label="Número de Cuenta *"
                value={banco.numeroCuenta}
                onChange={(e) =>
                  setBanco({ ...banco, numeroCuenta: e.target.value })
                }
                disabled={bloquearTodo}
                error={errores.numeroCuenta}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Componentes reutilizables
function FormInput({ label, value, onChange, type = "text", disabled, error }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {error && <span className="text-red-600 ml-1 text-sm">*</span>}
      </Label>
      <Input
        placeholder="---"
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={error ? "border-red-600" : ""}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

function FormSelect({ label, options, value, onChange, disabled, error }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {error && <span className="text-red-600 ml-1 text-sm">*</span>}
      </Label>
      <Select value={String(value)} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={`bg-white border ${error ? "border-red-600" : "border-gray-700"}`}
        >
          <SelectValue placeholder="Seleccione una opción" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-xl z-[9999] max-h-60 overflow-auto">
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
