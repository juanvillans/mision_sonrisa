import React, { useState, useEffect, useCallback, useMemo } from "react";
import { excelImportAPI } from "../../services/api";
import { useFeedback } from "../../context/FeedbackContext";
import { MaterialReactTable } from "material-react-table";
import { useAuth } from "../../context/AuthContext";
import debounce from "lodash.debounce";
import { Icon } from "@iconify/react";
import FormField from "../../components/forms/FormField";
import Modal from "../../components/Modal";

export default function ImportPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useFeedback();
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmingDeleteModalOpen, setIsConfirmingDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [selectedBatch, setSelectedBatch] = useState({}); // State to track the batch ID to be deleted

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedGlobalFilter = useMemo(
    () => debounce(setGlobalFilter, 300),
    [],
  );

 const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await excelImportAPI.getImportHistory({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortField: sorting[0]?.id || "id",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
        search: globalFilter, // Global search
        filters: JSON.stringify(
          columnFilters.reduce((acc, curr) => {
            acc[curr.id] = curr.value;
            return acc;
          }, {}),
        ),
      });
      setData(res.data.batches);
      setRowCount(res.data.total);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
    setIsLoading(false);
  }, [pagination, sorting, columnFilters, globalFilter]);

  const handleDelete = useCallback(async (id) => {
    try {
    
      const res = await excelImportAPI.deleteBatch(id);
      if (res.status) {
        showSuccess("Lote de importación eliminado con éxito");
      }
      fetchData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      showError(errorMessage);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 50,
      },
      {
        accessorKey: "filename",
        header: "Nombre de Archivo",
        size: 150,
      },
      {
        accessorKey: "total_records",
        header: "Total Registros",
        size: 100,
      },
      {
        accessorKey: "imported_records",
        header: "Importados",
        size: 100,
      },
      {
        accessorKey: "failed_records",
        header: "Fallidos",
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Estado",
        size: 100,
      },
      {
        accessorKey: "user_name",
        header: "Importado por",
        size: 100,
      },
      {
        accessorKey: "created_at",
        header: "Fecha de Importación",
        size: 150,
        Cell: ({ cell }) => {
          const dateString = cell.getValue();

          // Safety check in case the value is null or undefined
          if (!dateString) return "N/A";

          return new Date(dateString).toLocaleString(navigator.language, {
            dateStyle: "medium",
            timeStyle: "short",
          });
        },
      },
      {
        accessorKey: "actions",
        header: "Acciones",
        size: 100,
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsConfirmingDeleteModalOpen(true);
                setSelectedBatch(row.original); // Set the batch ID to be deleted
              }}
              className="text-red-500 hover:text-red-700"
              
              title="Eliminar"
              
            >
              <Icon icon="material-symbols:delete-outline" width={20} height={20} />
            </button>
            <button
              onClick={() => {
                console.log("View details for row:", row.original);
              }}
              className="text-blue-500 hover:text-blue-700"
            >
              Ver Detalles
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const handleFileUpload = useCallback(async (e) => {
    setIsUploading(true);
    const file = e.target.files[0];
    console.log("Selected file:", file);
    console.log(e.target.value)
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      await excelImportAPI.uploadExcel(formData);
      showSuccess("Archivo importado con éxito");
      fetchData();
    } catch (error) {
      console.error("Error uploading file:", error);
      showError("Error al importar el archivo");
    } finally {
      setIsUploading(false);
    }
  }, [fetchData]);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-bold mb-4 ">
          Historial de importaciones
        </h1>

        <label
          htmlFor="file-upload"
          className="items-center cursor-pointer flex p-2 py-2.5 bg-gray-200 hover:bg-gray-300 gap-2 rounded-md"
        >
          <Icon
            icon="streamline-ultimate:common-file-text-add-bold"
            width={24}
            height={24}
          />
          <span>Importar</span>
          <Icon icon="vscode-icons:file-type-excel" width={24} height={24} />
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => {
                if (window.confirm(`¿Está seguro de que desea importar el archivo ${e.target.files[0]?.name || "el archivo seleccionado"}?`)) {
                    handleFileUpload(e);
                }
            }}
            className="hidden"
          />
        </label>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span>Importando...</span>
          <p>Esto puede tardar unos minutos, por favor sea paciente.</p>
        </div>
      )}

{!isConfirmingDeleteModalOpen && (
      <MaterialReactTable
        columns={columns}
        data={data}
        rowCount={rowCount}
        manualPagination
        manualSorting
        manualFiltering
        manualGlobalFilter
        initialState={{
          density: "compact",
        }}
        state={{
          pagination,
          sorting,
          columnFilters,
          globalFilter,
          isLoading,
        }}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={(value) => debouncedGlobalFilter(value)}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        enableFilters={true}
        muiTablePaginationProps={{
          rowsPerPageOptions: [25, 50, 100],
          showFirstButton: true,
          showLastButton: true,
        }}
        muiSearchTextFieldProps={{
          placeholder: "Buscar",
          sx: { minWidth: "300px" },
          variant: "outlined",
        }}
      />
      )}

    <Modal
    isOpen={isConfirmingDeleteModalOpen}
    onClose={() => setIsConfirmingDeleteModalOpen(false)}
    title="Confirmar eliminación"
    description="¿Está seguro de que desea eliminar este lote de importación? Esta acción no se puede deshacer."
    >
      <p>¿Está seguro de que desea eliminar este lote de importación {selectedBatch?.filename}? Esta acción eliminará el lote y todos los {selectedBatch?.total_records} registros asociados, no se puede deshacer.</p>
      <div className="flex justify-end gap-4 mt-5">
        <button
          onClick={() => setIsConfirmingDeleteModalOpen(false)}
          className="bg-gray-300 hover:shadow-xl hover:brightness-110 rounded-xl p-3 px-5"
        >
          Cancelar
        </button>
        <FormField
        type="text"
        placeholder="Escribe 'ELIMINAR' para confirmar"
        value={deleteConfirmationText}
        onChange={(e) => setDeleteConfirmationText(e.target.value)}
        />
        <button
          onClick={() => {
            if (deleteConfirmationText === "ELIMINAR") {
              handleDelete(selectedBatch.id); // Use the selected batch's ID for deletion
              setIsConfirmingDeleteModalOpen(false);
            }
          }}
          className="bg-red-500 hover:shadow-xl hover:brightness-110 rounded-xl p-3 px-5 text-white"
        >
          Eliminar
        </button>
      </div>
    </Modal>
    </div>
  );
}
