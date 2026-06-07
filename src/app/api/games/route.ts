import { readGames, addGame, deleteGame } from "@/lib/data";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  const games = await readGames();
  return Response.json(games);
}

export async function POST(request: Request) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { piloto, commander, pontuacao, data } = body;

  if (!piloto || !commander || pontuacao === undefined) {
    return Response.json({ error: "Campos obrigatórios: piloto, commander, pontuacao" }, { status: 400 });
  }

  const entry = await addGame({
    piloto: piloto.trim(),
    commander: commander.trim(),
    pontuacao: Number(pontuacao),
    ...(data ? { data } : {}),
  });
  return Response.json(entry, { status: 201 });
}

export async function DELETE(request: Request) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const deleted = await deleteGame(id);
  if (!deleted) {
    return Response.json({ error: "Registro não encontrado" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
