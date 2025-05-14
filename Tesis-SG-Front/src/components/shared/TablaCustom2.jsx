"use client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogFooter, } from "@/components/ui/dialog";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaPlus, FaFileExport, FaFilePdf, FaFileCsv, FaArrowLeft, FaArrowRight, } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TablaCustom2 = ({
  columns,
  data,
  onAgregarNuevoClick,
  onEditarClick,
  onEliminarClick,
  mostrarAgregarNuevo = true,
  mostrarEditar = true,
  mostrarEliminar = true,
}) => {
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  //console.log("🟢 Datos recibidos por la tabla:", data);

  useEffect(() => {
    setTableData(data || []);
    //console.log("dd", data);
  }, [data]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const filtered = data.filter((item) =>
        Object.values(item)
          .join("")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setTableData(filtered);
    }
  }, [searchTerm, data]);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIndicator = (columnName) => {
    if (columnName !== sortColumn)
      return <FaSort className="ml-1 text-muted" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="ml-1 text-blue-600" />
    ) : (
      <FaSortDown className="ml-1 text-blue-600" />
    );
  };

  const sortedData = [...tableData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (typeof valA === "string") {
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortDirection === "asc" ? valA - valB : valB - valA;
  });

  const offset = currentPage * itemsPerPage;
  const currentPageData = sortedData.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleInputChange = (e) => {
    setNewRowData({ ...newRowData, [e.target.name]: e.target.value });
  };

  const handleAddRow = () => {
    setTableData([...tableData, newRowData]);
    setModalOpen(false);
    setNewRowData({});
  };

  const exportToCSV = (rows, cols, filename = "export.csv") => {
    const csvContent = [
      cols.join(","),
      ...rows.map((row) =>
        cols
          .map((col) => `"${(row[col] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (rows, cols, filename = "export.pdf") => {
    const doc = new jsPDF();
    const tableData = rows.map((row) => cols.map((col) => row[col] ?? ""));
    autoTable(doc, {
      head: [cols],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 },
    });
    doc.save(filename);
  };
  const handleAgregarNuevo = () => {
    if (onAgregarNuevoClick && mostrarAgregarNuevo) {
      onAgregarNuevoClick(); // Simplemente llama a la función proporcionada
    }
  };
  const handleOpenDeleteDialog = (row) => {
    setRowToDelete(row);
    setConfirmDialogOpen(true);
  };
  const handleConfirmDelete = () => {
    if (onEliminarClick && rowToDelete) {
      onEliminarClick(rowToDelete);
    }
    setConfirmDialogOpen(false);
    setRowToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Botón Agregar Nuevo (izquierda) */}
        {mostrarAgregarNuevo && (
          <Button
            // onClick={() => setModalOpen(true)}
            onClick={handleAgregarNuevo}
            className="bg-primary text-gray-100 hover:text-white hover:bg-primary/90 cursor-pointer flex items-center gap-2"
          >
            <FaPlus className="text-white" /> Agregar Nuevo
          </Button>
        )}
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Dropdown de exportación (derecha) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FaFileExport /> Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="backdrop-blur-2xl">
            <DropdownMenuItem
              onClick={() =>
                exportToCSV(
                  sortedData,
                  columns.map((c) => c.key),
                  "datos_exportados.csv"
                )
              }
              className="flex items-center gap-2"
            >
              <FaFileCsv className="text-blue-500" /> Exportar como CSV
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                exportToPDF(
                  sortedData,
                  columns.map((c) => c.key),
                  "datos_exportados.pdf"
                )
              }
              className="flex items-center gap-2"
            >
              <FaFilePdf className="text-red-500" /> Exportar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto w-full">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  onClick={() =>
                    column.label !== "Acciones" && handleSort(column.key)
                  }
                  className="cursor-pointer select-none"
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.label !== "Acciones" && getSortIndicator(data.key)}
                  </div>
                </TableHead>
              ))}
              {(mostrarEditar || mostrarEliminar) && (
                <TableHead>Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length > 0 ? (
              currentPageData.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                  {(mostrarEditar || mostrarEliminar) && (
                    <TableCell className="flex gap-2">
                      {mostrarEditar && (
                        <Button
                          size="sm"
                          className="bg-white text-emerald-500 border border-emerald-500 hover:bg-emerald-500 hover:text-white cursor-pointer"
                          onClick={() => onEditarClick && onEditarClick(row)}
                        >
                          <FaEdit className="mr-1" /> Editar
                        </Button>

                      )}
                      {mostrarEliminar && (
                        <Button
                          size="sm"
                          className="bg-white text-red-400 border border-red-400 hover:bg-red-400 hover:text-white cursor-pointer"
                          onClick={() => handleOpenDeleteDialog(row)}
                        >
                          <FaTrash className="mr-1" size={14} /> Eliminar
                        </Button>

                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center text-muted py-4"
                >
                  No hay datos registrados aún.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <ReactPaginate
          previousLabel={
            <span className="flex items-center gap-1">
              <FaArrowLeft /> Anterior
            </span>
          }
          nextLabel={
            <span className="flex items-center gap-1">
              Siguiente <FaArrowRight />
            </span>
          }
          breakLabel="..."
          pageCount={Math.ceil(sortedData.length / itemsPerPage)}
          onPageChange={handlePageClick}
          containerClassName="flex gap-1 flex-wrap"
          pageClassName="px-3 py-1 border rounded hover:bg-gray-100"
          activeClassName="bg-blue-500 text-white"
          previousClassName="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
          nextClassName="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
          breakClassName="px-3 py-1"
          disabledClassName="opacity-50 cursor-not-allowed"
        />

        <div className="flex items-center gap-2">
          <label>Filas por página:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 15, 20, 35, 50, 100].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>Agregar Nueva Fila</DialogHeader>
          <DialogTitle></DialogTitle>
          <div className="space-y-3">
            {columns.map((col) => (
              <div key={col.key}>
                <label className="block text-sm">{col.label}</label>
                <Input name={col.key} onChange={handleInputChange} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleAddRow}>Guardar</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>Confirmar Eliminación</DialogHeader>
          <p>¿Estás seguro que deseas eliminar este registro?</p>
          <DialogFooter>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Confirmar
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TablaCustom2;
