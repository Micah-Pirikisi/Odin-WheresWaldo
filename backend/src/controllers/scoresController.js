import prisma from "../lib/prisma.js";

export const listScores = async (req, res, next) => {
  try {
    const { image_id } = req.query;
    const where = image_id
      ? { session: { imageId: parseInt(image_id, 10) } }
      : {};
    const rows = await prisma.score.findMany({
      where,
      orderBy: { timeSeconds: "asc" },
      take: 50,
      select: {
        id: true,
        playerName: true,
        timeSeconds: true,
        session: {
          select: { imageId: true, image: { select: { title: true } } },
        },
      },
    });

    const formatted = rows.map((r) => ({
      id: r.id,
      player_name: r.playerName,
      time_seconds: r.timeSeconds,
      image_id: r.session.imageId,
      image_title: r.session.image.title,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};
