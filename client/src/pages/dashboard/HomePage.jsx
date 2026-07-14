import React, { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { Icon } from "@iconify/react";
import FormField from "../../components/forms/FormField";
import { Skeleton } from "@mui/material";
import { casesAPI } from "../../services/api.js";

const AGES_RANGE = ["0-4", "5-11", "12-14", "15-18", "19-34", "35-59", "60+"]; 

const MyBar = React.memo(({ data }) => (
  <ResponsiveBar
    data={data}
    keys={["masculino", "femenino"]}
    indexBy="age_range"
    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
    padding={0.3}
    valueScale={{ type: "linear" }}
    indexScale={{ type: "band", round: true }}
    colors={{ scheme: "nivo" }}
    borderColor={{
      from: "color",
      modifiers: [["darker", 1.6]],
    }}
    axisTop={null}
    axisRight={null}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Rango de edades",
      legendPosition: "middle",
      legendOffset: 32,
    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Género",
      legendPosition: "middle",
      legendOffset: -40,
    }}
    labelSkipWidth={12}
    labelSkipHeight={12}
    labelTextColor={{
      from: "color",
      modifiers: [["darker", 1.6]],
    }}
    legends={[
      {
        dataFrom: "keys",
        anchor: "bottom-right",
        direction: "column",
        justify: false,
        translateX: 120,
        translateY: 0,
        itemsSpacing: 2,
        itemWidth: 100,
        itemHeight: 20,
        itemDirection: "left-to-right",
        itemOpacity: 0.85,
        symbolSize: 20,
        effects: [
          {
            on: "hover",
            style: {
              itemOpacity: 1,
            },
          },
        ],
      },
    ]}
    role="application"
    ariaLabel="Nivo bar chart demo"
    barAriaLabel={(e) =>
      e.id + ": " + e.formattedValue + " in country: " + e.indexValue
    }
    colors={['#E27B86', '#e4c8b4', '#BECFE1', '#C9EBF2', '#4e8888', '#BC7440', "#E4A5AD", "#8ca9ff"]}

  />
));
const PieChart = React.memo(({ data, inPorcentage }) => (
  <ResponsivePie
    data={data}
    innerRadius={0.5}
    margin={{ top: 30, right: 80, bottom: 50, left: 80 }}
    padAngle={0.6}
    cornerRadius={2}
    activeOuterRadiusOffset={8}
    arcLinkLabelsSkipAngle={10}
    arcLinkLabelsTextColor="#333333"
    arcLinkLabelsThickness={2}
    valueFormat={(value) => `${Number(value)}${inPorcentage ? " %" : ""}`}
    arcLinkLabelsColor={{ from: "color" }}
    arcLabelsSkipAngle={10}
    arcLabelsTextColor={{
      from: "color",
      modifiers: [["darker", 4]],
    }}
    colors={['#E27B86', '#e4c8b4', '#BECFE1', '#C9EBF2', '#4e8888', '#BC7440', "#E4A5AD", "#8ca9ff"]}
    colorBy="index"
  />
));

export default function HomePage() {
  const [chartData, setChartData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("this_week");

  const [start_date, setStartDate] = useState(null);
  const [end_date, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchChartData = async () => {
    if (selectedPeriod === "range" && (!start_date || !end_date)) {
      return;
    }

    setLoading(true);
    try {
      const res = await casesAPI.getStats();
      setChartData(res.data?.data || res.data);
    } catch (e) {
      console.error("Failed to fetch chart data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedPeriod]);

  return (
    <>
      <title>Dashboard - Misión Sonrisa</title>
      <div>
        <h1 className="text-lg md:text-2xl font-bold mb-4 ">Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            name={"sex"}
            type={"select"}
            className={"w-max"}
            value={selectedPeriod}
            options={[
              { value: "today", label: "Hoy" },
              { value: "this_week", label: "Esta semana" },
              { value: "this_month", label: "Este mes" },
              { value: "this_year", label: "Este año" },
              { value: "range", label: "Rango personalizado" },
            ]}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
            }}
          />
          {selectedPeriod === "range" && (
            <div className="flex flex-col md:flex-row gap-4 ">
              <FormField
                name={"start_date"}
                type={"date"}
                label={"Fecha de inicio"}
                value={start_date}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
              />
              <FormField
                name={"end_date"}
                type={"date"}
                label={"Fecha de fin"}
                value={end_date}
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
              />
              <button
                className="bg-color1 w-max text-white rounded-md p-2 hover:bg-color2 hover:text-white"
                onClick={fetchChartData}
              >
                Aplicar filtro
              </button>
            </div>
          )}
        </div>

        {chartData && !loading ? (
          <div className="md:grid space-y-4 grid-cols-1 md:grid-cols-4 gap-3 md:gap-6 mt-4">
            <div className="rounded-md p-4 md:p-7 neuphormism hover:shadow-none flex flex-col justify-between ">
              <p>Total Casos atendidos</p>
              <b className=" text-pink mt-auto text-right w-full ml-auto   flex justify-end items-end">
                <Icon
                  icon="streamline-ultimate:dentistry-tooth-jaws"
                  className=" text-6xl p-1 block mb-3 mr-2 text-color3"
                />
                <span
                  className={
                    chartData?.total.total > 999 ? "text-6xl" : `text-9xl`
                  }
                >
                  {chartData?.total.total}
                </span>
              </b>
            </div>

          

            <div className="rounded-md p-4 md:p-7 min-h-[300px] relative col-span-2 neuphormism hover:shadow-none">
              <p>Procedencia de pacientes</p>
              <PieChart data={chartData?.origins} />
            </div>

            <div className="rounded-md p-4 md:p-7 min-h-[300px] relative col-span-2 neuphormism hover:shadow-none">
              <p>Distribución de edades y género</p>

              
              <MyBar data={chartData?.analyses.ageGenderDistribution} />
            </div>

        


            <div className="rounded-md p-4 md:p-7 min-h-[300px] relative col-span-2 neuphormism hover:shadow-none">
              <p>Estatutos de casos</p>
              <PieChart
                data={chartData?.statutes?.length ? chartData.statutes : [
                  {
                    id: "En proceso",
                    label: "En proceso",
                    value: chartData?.total?.validated || 0,
                  },
                  {
                    id: "Pulido/Terminado",
                    label: "Pulido/Terminado",
                    value: chartData?.total?.not_validated || 0,
                  },
                  {
                    id: "Entregado",
                    label: "Entregado",
                    value: chartData?.total?.delivered || 0,
                  },
                ]}
              />
            </div>

            <div className="rounded-md p-4 md:p-7 min-h-[300px] relative col-span-2 neuphormism hover:shadow-none">
              <p>Tipo de prótesis</p>
              <PieChart
                data={chartData?.by_prosthesis_type?.length ? chartData.by_prosthesis_type : []}
              />
            </div>

           
          </div>
        ) : (
          <div className="md:grid space-y-4 grid-cols-1 md:grid-cols-4 gap-3 md:gap-6 mt-4">
            <Skeleton variant="rounded" width={260} height={260} sx={{ bgcolor: 'grey.200' }} animation="wave" />
            <Skeleton variant="rounded" width={260} height={260} sx={{ bgcolor: 'grey.200' }} animation="wave" />
            <Skeleton variant="rounded" width={260} height={260} sx={{ bgcolor: 'grey.200' }} animation="wave" />
            <Skeleton variant="rounded" width={260} height={260} sx={{ bgcolor: 'grey.200' }} animation="wave" />
          </div>
        )}
      </div>
    </>
  );
}
