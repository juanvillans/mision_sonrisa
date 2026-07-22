import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
import SecretrariaLogo from "../assets/secretaria_logo.png";
import misionSonrisaLogo from "../assets/misionSonrisaLogo.png";
import Latidos from "../assets/latidos.png";
import FuturisticButton from "./FuturisticButton";
import cintillo from "../assets/cintillo.jpeg";

const TOOTH_COLOR_OPTIONS = [
  { value: "A1", label: "A1", color: "#E6E1CE" },
  { value: "A2", label: "A2", color: "#E3DAC1" },
  { value: "A3", label: "A3", color: "#DDD0B2" },
  { value: "A3.5", label: "A3.5", color: "#D2BF9E" },
  { value: "A4", label: "A4", color: "#C6B28E" },
  { value: "B1", label: "B1", color: "#E9E6D4" },
  { value: "B2", label: "B2", color: "#E6DCBF" },
  { value: "B3", label: "B3", color: "#DECFA6" },
  { value: "B4", label: "B4", color: "#D1C094" },
  { value: "C1", label: "C1", color: "#DCD9CE" },
  { value: "C2", label: "C2", color: "#D3CEBE" },
  { value: "C3", label: "C3", color: "#C6BFAD" },
  { value: "C4", label: "C4", color: "#B9B29E" },
  { value: "D2", label: "D2", color: "#DAD4C1" },
  { value: "D3", label: "D3", color: "#CEBFAF" },
  { value: "D4", label: "D4", color: "#CBBFAD" },
];

const PrintableContent = forwardRef((props, ref) => {
  console.log(props);
  return (
    <div ref={ref} className="w-full mx-auto bg-white relative">
      <header
        style={{
          marginBlock: "30px !important",
          marginBottom: "30px !important",
        }}
        className="my-2   mb-0 relative flex flex-col justify-center items-center py-4 pb-0"
      >
        <img src={cintillo} alt="" className="w-9/12 h-auto" />

        <div className="text-center  items-center flex font-bold text-xs gap-3 mb-1  mt-2 text-color1">
          <img
            src={misionSonrisaLogo}
            alt="Misión Sonrisa Logo"
            className="h-16 w-auto"
          />
          Secretaria de Salud del Estado Falcón - Misión Sonrisa
        </div>
      </header>

      <div>
        <h1 className="text-center text-2xl font-bold mb-4">
          Orden de Laboratorio
        </h1>
        <div className=" mx-auto overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          {/* Header Section: Highlighting Case & Date */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
                Nro de Caso
              </span>
              <span className="text-xl font-bold tracking-tight text-blue-600">
                #{props.data?.id || "—"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
                Fecha
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/10">
                {props.data?.creation_date_formatted || "—"}
              </span>
            </div>
          </div>

          {/* Main Data Grid */}
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {/* Full width row for Patient Name */}
            <div className="sm:col-span-2 border-b border-gray-50 pb-2">
              <dt className="text-xs font-medium text-gray-500">Paciente</dt>
              <dd className="text-base font-semibold text-gray-900">
                {props.data?.name || "—"}
              </dd>
            </div>

            {/* Compact grid items */}
            <div>
              <dt className="text-xs font-medium text-gray-500">C.I.</dt>
              <dd className="text-sm font-medium text-gray-900">
                {props.data?.ci || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-gray-500">Teléfono</dt>
              <dd className="text-sm font-medium text-gray-900">
                {props.data?.phone || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-gray-500">Edad / Sexo</dt>
              <dd className="text-sm font-medium text-gray-900">
                {props.data?.age ? `${props.data.age} años` : "—"} •{" "}
                {props.data?.sex || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-gray-500">
                Color de dientes
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: TOOTH_COLOR_OPTIONS.find(
                        (c) => c.value === props.data?.tooth_color,
                      )?.color,
                    }}
                  />
                  {props.data?.tooth_color || "—"}
                </span>
              </dd>
            </div>

          <div className="flex justify-between w-full">
            <div className=" items-center gap-3 pt-1">
              <dt className="text-xs font-medium text-gray-500">
                Tipo de Prótesis
              </dt>
              <dd className="text-sm font-semibold text-indigo-600 bg-indigo-50/50 rounded-lg p-2 mt-0.5 border border-indigo-100/50">
                {props.data?.type_of_prosthesis || "—"}
              </dd>
            </div>

            <div className="">
              <dt className="text-xs font-medium text-gray-500">Dirección</dt>
              <dd className="text-sm text-gray-600 line-clamp-2 title={props.data?.address}">
                {props.data?.address || "—"}
              </dd>
            </div>

          </div>
          </dl>
        </div>
      </div>
    </div>
  );
});

const PrintPage = (props) => {
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Orden-${props.data?.id}`,
    pageStyle: `
      @page {
        
        size: A4;

      }
      body {
        font-family: Arial, sans-serif;
        color: black;
      }
    `,
  });

  return (
    <>
      <FuturisticButton
        onClick={handlePrint}
        title="Imprimir"
        className="flex gap-2 text-xl mx-auto py-1 px-2 "
      >
        <Icon
          icon="material-symbols:download-rounded"
          className="w-6 h-6 text-gray-700  mr-3 inline "
        />
        <span>Descargar / Imprimir</span>
      </FuturisticButton>

      <PrintableContent
        data={props.caseData}
        ref={componentRef}
        className=""
        size="A4"
      />
    </>
  );
};

export default PrintPage;
