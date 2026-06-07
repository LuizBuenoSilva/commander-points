import { readGames } from "@/lib/data";
import AnaliseCharts from "./charts";

export const dynamic = "force-dynamic";

export default async function AnalisePage() {
  const games = await readGames();
  return <AnaliseCharts games={games} />;
}
