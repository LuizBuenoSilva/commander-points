import { supabase } from "./supabase";

export interface GameEntry {
  id: string;
  data: string;
  piloto: string;
  commander: string;
  pontuacao: number;
}

export async function readGames(): Promise<GameEntry[]> {
  const { data, error } = await supabase
    .from("games")
    .select("id, data, piloto, commander, pontuacao")
    .order("data", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addGame(
  entry: { piloto: string; commander: string; pontuacao: number; data?: string }
): Promise<GameEntry> {
  const row: Record<string, unknown> = {
    piloto: entry.piloto,
    commander: entry.commander,
    pontuacao: entry.pontuacao,
  };
  if (entry.data) row.data = entry.data;

  const { data, error } = await supabase
    .from("games")
    .insert(row)
    .select("id, data, piloto, commander, pontuacao")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGame(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("games")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export interface PilotoStats {
  piloto: string;
  pontosAcc: number;
  partidas: number;
  pontosPorPartida: number;
}

export async function getRanking(): Promise<PilotoStats[]> {
  const games = await readGames();
  const map = new Map<string, { pontos: number; partidas: number }>();

  for (const g of games) {
    const current = map.get(g.piloto) || { pontos: 0, partidas: 0 };
    current.pontos += g.pontuacao;
    current.partidas += 1;
    map.set(g.piloto, current);
  }

  return Array.from(map.entries())
    .map(([piloto, stats]) => ({
      piloto,
      pontosAcc: stats.pontos,
      partidas: stats.partidas,
      pontosPorPartida:
        stats.partidas > 0
          ? Math.round((stats.pontos / stats.partidas) * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.pontosAcc - a.pontosAcc);
}

export interface CommanderStats {
  commander: string;
  pontosAcc: number;
  partidas: number;
  pontosPorPartida: number;
}

export async function getCommanderRanking(): Promise<CommanderStats[]> {
  const games = await readGames();
  const map = new Map<string, { pontos: number; partidas: number }>();

  for (const g of games) {
    const current = map.get(g.commander) || { pontos: 0, partidas: 0 };
    current.pontos += g.pontuacao;
    current.partidas += 1;
    map.set(g.commander, current);
  }

  return Array.from(map.entries())
    .map(([commander, stats]) => ({
      commander,
      pontosAcc: stats.pontos,
      partidas: stats.partidas,
      pontosPorPartida:
        stats.partidas > 0
          ? Math.round((stats.pontos / stats.partidas) * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.pontosAcc - a.pontosAcc);
}
