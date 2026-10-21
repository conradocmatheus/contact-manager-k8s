import prisma from "../../prisma/prismaClient.js";
import { asyncHandler } from "../utils/middlewares/asyncHandler.js";

const publicUserSelect = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true
};

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: publicUserSelect
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
});

export const updateCurrentUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, email },
        select: publicUserSelect
    });

    res.status(200).json(updatedUser);
});

export const deleteCurrentUser = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
        where: { id: req.user.id }
    });

    res.status(204).send();
});
