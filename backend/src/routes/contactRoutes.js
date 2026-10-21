import { Router } from 'express';
import {
    createContact, deleteAllContactsByUser,
    deleteContact,
    getAllContacts,
    getContactById,
    updateContact
} from '../controllers/contactController.js';
import {authMiddleware} from "../utils/middlewares/authMiddleware.js";

const router = new Router();

router.get('/', authMiddleware, getAllContacts);
router.post('/', authMiddleware, createContact);
router.get('/:id', authMiddleware, getContactById);
router.put('/:id', authMiddleware, updateContact);
router.delete('/all', authMiddleware, deleteAllContactsByUser);
router.delete('/:id', authMiddleware, deleteContact);

export default router;
