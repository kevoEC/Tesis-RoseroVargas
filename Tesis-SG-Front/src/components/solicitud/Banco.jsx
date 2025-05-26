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


  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        const bancosRaw = await getCatalogoBancos();
        const tiposCuentaRaw = await getCatalogoTiposCuenta();
        setSolicitudData(data);
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

  const handleGuardar = async () => {
    if (!solicitudData) return;
    try {
      setLoading(true);
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

  if (loading) return <p>Cargando datos de banco...</p>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold">Datos Bancarios</h2>
      <Button onClick={handleGuardar} disabled={loading} className="text-white">
        Guardar datos
      </Button>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormSelect
            label="Banco"
            options={bancos}
            value={banco.idBanco}
            onChange={(value) => setBanco({ ...banco, idBanco: value })}
          />

          <FormSelect
            label="Tipo de Cuenta"
            options={tiposCuenta}
            value={banco.idTipoCuenta}
            onChange={(value) => setBanco({ ...banco, idTipoCuenta: value })}
          />

          <FormInput
            label="Número de Cuenta"
            value={banco.numeroCuenta}
            onChange={(e) =>
              setBanco({ ...banco, numeroCuenta: e.target.value })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Componentes reutilizables
function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input placeholder="---" type={type} value={value} onChange={onChange} />
    </div>
  );
}
function FormSelect({ label, options, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="bg-white border border-gray-700">
          <SelectValue placeholder="Seleccione una opción" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
