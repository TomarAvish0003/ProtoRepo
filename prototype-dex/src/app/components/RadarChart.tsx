import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Pokemon } from "@/app/utils/types";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  pokemon: Pokemon;
}

export default function RadarChart({ pokemon }: RadarChartProps) {
  const statLabels = [
    "HP",
    "Attack",
    "Defense",
    "Sp. Atk",
    "Sp. Def",
    "Speed",
  ];

  const statValues = [
    pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0,
    pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat ?? 0,
    pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat ?? 0,
    pokemon.stats.find((s) => s.stat.name === "special-attack")?.base_stat ?? 0,
    pokemon.stats.find((s) => s.stat.name === "special-defense")?.base_stat ?? 0,
    pokemon.stats.find((s) => s.stat.name === "speed")?.base_stat ?? 0,
  ];

  const data = {
    labels: statLabels,
    datasets: [
      {
        label: "Base Stats",
        data: statValues,
        backgroundColor: "rgba(250, 193, 0, 0.3)",
        borderColor: "#ef3f7a",
        borderWidth: 2,
        pointBackgroundColor: "#ef3f7a",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#ef3f7a",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      r: {
        angleLines: { display: true, color: "#fff2" },
        grid: { color: "#fff2" },
        pointLabels: {
          font: { size: 14, family: "var(--font-retro)" },
          color: "#fff",
        },
        min: 0,
        max: 255, // Adjust as needed for your stat range
        ticks: {
          stepSize: 51,
          color: "#ccc",
          font: { size: 12 },
          backdropColor: "transparent",
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: 340, maxHeight: 340, margin: "0 auto" }}>
      <Radar data={data} options={options} />
    </div>
  );
}
