"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

interface GameEntry {
  id: string;
  data: string;
  piloto: string;
  commander: string;
  pontuacao: number;
}

const COLORS = [
  "#c9a227",
  "#e6c84a",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#14b8a6",
  "#f59e0b",
  "#6366f1",
];

export default function AnaliseCharts({ games }: { games: GameEntry[] }) {
  const pilotoMap = new Map<
    string,
    { pontos: number; partidas: number; vitorias: number }
  >();
  for (const g of games) {
    const cur = pilotoMap.get(g.piloto) || {
      pontos: 0,
      partidas: 0,
      vitorias: 0,
    };
    cur.pontos += g.pontuacao;
    cur.partidas += 1;
    if (g.pontuacao >= 5) cur.vitorias += 1;
    pilotoMap.set(g.piloto, cur);
  }

  const pilotoData = Array.from(pilotoMap.entries())
    .map(([name, s]) => ({
      name,
      pontos: s.pontos,
      partidas: s.partidas,
      media: Math.round((s.pontos / s.partidas) * 100) / 100,
      vitorias: s.vitorias,
    }))
    .sort((a, b) => b.pontos - a.pontos);

  const commanderMap = new Map<
    string,
    { pontos: number; partidas: number }
  >();
  for (const g of games) {
    const cur = commanderMap.get(g.commander) || { pontos: 0, partidas: 0 };
    cur.pontos += g.pontuacao;
    cur.partidas += 1;
    commanderMap.set(g.commander, cur);
  }

  const commanderData = Array.from(commanderMap.entries())
    .map(([name, s]) => ({
      name,
      pontos: s.pontos,
      partidas: s.partidas,
      media: Math.round((s.pontos / s.partidas) * 100) / 100,
    }))
    .sort((a, b) => b.pontos - a.pontos);

  const dateMap = new Map<string, Map<string, number>>();
  const sortedDates = [...new Set(games.map((g) => g.data))].sort();
  for (const g of games) {
    if (!dateMap.has(g.data)) dateMap.set(g.data, new Map());
    const dayMap = dateMap.get(g.data)!;
    dayMap.set(g.piloto, (dayMap.get(g.piloto) || 0) + g.pontuacao);
  }

  const allPilotos = Array.from(pilotoMap.keys());
  const evolutionData = (() => {
    const acc = new Map<string, number>();
    allPilotos.forEach((p) => acc.set(p, 0));
    return sortedDates.map((date) => {
      const dayMap = dateMap.get(date)!;
      for (const [piloto, pts] of dayMap) {
        acc.set(piloto, (acc.get(piloto) || 0) + pts);
      }
      const entry: Record<string, string | number> = {
        data: new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
      };
      for (const p of allPilotos) {
        entry[p] = acc.get(p) || 0;
      }
      return entry;
    });
  })();

  const partidasPieData = pilotoData.map((p) => ({
    name: p.name,
    value: p.partidas,
  }));

  const radarData = pilotoData.map((p) => ({
    name: p.name,
    pontos: p.pontos,
    media: p.media * 5,
    vitorias: p.vitorias * 3,
    partidas: p.partidas,
  }));

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#1a1a2e",
      border: "1px solid #2a2a4a",
      borderRadius: "8px",
      color: "#e2e8f0",
    },
  };

  const top3Threats = commanderData.slice(0, 3);
  const threatColors = ["#ef4444", "#f97316", "#f59e0b"];
  const threatLabels = [
    "Maior Ameaca",
    "2a Ameaca",
    "3a Ameaca",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-accent mb-2">Analise</h1>
        <p className="text-muted">Graficos e estatisticas das partidas</p>
      </div>

      {/* Top 3 Ameacas da Mesa */}
      <section className="bg-card rounded-lg border-2 border-danger/40 p-6 mb-8">
        <h2 className="text-2xl font-bold text-danger mb-6 text-center">
          Top 3 Ameacas da Mesa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {top3Threats.map((c, i) => (
            <div
              key={c.name}
              className="rounded-lg p-5 text-center"
              style={{
                background: `${threatColors[i]}15`,
                border: `1px solid ${threatColors[i]}40`,
              }}
            >
              <div className="text-3xl mb-2">
                {i === 0 ? "\u{1F525}" : i === 1 ? "\u{26A0}️" : "\u{1F4A2}"}
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: threatColors[i] }}
              >
                {threatLabels[i]}
              </div>
              <div className="text-xl font-bold text-foreground mb-1">
                {c.name}
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: threatColors[i] }}
              >
                {c.pontos} pts
              </div>
              <div className="text-sm text-muted">
                {c.partidas} partidas &middot; {c.media} pts/partida
              </div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={top3Threats} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="pontos" radius={[6, 6, 0, 0]}>
              {top3Threats.map((_, i) => (
                <Cell key={i} fill={threatColors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pontos por Piloto */}
        <section className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-accent-light mb-4">
            Pontos Totais por Piloto
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pilotoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="pontos" fill="#c9a227" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Media por Piloto */}
        <section className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-accent-light mb-4">
            Media de Pontos por Partida
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pilotoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="media" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Evolucao ao longo do tempo */}
        <section className="bg-card rounded-lg border border-border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-accent-light mb-4">
            Evolucao de Pontos ao Longo do Tempo
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip {...tooltipStyle} />
              <Legend />
              {allPilotos.map((piloto, i) => (
                <Line
                  key={piloto}
                  type="monotone"
                  dataKey={piloto}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Top Commanders */}
        <section className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-accent-light mb-4">
            Top Commanders (por Pontos)
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={commanderData.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                width={120}
              />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="pontos" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Distribuicao de Partidas */}
        <section className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-accent-light mb-4">
            Distribuicao de Partidas por Piloto
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={partidasPieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: "#94a3b8" }}
              >
                {partidasPieData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </section>

        {/* Radar */}
        <section className="bg-card rounded-lg border border-border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-accent-light mb-4">
            Perfil dos Pilotos (Radar)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a4a" />
              <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <PolarRadiusAxis stroke="#94a3b8" fontSize={10} />
              <Radar
                name="Pontos"
                dataKey="pontos"
                stroke="#c9a227"
                fill="#c9a227"
                fillOpacity={0.2}
              />
              <Radar
                name="Vitorias (x3)"
                dataKey="vitorias"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.2}
              />
              <Radar
                name="Partidas"
                dataKey="partidas"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
              <Legend />
              <Tooltip {...tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
