"use client";

import { useState, useEffect, useCallback } from "react";

interface GameEntry {
  id: string;
  data: string;
  piloto: string;
  commander: string;
  pontuacao: number;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [games, setGames] = useState<GameEntry[]>([]);
  const [piloto, setPiloto] = useState("");
  const [commander, setCommander] = useState("");
  const [pontuacao, setPontuacao] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    setAuthenticated(data.authenticated);
    setLoading(false);
  }, []);

  const loadGames = useCallback(async () => {
    const res = await fetch("/api/games");
    const data = await res.json();
    setGames(
      data.sort(
        (a: GameEntry, b: GameEntry) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
      )
    );
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authenticated) loadGames();
  }, [authenticated, loadGames]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setAuthenticated(true);
    } else {
      setLoginError("Email ou senha incorretos");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
  }

  async function handleAddGame(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        piloto,
        commander,
        pontuacao: Number(pontuacao),
        ...(dataPartida ? { data: dataPartida } : {}),
      }),
    });
    if (res.ok) {
      setPiloto("");
      setCommander("");
      setPontuacao("");
      setDataPartida("");
      loadGames();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await fetch(`/api/games?id=${id}`, { method: "DELETE" });
    loadGames();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Carregando...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <form
          onSubmit={handleLogin}
          className="bg-card border border-border rounded-lg p-8 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-accent mb-6 text-center">
            Admin Login
          </h1>
          {loginError && (
            <div className="bg-danger/20 text-danger text-sm rounded px-3 py-2 mb-4">
              {loginError}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-muted mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-background font-semibold rounded px-4 py-2 hover:bg-accent-light transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-accent">Painel Admin</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-danger transition-colors"
        >
          Sair
        </button>
      </div>

      <form
        onSubmit={handleAddGame}
        className="bg-card border border-border rounded-lg p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-accent-light mb-4">
          Registrar Partida
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-muted mb-1">Piloto</label>
            <input
              value={piloto}
              onChange={(e) => setPiloto(e.target.value)}
              placeholder="Nome do piloto"
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Commander</label>
            <input
              value={commander}
              onChange={(e) => setCommander(e.target.value)}
              placeholder="Nome do commander"
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Pontuacao</label>
            <input
              type="number"
              value={pontuacao}
              onChange={(e) => setPontuacao(e.target.value)}
              placeholder="Ex: 5, 3, 1, -1"
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">
              Data <span className="text-muted/60">(opcional)</span>
            </label>
            <input
              type="date"
              value={dataPartida}
              onChange={(e) => setDataPartida(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-muted mb-3">
          Se a data nao for preenchida, sera usada a data de hoje
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent text-background font-semibold rounded px-6 py-2 hover:bg-accent-light transition-colors disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Registrar"}
        </button>
      </form>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <h2 className="text-lg font-semibold text-accent-light px-6 py-4 border-b border-border">
          Todas as Partidas ({games.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-muted text-sm">
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Piloto</th>
                <th className="px-4 py-2 text-left">Commander</th>
                <th className="px-4 py-2 text-right">Pontuacao</th>
                <th className="px-4 py-2 text-right">Acao</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-border/50 hover:bg-border/20 transition-colors"
                >
                  <td className="px-4 py-2 text-muted text-sm">
                    {new Date(g.data + "T12:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2">{g.piloto}</td>
                  <td className="px-4 py-2 text-muted">{g.commander}</td>
                  <td
                    className={`px-4 py-2 text-right font-mono font-semibold ${
                      g.pontuacao > 0
                        ? "text-success"
                        : g.pontuacao < 0
                        ? "text-danger"
                        : "text-muted"
                    }`}
                  >
                    {g.pontuacao > 0 ? `+${g.pontuacao}` : g.pontuacao}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-danger/70 hover:text-danger text-sm transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
