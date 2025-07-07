// utils/mappers.js

export const mapIdentificacionToUpdate = (ident) => ({
  tipoSolicitud: ident?.idTipoSolicitud ?? ident?.tipoSolicitud ?? null,
  tipoCliente: ident?.idTipoCliente ?? ident?.tipoCliente ?? null,
  tipoDocumento: ident?.idTipoDocumento ?? ident?.tipoDocumento ?? null,
  numeroDocumento: ident?.numeroDocumento ?? "",
  nombres: ident?.nombres ?? "",
  apellidoPaterno: ident?.apellidoPaterno ?? "",
  apellidoMaterno: ident?.apellidoMaterno ?? "",
  validar: ident?.validar ?? false,
  equifax: ident?.equifax ?? "",
  obsEquifax: ident?.obsEquifax ?? "",
  listasControl: ident?.listasControl ?? "",
  obsListasControl: ident?.obsListasControl ?? "",
  continuar: Number(ident?.continuar ?? 1),
});

// utils/mappers.js

export const mapProyeccionToUpdate = (proy) => ({
  idAsesorComercial: Number(proy?.idAsesorComercial) || null,
  idJustificativoTransaccion: Number(proy?.idJustificativoTransaccion) || null,
  idProyeccionSeleccionada: Number(proy?.idProyeccionSeleccionada) || null,
  origenFondos: proy?.origenFondos ?? "",
  enviarProyeccion: !!proy?.enviarProyeccion,
  clienteAcepta: !!proy?.clienteAcepta,
});
