import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { API_URL } from "../../config/env.js";

import { casesAPI, statutesAPI } from "../../services/api.js";
import { Icon } from "@iconify/react";
import Modal from "../../components/Modal.jsx";
import FuturisticButton from "../../components/FuturisticButton.jsx";
import FormField from "../../components/forms/FormField.jsx";
import { CircularProgress } from "@mui/material";
import { useFeedback } from "../../context/FeedbackContext.jsx";
import { MaterialReactTable } from "material-react-table";
import debounce from "lodash.debounce";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import withoutPhoto from "../../assets/withoutPhoto.png";
import { cities } from "../../constants/cities.js";
import { Link } from "react-router-dom";

let isThereLocalStorageFormData = localStorage.getItem("formData")
  ? true
  : false;
// Memoized component for test fields to prevent unnecessary re-renders
const MemoizedTestField = React.memo(
  ({ field, value, onChange, testKey, fieldName, id, multiline = false }) => {
    const handleChange = useCallback(
      (e) => {
        onChange(testKey, e);
      },
      [onChange, testKey],
    );

    return (
      <FormField
        key={fieldName + "_" + testKey}
        {...field}
        examination_type_id={testKey}
        value={value || ""}
        onChange={handleChange}
        id={id}
        multiline={multiline}
      />
    );
  },
  // Custom comparison function for better memoization
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.testKey === nextProps.testKey &&
      prevProps.fieldName === nextProps.fieldName &&
      JSON.stringify(prevProps.field) === JSON.stringify(nextProps.field)
    );
  },
);

export default function CasosPage() {
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, showInfo } = useFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [PDFmodal, setPDFmodal] = useState(false);
  const [isCensusModalOpen, setIsCensusModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [PDFdata, setPDFdata] = useState({});
  const [resultsToken, setResultsToken] = useState(null);
  const [origins, setOrigins] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [printButtonId, setPrintButtonId] = useState(null);
  const [administrativeLocations, setAdministrativeLocations] = useState([]);
  const [typePaySheets, setTypePaySheets] = useState([]);
  const [statutes, setStatutes] = useState([]);
  const { user } = useAuth();

  const fetchInitialData = useCallback(async () => {
    try {
      const statutesRes = await statutesAPI.getStatutes();
      const formattedStatutes = statutesRes.data.statutes.map((statute) => ({
        value: statute.id,
        label: statute.name,
        color: statute.color,
      }));
      setStatutes(formattedStatutes);
      console.log(statutesRes);
      // const administrative_locations = await asicAPI.getASIC();
      // // Transform API response to match select component format { value, label }
      // const formattedLocations = administrative_locations.map((location) => ({
      //   value: location.id,
      //   label: location.name,
      // }));
      // setAdministrativeLocations(formattedLocations);

      // const type_pay_sheets = await typePaySheetsAPI.getPaySheets();
      // const formattedTypePaySheets = type_pay_sheets.map((type_pay_sheet) => ({
      //   value: type_pay_sheet.id,
      //   label: type_pay_sheet.name,
      // }));
      // setTypePaySheets(formattedTypePaySheets);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  }, []);
  // Form configuration for ReusableForm

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  {
    /* 
    
    // Datos personales
    "nac": "V",
    "ci": "12345678",
    "full_name": "María Elena Rodríguez Pérez",
    "date_birth": "1975-05-15",
    "sex": "F",
    "city": "Caracas",
    "state": "Distrito Capital",
    "administrative_location_id": 1,
    "phone_number": "+584141234567",
    
    // Datos de pensión
    "type_pension": "Jubilacion",
    "type_pay_sheet_id": 1,
    "last_charge": "Jefe de Departamento",
    "civil_status": "C",
    "minor_child_nro": 2,
    "disabled_child_nro": 0,
    "receive_pension_from_another_organization_status": false,
    "another_organization_name": null,
    "has_authorizations": true,
    
    // Pensión sobrevivencia (condicional - en este caso false)
    "pension_survivor_status": false,
    "fullname_causative": null,
    "age_causative": null,
    "parent_causative": null,
    "sex_causative": null,
    "ci_causative": null,
    "decease_date": null,
    "suspend_payment_status": false,
    "last_payment": null
    */
  }

  const defaultFormData = {
    // Datos personales
    photo: "",
    nac: "V",
    ci: "",
    full_name: "",
    date_birth: "",
    sex: "F",
    city: "Coro",
    state: "Falcón",
    administrative_location_id: 1,
    phone_number: "",

    // Datos de pensión
    type_pension: "Jubilacion",
    type_pay_sheet_id: 1,
    last_charge: "",
    civil_status: "C",
    minor_child_nro: 0,
    disabled_child_nro: 0,
    receive_pension_from_another_organization_status: false,
    another_organization_name: null,
    has_authorizations: true,

    // Pensión sobrevivencia (condicional - en este caso false)
    pension_survivor_status: false,
    fullname_causative: null,
    age_causative: null,
    parent_causative: null,
    sex_causative: null,
    ci_causative: null,
    decease_date: null,
    suspend_payment_status: false,
    last_payment: null,
    fotoChanged: false,
  };

  const [formData, setFormData] = useState(structuredClone(defaultFormData));

  const patientFormFields = useMemo(() => [
    {
      name: "code",
      label: "Código",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "name",
      label: "Denunciante",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "ci",
      label: "CI",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "phone",
      label: "Teléfono",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "state",
      label: "Estado",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "municipality",
      label: "Municipio",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "parish",
      label: "Parroquia",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "health_center",
      label: "Centro de Salud",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "description",
      label: "Descripción",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "subcategory",
      label: "Subcategoría",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "extended_category",
      label: "Categoría Extendida",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "request",
      label: "Solicitud",
      type: "text",
      required: true,
      className: "col-span-2",
    },
    {
      name: "requirement",
      label: "Requerimiento",
      type: "text",
      required: true,
      className: "col-span-2",
    },

    {
      name: "statute_id",
      label: "Estatuto",
      type: "select",
      required: true,
      options: statutes,
      className: "col-span-2",
    },
    {
      name: "type_of_prosthesis_id",
      label: "Tipo de Prótesis",
      type: "select",
      required: true,
      options: typeOfProsthesis,
      className: "col-span-2",
    },
  ]);

  const [submitString, setSubmitString] = useState("Registrar");
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare both requestsF
      const internalRequest =
        submitString === "Actualizar"
          ? casesAPI.updateCase(formData.id, formData)
          : casesAPI.createCase(formData);

      await internalRequest;
      // Handle success
      if (submitString === "Actualizar") {
        setSubmitString("Registrar");
      }

      showSuccess("Operación completada con éxito");
      setFormData(structuredClone(defaultFormData));
      setIsModalOpen(false);
      setIsFormInitialized(false); // ← Desactivar guardado
      fetchData();
      localStorage.removeItem("formData"); // ← Limpiar
      localStorage.removeItem("submitString");
    } catch (error) {
      // This will only catch errors from the internal API
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
      if (!window.confirm("¿Está seguro de eliminar esta Casos?")) {
        return;
      }
      const res = await casesAPI.deleteCase(id);
      if (res.status) {
        showSuccess("Trabajador eliminado con éxito");
      }
      console.log(res.status);
      fetchData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      showError(errorMessage);
    }

    // Call your delete API or show a confirmation dialog
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Código",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "name",
        header: "Denunciante",
        size: 200,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "ci",
        header: "CI",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "phone",
        header: "Teléfono",
        size: 120,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "state",
        header: "Estado",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "municipality",
        header: "Municipio",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "parish",
        header: "Parroquia",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "health_center",
        header: "Centro de Salud",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },

      {
        accessorKey: "description",
        header: "Descripción",
        size: 200,
        maxSize: 400,
        enableColumnFilter: true,

        enableSorting: true,
        Cell: ({ cell }) => {
          return (
            <div className="text-justify" title={cell.getValue()}>
              {cell.getValue()}
            </div>
          );
        },
      },
      {
        accessorKey: "subcategory",
        header: "Subcategoría",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "extended_category",
        header: "Categoría Extendida",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "request",
        header: "Solicitud",
        size: 130,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "requirement",
        header: "Requerimiento",
        size: 120,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "creation_date",
        header: "Fecha de Creación",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
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
        accessorKey: "status_date",
        header: "Fecha de Status",
        size: 100,
        enableColumnFilter: true,
        enableSorting: true,
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
        accessorKey: "statute_name",
        header: "Estatuto",
        size: 140,
        enableColumnFilter: true,
        enableSorting: true,
        filterVariant: "select",
        filterSelectOptions: statutes.map((statute) => statute.label),
        Cell: ({ cell }) => {
          return (
            <div
              className={`px-2 py-1 rounded-full  text-sm font-bold ${cell.row.original.statute_id == 3 || cell.row.original.statute_id == 1 ? "text-dark" : "text-white"}`}
              style={{ backgroundColor: cell.row.original.statute_color }}
            >
              {cell.getValue()}
            </div>
          );
        },
      },

      {
        header: "Acciones",
        accessorKey: "actions",
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setFormData({ ...cell.row.original });
                  setSubmitString("Actualizar");
                }}
                className="text-blue-500 p-1 rounded-full hover:bg-gray-300 hover:underline"
                title="Editar"
              >
                <Icon icon="material-symbols:edit" width={20} height={20} />
              </button>

              <button
                onClick={() => handleDelete(cell.row.original.id)}
                className="text-gray-600 p-1 rounded-full hover:bg-gray-300 hover:underline ml-2"
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
    [statutes],
  );

  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Server-side state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  // Move useMemo outside the map - process all test sections at once

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await casesAPI.getCases({
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
      setData(res.cases.data);
      setRowCount(res.cases.total);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
    setIsLoading(false);
  }, [pagination, sorting, columnFilters, globalFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create debounced function once
  const debouncedSaveFormData = useMemo(
    () =>
      debounce((data, submitStr) => {
        // Excluir el campo photo porque File no se puede serializar a JSON
        const { photo, ...dataWithoutPhoto } = data;
        localStorage.setItem("formData", JSON.stringify(dataWithoutPhoto));
        localStorage.setItem("submitString", JSON.stringify(submitStr));
      }, 300),
    [],
  );

  useEffect(() => {
    // Solo guardar si el formulario ya fue inicializado por el usuario
    if (isFormInitialized) {
      debouncedSaveFormData(formData, submitString);
    }
  }, [formData, debouncedSaveFormData, isFormInitialized]);

  // Debounced global filter handler
  const debouncedGlobalFilter = useMemo(
    () =>
      debounce((value) => {
        setGlobalFilter(value);
        setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
      }, 300),
    [],
  );

  const handleChangeValue = useCallback((e) => {
    const { name, value } = e.target;
    // if input is type checked
    if (e.target.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,

        [name]: e.target.checked,
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));

    setIsFormInitialized(true); // ← Activar guardado automático
  }, []);

  console.log({ formData });
  return (
    <>
      <title>Casos </title>
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
                  setFormData(JSON.parse(localStorage.getItem("formData")));
                  setSubmitString(
                    JSON.parse(localStorage.getItem("submitString")),
                  );
                  setIsModalOpen(true);
                }}
              >
                <small className="text-gray-500">Recuperar</small>
                <Icon
                  icon="line-md:backup-restore"
                  className="w-6 h-6 text-gray-500  "
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

            <Link
              to="/dashboard/casos/import"
              className="items-center flex p-2 py-2.5 bg-gray-200 hover:bg-white gap-2 rounded-md"
            >
              <Icon
                icon="streamline-ultimate:common-file-text-add-bold"
                width={24}
                height={24}
              />
              <span>Importar</span>
            
            </Link>
          </div>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            // Opcional: también limpiar localStorage aquí si quieres
          }}
          title="Registrar Trabajador"
          size="xl"
        >
          <form
            className={`px-12 space-y-5 md:space-y-0 gap-7 w-full relative`}
            onSubmit={onSubmit}
          >
            <div className="space-y-3 z-10 md:sticky top-0 h-max mb-24">
              <div className="grid grid-cols-4 gap-4">
                {patientFormFields.map((field, index) => {
                  return (
                    <>
                      <FormField
                        key={field.name}
                        {...field}
                        value={formData[field.name]}
                        onChange={handleChangeValue}
                      />
                    </>
                  );
                })}
              </div>
            </div>

            <div className="col-span-12">
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  className={`px-16 py-3 rounded-md font-semibold hover:bg-color3 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    submitString == "Actualizar"
                      ? "bg-color4 text-color1"
                      : "bg-color1 text-color4"
                  }`}
                >
                  {loading ? "Procesando..." : submitString}
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
            {
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
                    // created_at: false,
                    code: false,
                    health_center: false,
                    subcategory: false,
                    extended_category: false,
                    state: false,
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
                  placeholder: "Buscar",
                  sx: { minWidth: "300px" },
                  variant: "outlined",
                }}
                enableColumnResizing={true}
                muiTableBodyRowProps={({ row }) => ({
                  sx: {
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "sticky",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px", // Ancho del borde
                      backgroundColor: row.original.statute_color || "#ccc",
                      zIndex: 1,
                      display: "block",
                    },
                  },
                })}
              />
            }
          </div>
        )}
      </div>
    </>
  );
}
