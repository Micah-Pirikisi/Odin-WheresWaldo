import prisma from "../lib/prisma.js";

export const listImages = async (req, res, next) => {
  try {
    const images = await prisma.image.findMany({
      select: { id: true, title: true, url: true, width: true, height: true },
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
};

export const getCharactersForImage = async (req, res, next) => {
  try {
    const imageId = parseInt(req.params.id, 10);
    const characters = await prisma.character.findMany({
      where: { imageId },
      select: {
        id: true,
        name: true,
        x_pct: true,
        y_pct: true,
        radius_pct: true,
      },
    });
    res.json(characters);
  } catch (err) {
    next(err);
  }
};
