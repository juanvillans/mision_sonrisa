import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
import SecretrariaLogo from "../assets/secretaria_logo.png";
import misionSonrisaLogo from "../assets/misionSonrisaLogo.png";
import Latidos from "../assets/latidos.png";
import FuturisticButton from "./FuturisticButton";
import cintillo from "../assets/cintillo.jpeg";

const currentDate = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

const PrintableContent = forwardRef((props, ref) => {
  console.log(props);
  return (
    <div ref={ref} className="w-full mx-auto bg-white relative">
      <header
        style={{
          marginBlock: "30px !important",
          marginBottom: "30px !important",
        }}
        className="my-1   mb-0 relative flex flex-col justify-center items-center py-4 pb-0"
      >
        <img src={cintillo} alt="" className="max-w-xl h-auto" />

        <div className="text-center  items-center flex font-bold text-xs gap-3 mb-1  mt-2 text-color1">
          <img
            src={misionSonrisaLogo}
            alt="Misión Sonrisa Logo"
            className="h-16 w-auto"
          />
        </div>
      </header>

      <div className="max-w-xl mx-auto ">
        <h1 className="text-center text-xl text-gray-700 font-bold mb-4">
          PROTESIS ENTREGADA POR CAOIMS
        </h1>
        <p className="mb-3 mt-12">
          Caso N°: <b>{props.data?.id || "—"}</b>
        </p>
        <p className="mb-3 leading-7">
          Yo, <b>{props.data?.name}</b> C.I. Nº <b>{props.data?.ci}</b> Hago
          constar que he recibido de la MISIÓN SONRISA las PRÓTESIS DENTALES:{" "}
          <b>{props.data?.type_of_prosthesis}</b> de manera satisfactoria y me
          compremeto a asistir a los tres controles Post Operatorios pautados
          por el Centro de Atención odontológica Integral en los siguientes
          dias: _________________________________________________________________________{" "}
        </p>
        <p>
          Constancia que se expide el{" "}
          <b>
            {props.data?.delivered_at
              ? new Date(props.data.delivered_at).toLocaleDateString("es-ES")
              : ""}
          </b>
        </p>

        <div className="flex justify-between mt-20">
          <div className="flex items-center flex-col justify-center">
            <p>___________________________</p>
            <p>Coordinadora del CAOIMS</p>
          </div>

          <div className="flex items-center flex-col justify-center">
            <p>____________________________</p>
            <p>Odontólogo Responsable</p>
          </div>
        </div>

        <div className="flex items-center mt-20 flex-col justify-center">
          <p>____________________________________</p>
          <p>FIRMA Y HUELLAS DEL PACIENTE</p>
        </div>
      </div>
    </div>
  );
});

const OrdenDeEntrega = (props) => {
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

export default OrdenDeEntrega;
