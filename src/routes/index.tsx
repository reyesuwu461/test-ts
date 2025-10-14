import { useLoaderData } from "react-router-dom";
import { getChartData, getSummary } from "../api";
import { FuelChart } from "../components/fuel-chart";
import { OemChart } from "../components/oem-chart";
import { RegistrationYearChart } from "../components/registration-year-chart";
import { Statistic } from "../components/statistic";
import { formatCurrency, formatNumber } from "../lib/intl";
import { privateLoader } from "../lib/private-loader";
import type { Chart, Summary } from "../types";

export const loader = privateLoader(async () => {
  const [summary, fuelChart, oemChart, yearChart] = await Promise.all([
    getSummary(),
    getChartData("FUEL_TYPE"),
    getChartData("OEM"),
    getChartData("REGISTRATION_YEAR"),
  ]);
  return { summary, fuelChart, oemChart, yearChart };
});

export function Component() {
  const { summary, fuelChart, oemChart, yearChart } = useLoaderData() as {
    summary: Summary;
    fuelChart: Array<Chart>;
    oemChart: Array<Chart>;
    yearChart: Array<Chart>;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Statistic label="Products in catalog" value={formatNumber(summary.count)} />
        <Statistic label="Unique Brands" value={formatNumber(summary.oems)} />
        <Statistic
          label="Catalog value"
          value={formatCurrency(summary.value, { notation: "compact" })}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Brands */}
        <OemChart data={oemChart} />

        {/* Category Breakdown */}
        <FuelChart data={fuelChart} />

        {/* Release Year Breakdown */}
        <RegistrationYearChart data={yearChart} />
      </section>
    </div>
  );
}
Component.displayName = "Index";
