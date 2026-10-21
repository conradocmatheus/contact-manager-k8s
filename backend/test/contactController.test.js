import test from 'node:test';
import assert from 'node:assert/strict';

import prisma from '../prisma/prismaClient.js';
import {
    createContact,
    deleteAllContactsByUser,
    deleteContact,
    getAllContacts,
    getContactById,
    updateContact
} from '../src/controllers/contactController.js';

const invoke = (handler, req) => new Promise((resolve, reject) => {
    const res = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            resolve(this);
            return this;
        },
        send() {
            resolve(this);
            return this;
        }
    };

    handler(req, res, reject);
});

const mockPrismaMethod = (t, methodName, implementation) => {
    const original = prisma.contact[methodName];
    prisma.contact[methodName] = implementation;
    t.after(() => {
        prisma.contact[methodName] = original;
    });
};

test('lists paginated contacts only for the authenticated user', async (t) => {
    const expectedWhere = { userId: 7 };
    mockPrismaMethod(t, 'count', async ({ where }) => {
        assert.deepEqual(where, expectedWhere);
        return 0;
    });
    mockPrismaMethod(t, 'findMany', async ({ where, skip, take, orderBy }) => {
        assert.deepEqual(where, expectedWhere);
        assert.equal(skip, 0);
        assert.equal(take, 10);
        assert.deepEqual(orderBy, { name: 'asc' });
        return [];
    });

    const res = await invoke(getAllContacts, {
        user: { id: 7 },
        query: {}
    });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
        contacts: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    });
});

test('assigns a new contact to the authenticated user', async (t) => {
    mockPrismaMethod(t, 'create', async ({ data }) => {
        assert.deepEqual(data, {
            name: 'Alice',
            email: 'alice@example.com',
            phone: '123',
            userId: 7
        });
        return { id: 1, ...data };
    });

    const res = await invoke(createContact, {
        user: { id: 7 },
        body: {
            name: 'Alice',
            email: 'alice@example.com',
            phone: '123',
            userId: 99
        }
    });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.userId, 7);
});

test('scopes contact lookup to the authenticated user', async (t) => {
    mockPrismaMethod(t, 'findFirst', async ({ where }) => {
        assert.deepEqual(where, { id: 12, userId: 7 });
        return null;
    });

    const res = await invoke(getContactById, {
        user: { id: 7 },
        params: { id: '12' }
    });

    assert.equal(res.statusCode, 404);
});

test('does not update a contact owned by another user', async (t) => {
    mockPrismaMethod(t, 'findFirst', async ({ where }) => {
        assert.deepEqual(where, { id: 12, userId: 7 });
        return null;
    });
    let updateCalled = false;
    mockPrismaMethod(t, 'update', async () => {
        updateCalled = true;
        return {};
    });

    const res = await invoke(updateContact, {
        user: { id: 7 },
        params: { id: '12' },
        body: { name: 'Changed', email: null, phone: '456' }
    });

    assert.equal(res.statusCode, 404);
    assert.equal(updateCalled, false);
});

test('scopes the update itself to the authenticated user', async (t) => {
    mockPrismaMethod(t, 'findFirst', async () => ({ id: 12, userId: 7 }));
    mockPrismaMethod(t, 'update', async ({ where, data }) => {
        assert.deepEqual(where, { id: 12, userId: 7 });
        return { id: 12, userId: 7, ...data };
    });

    const res = await invoke(updateContact, {
        user: { id: 7 },
        params: { id: '12' },
        body: { name: 'Changed', email: null, phone: '456' }
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.userId, 7);
});

test('does not delete a contact owned by another user', async (t) => {
    mockPrismaMethod(t, 'findFirst', async ({ where }) => {
        assert.deepEqual(where, { id: 12, userId: 7 });
        return null;
    });
    let deleteCalled = false;
    mockPrismaMethod(t, 'delete', async () => {
        deleteCalled = true;
        return {};
    });

    const res = await invoke(deleteContact, {
        user: { id: 7 },
        params: { id: '12' }
    });

    assert.equal(res.statusCode, 404);
    assert.equal(deleteCalled, false);
});

test('scopes the deletion itself to the authenticated user', async (t) => {
    mockPrismaMethod(t, 'findFirst', async () => ({ id: 12, userId: 7 }));
    mockPrismaMethod(t, 'delete', async ({ where }) => {
        assert.deepEqual(where, { id: 12, userId: 7 });
        return { id: 12, userId: 7 };
    });

    const res = await invoke(deleteContact, {
        user: { id: 7 },
        params: { id: '12' }
    });

    assert.equal(res.statusCode, 204);
});

test('deletes all contacts for the authenticated user without a URL ID', async (t) => {
    mockPrismaMethod(t, 'deleteMany', async ({ where }) => {
        assert.deepEqual(where, { userId: 7 });
        return { count: 2 };
    });

    const res = await invoke(deleteAllContactsByUser, {
        user: { id: 7 }
    });

    assert.equal(res.statusCode, 200);
    assert.match(res.body.message, /2 contacts/);
});
