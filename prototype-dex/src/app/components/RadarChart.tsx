"use client";

import { useEffect, useState, useRef } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Pokemon, RawStat } from "@/app/utils/types";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  pokemon: Pokemon;
}

// Helper to get CSS variable values from the DOM
const getThemeColor = (variableName: string) => {
    if (typeof window === 'undefined') return '#FFFFFF'; // Default for SSR
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
};

// Helper to safely add an alpha value to a color string (works with oklch)
const addAlpha = (color: string, alpha: number) => {
    if (color.startsWith('oklch')) {
        // from 'oklch(l a h)' to 'oklch(l a h / alpha)'
        return color.replace(')', ` / ${alpha})`);
    }
    // Fallback for other color formats like rgb or hex
    if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    return `${color}${alphaHex}`;
};

export default function RadarChart({ pokemon }: RadarChartProps) {
  const [chartOptions, setChartOptions] = useState<ChartOptions<'radar'>>({});
  const [chartData, setChartData] = useState<any>({ datasets: [] });

  // This effect will run whenever the theme changes
  useEffect(() => {
    const updateChartTheme = () => {
      const foreground = getThemeColor('--foreground');
      const primary = getThemeColor('--primary');
      const mutedForeground = getThemeColor('--muted-foreground');
      const chartColor1 = getThemeColor('--chart-1');
      const retroFont = getThemeColor('--font-sans') || "'Press Start 2P', cursive";
      const sansFont = getThemeColor('--font-sans') || "'Montserrat', sans-serif";

      const statLabels = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
      const statValues = [
        pokemon.stats.find((s: RawStat) => s.stat.name === "hp")?.base_stat ?? 0,
        pokemon.stats.find((s: RawStat) => s.stat.name === "attack")?.base_stat ?? 0,
        pokemon.stats.find((s: RawStat) => s.stat.name === "defense")?.base_stat ?? 0,
        pokemon.stats.find((s: RawStat) => s.stat.name === "special-attack")?.base_stat ?? 0,
        pokemon.stats.find((s: RawStat) => s.stat.name === "special-defense")?.base_stat ?? 0,
        pokemon.stats.find((s: RawStat) => s.stat.name === "speed")?.base_stat ?? 0,
      ];

      setChartData({
        labels: statLabels,
        datasets: [
          {
            label: "Base Stats",
            data: statValues,
            backgroundColor: addAlpha(chartColor1, 0.3),
            borderColor: chartColor1,
            borderWidth: 2,
            pointBackgroundColor: chartColor1,
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: chartColor1,
          },
        ],
      });

      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { 
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, family: retroFont },
            bodyFont: { size: 12, family: sansFont },
          },
        },
        scales: {
          r: {
            angleLines: { display: true, color: addAlpha(foreground, 0.1) },
            grid: { color: addAlpha(foreground, 0.15) },
            pointLabels: {
              font: { size: 12, family: retroFont },
              color: primary,
            },
            min: 0,
            max: 255,
            ticks: {
              stepSize: 51,
              color: mutedForeground,
              font: { size: 10 },
              backdropColor: "transparent",
            },
          },
        },
      });
    };

    // Update the chart theme initially
    updateChartTheme();

    // Set up a MutationObserver to watch for theme changes on the <html> element
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateChartTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    // Clean up the observer when the component unmounts
    return () => observer.disconnect();
  }, [pokemon.stats]); // Re-run if the pokemon data changes

  // Render a placeholder or nothing until the chart data is ready
  if (!chartData.datasets.length) {
    return <div style={{ width: 340, height: 340 }} />;
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340, height: 340, margin: "0 auto" }}>
      <Radar data={chartData} options={chartOptions} />
    </div>
  );
}
