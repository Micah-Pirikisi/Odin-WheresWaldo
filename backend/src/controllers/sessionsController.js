import prisma from "../lib/prisma.js";
const { v4: uuidv4 } = require("uuid");

function toNumber(v) {
  return typeof v === "string" ? parseFloat(v) : v;
}

exports.createSession = async (req, res, next) => {
  try {
    const { image_id } = req.body;
    if (!image_id) return res.status(400).json({ error: "image_id required" });

    const anonymousId = uuidv4().slice(0, 8);
    const session = await prisma.session.create({
      data: {
        imageId: image_id,
        startedAt: new Date(),
        anonymousId,
        foundCharacters: [],
      },
      select: { id: true, anonymousId: true, startedAt: true },
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
};

exports.validateSelection = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const { x_pct, y_pct, character_id } = req.body;
    if (!sessionId || x_pct == null || y_pct == null || !character_id) {
      return res
        .status(400)
        .json({ error: "session id, x_pct, y_pct, character_id required" });
    }

    const character = await prisma.character.findUnique({
      where: { id: character_id },
    });
    if (!character)
      return res.status(404).json({ error: "character not found" });

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) return res.status(404).json({ error: "session not found" });

    const found = Array.isArray(session.foundCharacters)
      ? session.foundCharacters
      : [];
    if (found.includes(character_id)) {
      return res.json({ correct: false, message: "Character already found" });
    }

    const dx = toNumber(x_pct) - character.x_pct;
    const dy = toNumber(y_pct) - character.y_pct;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const correct = dist <= character.radius_pct;

    if (correct) {
      const newFound = [...found, character_id];
      await prisma.session.update({
        where: { id: sessionId },
        data: { foundCharacters: newFound },
      });
    }

    const totalChars = await prisma.character.count({
      where: { imageId: session.imageId },
    });
    const allFound = found.length + (correct ? 1 : 0) >= totalChars;

    res.json({
      correct,
      character_location: { x_pct: character.x_pct, y_pct: character.y_pct },
      allFound,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSessionStatus = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        imageId: true,
        startedAt: true,
        finishedAt: true,
        foundCharacters: true,
      },
    });
    if (!session) return res.status(404).json({ error: "session not found" });
    res.json({
      id: session.id,
      image_id: session.imageId,
      started_at: session.startedAt,
      finished_at: session.finishedAt,
      found_characters: session.foundCharacters || [],
    });
  } catch (err) {
    next(err);
  }
};

exports.finishSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const { anonymous_id, player_name } = req.body;
    if (!sessionId || !anonymous_id || !player_name) {
      return res
        .status(400)
        .json({ error: "session id, anonymous_id, player_name required" });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) return res.status(404).json({ error: "session not found" });
    if (session.anonymousId !== anonymous_id)
      return res.status(403).json({ error: "anonymous_id mismatch" });

    const started = new Date(session.startedAt);
    const finished = new Date();
    const timeSeconds = Math.max(0, Math.round((finished - started) / 1000));

    if (!session.finishedAt) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { finishedAt: finished },
      });
    }

    const score = await prisma.score.create({
      data: {
        sessionId: sessionId,
        playerName: player_name,
        timeSeconds,
      },
      select: { id: true, playerName: true, timeSeconds: true },
    });

    res.json({ ok: true, score });
  } catch (err) {
    next(err);
  }
};
