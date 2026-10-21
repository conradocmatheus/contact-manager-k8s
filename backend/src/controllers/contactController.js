import prisma from "../../prisma/prismaClient.js";
import { asyncHandler } from "../utils/middlewares/asyncHandler.js";

export const getAllContacts = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || '';

    const whereCondition = {
        userId: userId,
        ...(searchTerm ? {
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive'} },
                { email: { contains: searchTerm, mode: 'insensitive' } }
            ]
        } : {})
    };

    const total = await prisma.contact.count({
        where: whereCondition
    });

    const contacts = await prisma.contact.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: {
            name: 'asc'
        }
    });

    res.status(200).json({
        contacts,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});

export const createContact = asyncHandler(async (req, res) => {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    const contact = await prisma.contact.create({
        data: { name, email, phone, userId }
    });

    res.status(201).json(contact);
});



export const getContactById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
        where: {
            id: parseInt(id),
            userId: req.user.id
        }
    });

    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json(contact);
});

export const updateContact = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const contact = await prisma.contact.findFirst({
        where: {
            id: parseInt(id),
            userId: req.user.id
        }
    });

    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    const updatedContact = await prisma.contact.update({
        where: {
            id: parseInt(id),
            userId: req.user.id
        },
        data: { name, email, phone }
    });

    res.status(200).json(updatedContact);
});

export const deleteContact = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
        where: {
            id: parseInt(id),
            userId: req.user.id
        }
    });

    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    await prisma.contact.delete({
        where: {
            id: parseInt(id),
            userId: req.user.id
        }
    });

    res.status(204).send();
});

export const deleteAllContactsByUser = asyncHandler(async (req, res) => {
    const deletedContacts = await prisma.contact.deleteMany({
        where: { userId: req.user.id },
    });

    if (deletedContacts.count === 0) {
        return res.status(404).json({
            status: 'error',
            message: 'No contacts found for this user',
        });
    }

    res.status(200).json({
        status: 'success',
        message: `Successfully deleted ${deletedContacts.count} contacts.`,
    });
});
