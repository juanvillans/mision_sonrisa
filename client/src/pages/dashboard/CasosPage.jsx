import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { casesAPI } from "../../services/api.js";
import { Icon } from "@iconify/react";
import Modal from "../../components/Modal.jsx";
import FuturisticButton from "../../components/FuturisticButton.jsx";
import FormField from "../../components/forms/FormField.jsx";
import { CircularProgress } from "@mui/material";
import { useFeedback } from "../../context/FeedbackContext.jsx";
import { MaterialReactTable } from "material-react-table";
import debounce from "lodash.debounce";
import { useAuth } from "../../context/AuthContext.jsx";

// Constantes para los ENUMs
const ORIGIN_OPTIONS = [
  { value: "Misión sonrisa", label: "Misión sonrisa" },
  { value: "1x10", label: "1x10" },
];

const SEX_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];

const PROSTHESIS_TYPE_OPTIONS = [
  { value: "Total", label: "Total" },
  { value: "Total Bimaxilar", label: "Total Bimaxilar" },
  { value: "Total Superior", label: "Total Superior" },
  { value: "Total Inferior", label: "Total Inferior" },
  { value: "Parcial", label: "Parcial" },
  { value: "Parcial Bimaxilar", label: "Parcial Bimaxilar" },
  { value: "Parcial Superior", label: "Parcial Superior" },
  { value: "Parcial Inferior", label: "Parcial Inferior" },
];

const STATUTE_OPTIONS = [
  { value: "En proceso", label: "En proceso", color: "#f59e0b" }, // Amarillo
  { value: "Terminado", label: "Terminado", color: "#10b981" }, // Verde
  { value: "Entregado", label: "Entregado", color: "#3b82f6" }, // Azul
];
const currentDate = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

const defaultFormData = {
  name: "",
  ci: "",
  origin: "",
  sex: "",
  birth_date: "",
  age: "",
  phone: "",
  email: "",
  address: "",
  type_of_prosthesis: "",
  tooth_color: "",
  creation_date: currentDate,
  number_of_models: 0,
  is_tdi_completed: false,
  tdi_date: null,
  number_of_tdi: 0,
  model_only: false,
  model_rodete: false,
  is_rdm_completed: false,
  rdm_date: null,
  is_threaded_completed: false,
  threaded_date: null,
  is_polished_completed: false,
  polished_date: null,
  statute: "En proceso",
  observation: "",
};

let isThereLocalStorageFormData = localStorage.getItem("formData")
  ? true
  : false;

export default function CasosPage() {
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, showInfo } = useFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [origins, setOrigins] = useState([]);
  const [prosthesisTypes, setProsthesisTypes] = useState([]);
  const [statutes, setStatutes] = useState([]);
  const { user } = useAuth();

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      // Obtener orígenes únicos
      setOrigins(ORIGIN_OPTIONS);
      setProsthesisTypes(PROSTHESIS_TYPE_OPTIONS);
      setStatutes(STATUTE_OPTIONS);
    } catch (e) {
      console.error("Failed to fetch data", e);
      // Fallback a opciones estáticas
      setOrigins(ORIGIN_OPTIONS);
      setProsthesisTypes(PROSTHESIS_TYPE_OPTIONS);
      setStatutes(STATUTE_OPTIONS);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const [formData, setFormData] = useState(structuredClone(defaultFormData));

  // Form fields configuration - solo los campos base
  const baseFormFields = useMemo(
    () => [
      {
        name: "creation_date",
        label: "Fecha de Creación",
        type: "date",
        className: "col-span-12",
        required: true,
      },
      {
        name: "name",
        label: "Nombre y apellido",
        type: "text",
        required: true,
        className: "col-span-6",
      },
      {
        name: "ci",
        label: "Cédula",
        type: "text",
        className: "col-span-6",
      },
      {
        name: "origin",
        label: "Origen",
        type: "select",
        options: origins,
        className: "col-span-6",
      },
      {
        name: "sex",
        label: "Sexo",
        type: "select",
        options: SEX_OPTIONS,
        className: "col-span-6",
      },
      {
        name: "birth_date",
        label: "Fecha de Nacimiento",
        type: "date",
        className: "col-span-4",
      },
      {
        name: "age",
        label: "Edad",
        type: "number",
        className: "col-span-2 ",
      },
      {
        name: "phone",
        label: "Teléfono",
        type: "text",
        className: "col-span-6",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        className: "col-span-6",
      },

      {
        name: "tooth_color",
        label: "Color de Diente",
        type: "text",
        className: "col-span-6",
      },
      {
        name: "address",
        label: "Dirección",
        type: "text",
        className: "col-span-12",
        multiline: true,
      },
      {
        name: "observation",
        label: "Observación",
        type: "text",
        multiline: true,
        className: "col-span-12",
      },
    ],
    [origins],
  );

  // Campos condicionales (checkboxes + sus fechas asociadas)
  const conditionalFields = useMemo(
    () => [
      {
        checkbox: "is_tdi_completed",
        dateField: "tdi_date",
        numberField: "number_of_tdi",
        label: "TDI",
        checkboxLabel: "TDI",
      },
      {
        checkbox: "is_rdm_completed",
        dateField: "rdm_date",
        label: "RDM",
        checkboxLabel: "RDM",
      },
      {
        checkbox: "is_threaded_completed",
        dateField: "threaded_date",
        label: "Roscado",
        checkboxLabel: "Roscado",
      },
      {
        checkbox: "is_polished_completed",
        dateField: "polished_date",
        label: "Pulido",
        checkboxLabel: "Pulido",
      },
    ],
    [],
  );

  // Función para renderizar campos condicionales
  const renderConditionalFields = useCallback(() => {
    return conditionalFields.map((item) => {
      const isChecked = formData[item.checkbox];

      return (
        <div
          className="grid grid-cols-12 items-center gap-1"
          key={item.checkbox}
        >
          {/* Checkbox */}
          <FormField
            name={item.checkbox}
            label={item.checkboxLabel}
            type="checkbox"
            className="col-span-4"
            value={formData[item.checkbox]}
            onChange={handleChangeValue}
          />

          {/* Fecha (visible solo si el checkbox está marcado) */}
          {isChecked && (
            <FormField
              name={item.dateField}
              label={`Fecha ${item.label}`}
              type="date"
              className="col-span-5"
              value={formData[item.dateField] || ""}
              onChange={handleChangeValue}
              required={isChecked}
            />
          )}

          {/* Campo de número para TDI (visible solo si TDI está marcado) */}
          {item.checkbox === "is_tdi_completed" && isChecked && (
            <FormField
              name="number_of_tdi"
              label="Nro TDI"
              type="number"
              className="col-span-3"
              value={formData.number_of_tdi || 0}
              onChange={handleChangeValue}
              required={isChecked}
            />
          )}
        </div>
      );
    });
  }, [formData, conditionalFields]);

  // Campos de "model_only" y "model_rodete" (siempre visibles)
  const modelFields = useMemo(
    () => [
      {
        name: "type_of_prosthesis",
        label: "Tipo de Prótesis",
        type: "select",
        required: true,
        options: prosthesisTypes,
        className: "col-span-4",
      },

      {
        name: "number_of_models",
        label: "Número de Modelos",
        type: "number",
        className: "col-span-4",
      },
      {
        name: "model_only",
        label: "Modelo (solo)",
        type: "checkbox",
        className: "col-span-2",
      },
      {
        name: "model_rodete",
        label: "Modelo (Rodete)",
        type: "checkbox",
        className: "col-span-2",
      },
    ],
    [prosthesisTypes],
  );

  const [submitString, setSubmitString] = useState("Registrar");
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar campos requeridos

      if (!formData.name) {
        showError("El campo 'Nombre' es requerido");
        setLoading(false);
        return;
      }
      if (!formData.type_of_prosthesis) {
        showError("El campo 'Tipo de Prótesis' es requerido");
        setLoading(false);
        return;
      }

      // Validar que si un checkbox está marcado, su fecha también esté presente
      const conditionalValidation = conditionalFields.every((item) => {
        if (formData[item.checkbox] && !formData[item.dateField]) {
          showError(
            `La fecha de ${item.label} es requerida cuando está completado`,
          );
          return false;
        }
        return true;
      });

      if (!conditionalValidation) {
        setLoading(false);
        return;
      }

      // Validar TDI number
      if (
        formData.is_tdi_completed &&
        (!formData.number_of_tdi || formData.number_of_tdi <= 0)
      ) {
        showError("El número de TDI es requerido cuando TDI está completado");
        setLoading(false);
        return;
      }

      const internalRequest =
        submitString === "Actualizar"
          ? casesAPI.updateCase(formData.id, formData)
          : casesAPI.createCase(formData);

      await internalRequest;

      if (submitString === "Actualizar") {
        setSubmitString("Registrar");
      }

      showSuccess("Operación completada con éxito");
      setFormData(structuredClone(defaultFormData));
      setIsModalOpen(false);
      setIsFormInitialized(false);
      fetchData();
      localStorage.removeItem("formData");
      localStorage.removeItem("submitString");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error en el sistema principal";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("¿Está seguro de eliminar este caso?")) {
        return;
      }
      await casesAPI.deleteCase(id);
      showSuccess("Caso eliminado con éxito");
      fetchData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      showError(errorMessage);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Código",
        size: 120,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "name",
        header: "Nombre",
        size: 150,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "ci",
        header: "Cédula",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "origin",
        header: "Origen",
        size: 120,
        enableColumnFilter: true,
        enableSorting: true,
        filterVariant: "select",
        filterSelectOptions: ORIGIN_OPTIONS.map((opt) => opt.value),
      },
      {
        accessorKey: "sex",
        header: "Sexo",
        size: 80,
        enableColumnFilter: true,
        enableSorting: true,
        filterVariant: "select",
        filterSelectOptions: ["M", "F"],
        Cell: ({ cell }) =>
          cell.getValue() === "M" ? "Masculino" : "Femenino",
      },
      {
        accessorKey: "phone",
        header: "Teléfono",
        size: 120,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "type_of_prosthesis",
        header: "Tipo de Prótesis",
        size: 150,
        enableColumnFilter: true,
        enableSorting: true,
        filterVariant: "select",
        filterSelectOptions: PROSTHESIS_TYPE_OPTIONS.map((opt) => opt.value),
      },
      {
        accessorKey: "creation_date",
        header: "Fecha Creación",
        size: 130,
        enableColumnFilter: true,
        enableSorting: true,
        Cell: ({ cell }) => {
          const dateString = cell.getValue();
          if (!dateString) return "N/A";
          return new Date(dateString).toLocaleDateString();
        },
      },
      {
        accessorKey: "statute",
        header: "Estatuto",
        size: 140,
        enableColumnFilter: true,
        enableSorting: true,
        filterVariant: "select",
        filterSelectOptions: STATUTE_OPTIONS.map((opt) => opt.value),
        Cell: ({ cell }) => {
          const statute = STATUTE_OPTIONS.find(
            (s) => s.value === cell.getValue(),
          );
          return (
            <div
              className="px-3 py-1 rounded-full text-sm font-bold text-white text-center"
              style={{ backgroundColor: statute?.color || "#6b7280" }}
            >
              {cell.getValue()}
            </div>
          );
        },
      },
      {
        accessorKey: "is_tdi_completed",
        header: "TDI",
        size: 80,
        enableColumnFilter: true,
        enableSorting: true,
        Cell: ({ cell }) => (
          <span
            className={cell.getValue() ? "text-green-600" : "text-gray-400"}
          >
            {cell.getValue() ? "✅" : "❌"}
          </span>
        ),
      },
      {
        accessorKey: "is_rdm_completed",
        header: "RDM",
        size: 80,
        enableColumnFilter: true,
        enableSorting: true,
        Cell: ({ cell }) => (
          <span
            className={cell.getValue() ? "text-green-600" : "text-gray-400"}
          >
            {cell.getValue() ? "✅" : "❌"}
          </span>
        ),
      },
      {
        header: "Acciones",
        accessorKey: "actions",
        enableColumnFilter: false,
        enableSorting: false,
        size: 120,
        Cell: ({ cell }) => {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setFormData({ ...cell.row.original });
                  setSubmitString("Actualizar");
                }}
                className="text-blue-500 p-1 rounded-full hover:bg-blue-50 hover:underline"
                title="Editar"
              >
                <Icon icon="material-symbols:edit" width={20} height={20} />
              </button>
              <button
                onClick={() => handleDelete(cell.row.original.id)}
                className="text-red-500 p-1 rounded-full hover:bg-red-50 hover:underline"
                title="Eliminar"
              >
                <Icon
                  icon="material-symbols:delete-outline"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Server-side state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await casesAPI.getCases({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortField: sorting[0]?.id || "created_at",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
        search: globalFilter,
        filters: JSON.stringify(
          columnFilters.reduce((acc, curr) => {
            acc[curr.id] = curr.value;
            return acc;
          }, {}),
        ),
      });
      console.log({ res });
      setData(res.data.cases);
      setRowCount(res.data.pagination.total);
    } catch (e) {
      console.error("Failed to fetch data", e);
      showError("Error al cargar los datos");
    }
    setIsLoading(false);
  }, [pagination, sorting, columnFilters, globalFilter, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced save form data
  const debouncedSaveFormData = useMemo(
    () =>
      debounce((data, submitStr) => {
        const { photo, ...dataWithoutPhoto } = data;
        localStorage.setItem("formData", JSON.stringify(dataWithoutPhoto));
        localStorage.setItem("submitString", JSON.stringify(submitStr));
      }, 300),
    [],
  );

  useEffect(() => {
    if (isFormInitialized) {
      debouncedSaveFormData(formData, submitString);
    }
  }, [formData, debouncedSaveFormData, isFormInitialized]);

  // Debounced global filter
  const debouncedGlobalFilter = useMemo(
    () =>
      debounce((value) => {
        setGlobalFilter(value);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }, 300),
    [],
  );

  const handleChangeValue = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };

        // Si se desmarca un checkbox, limpiar su fecha asociada
        if (type === "checkbox") {
          const conditionalItem = conditionalFields.find(
            (item) => item.checkbox === name,
          );
          if (conditionalItem && !checked) {
            newData[conditionalItem.dateField] = "";
            if (conditionalItem.checkbox === "is_tdi_completed") {
              newData.number_of_tdi = 0;
            }
          }
        }

        return newData;
      });
      setIsFormInitialized(true);
    },
    [conditionalFields],
  );

  return (
    <>
      <title>Casos</title>
      <div style={{ height: 580, width: "100%" }}>
        <div className="md:flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-0">
              Casos
            </h1>
          </div>
          <div className="flex gap-3 relative">
            {isThereLocalStorageFormData && (
              <button
                title="Restaurar formulario sin guardar"
                className="hover:shadow-lg hover:bg-gray-100 flex gap-1 items-center text-gray-600 bg-gray-200 rounded-xl font-bold px-3"
                onClick={() => {
                  const savedData = JSON.parse(
                    localStorage.getItem("formData"),
                  );
                  setFormData(savedData);
                  setSubmitString(
                    JSON.parse(localStorage.getItem("submitString")),
                  );
                  setIsModalOpen(true);
                }}
              >
                <small className="text-gray-500">Recuperar</small>
                <Icon
                  icon="line-md:backup-restore"
                  className="w-6 h-6 text-gray-500"
                />
              </button>
            )}

            <FuturisticButton
              onClick={() => {
                setIsModalOpen(true);
                if (submitString === "Actualizar") {
                  setSubmitString("Registrar");
                  setFormData(structuredClone(defaultFormData));
                }
              }}
            >
              Registrar Caso
            </FuturisticButton>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          title={
            submitString === "Actualizar" ? "Actualizar Caso" : "Registrar Caso"
          }
          size="full"
        >
          <form
            className="px-12 space-y-5 gap-7 w-full relative"
            onSubmit={onSubmit}
          >
            <div className="space-y-3 z-10 md:sticky top-0 h-max mb-24 grid grid-cols-12 gap-10">
              <div className="grid grid-cols-12 gap-4 col-span-5">
                {/* Campos base */}
                {baseFormFields.map((field) => (
                  <FormField
                    key={field.name}
                    {...field}
                    value={formData[field.name]}
                    onChange={handleChangeValue}
                  />
                ))}
              </div>
              {/* Campos de modelo */}

              <div className="col-span-3 space-y-2">
                {modelFields.map((field) => (
                  <FormField
                    key={field.name}
                    {...field}
                    value={formData[field.name]}
                    onChange={handleChangeValue}
                  />
                ))}
              </div>

              {/* Campos condicionales (checkboxes con sus fechas) */}
              <div className="col-span-4 space-y-4 ">
                {renderConditionalFields()}
              </div>
            </div>

            <div className="col-span-12">
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-16 py-3 rounded-md font-semibold hover:opacity-90 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    submitString === "Actualizar"
                      ? "bg-sky-200 text-white"
                      : "bg-pink text-color1"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <CircularProgress size={20} color="inherit" />
                      Procesando...
                    </span>
                  ) : (
                    submitString
                  )}
                </button>
              </div>
            </div>
          </form>
        </Modal>

        {!isModalOpen && (
          <div
            className="ag-theme-alpine ag-grid-no-border"
            style={{ height: 500 }}
          >
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
                columnVisibility: {
                  email: false,
                  address: false,
                  observation: false,
                },
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
                placeholder: "Buscar casos...",
                sx: { minWidth: "300px" },
                variant: "outlined",
              }}
              enableColumnResizing={true}
              muiTableBodyRowProps={({ row }) => {
                const statute = STATUTE_OPTIONS.find(
                  (s) => s.value === row.original.statute,
                );
                return {
                  sx: {
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "sticky",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      backgroundColor: statute?.color || "#ccc",
                      zIndex: 1,
                      display: "block",
                    },
                  },
                };
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
