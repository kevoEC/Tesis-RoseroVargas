import Adjuntos from "@/components/solicitud/Adjuntos";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTareaById } from "@/service/Entidades/TareasService";

export default function TareaDetalleEditable() {
  const [descripcion, setDescripcion] = useState(
    "Hacer firmar por gerencia y el cliente el contrato o adendum y anexo de inversión, y adjuntar a la plataforma."
  );
  const { id } = useParams();
  const [resultado, setResultado] = useState("Pendiente");
  const [observacion, setObservacion] = useState("");
  const [tareas, setTareas] = useState([]);
  const [firmadoGerencia, setFirmadoGerencia] = useState(false);
  const [solicitarAbono, setSolicitarAbono] = useState(false);
  const [reconocimientoFirmas, setReconocimientoFirmas] = useState(true);
  const [modoFirma, setModoFirma] = useState("Física");
  const cargarTareas = async () => {
      try {
        const data = await getTareaById(id);
        setTareas(data.data);
        console.log("ladata: "+JSON.stringify(data));
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      }
    };
    useEffect(() => {
      cargarTareas();
    }, []);
 
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 bg-white shadow rounded-xl">
      {/* Encabezado */}
      <div className="text-2xl font-bold mb-6">
        Contrato - Nueva - 
        <span className="font-normal text-gray-700">
          {tareas.tareaNombre}
        </span>
        <div className="text-sm text-gray-500 mt-1">Tarea de solicitud</div>
      </div>

      {/* Contenido en dos columnas */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* Columna Izquierda */}
        <div className="space-y-10">
          {/* Descripción */}
          <section className="border border-gray-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Descripción
            </h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 resize-y focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </section>

          {/* Firmado por gerencia / Switches */}
          <section className="border border-gray-300 rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Firmado por gerencia / Configuración
            </h2>
            <Switch
              label="Firmado por gerencia"
              checked={firmadoGerencia}
              onChange={setFirmadoGerencia}
            />
            <div>
              <label className="text-sm font-medium text-gray-800">
                Modo de firma
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-1 text-gray-900 focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                value={modoFirma}
                onChange={(e) => setModoFirma(e.target.value)}
              >
                <option value="Física">Física</option>
                <option value="Digital">Digital</option>
              </select>
            </div>
          </section>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-10">
          {/* Resultado */}
          <section className="border border-gray-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Resultado
            </h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
              value={tareas.idResultado}
              onChange={(e) => setResultado(e.target.value)}
            />
            <label className="block text-sm font-medium text-gray-800 mt-5 mb-1">
              Observación
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 resize-y focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              value={tareas.observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </section>

        </div>
      </div>
      <Adjuntos id={13} tipo={"tareas"} />
    </div>
  );
}

function Switch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium">{label}</label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/80 rounded-full peer peer-checked:bg-primary transition-all"></div>
        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
      </label>
    </div>
  );
}
