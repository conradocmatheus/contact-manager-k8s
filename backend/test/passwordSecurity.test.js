import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/prismaClient.js';
import {
    deleteCurrentUser,
    getCurrentUser,
    updateCurrentUser
} from '../src/controllers/userController.js';
import { signup, updatePassword } from '../src/controllers/authController.js';

const PUBLIC_USER = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
};

const invoke = (handler, request = {}) => new Promise((resolve, reject) => {
    const response = {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            resolve(this);
            return this;
        },
        send(body) {
            this.body = body;
            resolve(this);
            return this;
        }
    };

    handler(request, response, reject);
});

const mockUserMethod = (t, method, implementation) => {
    const original = prisma.user[method];
    prisma.user[method] = implementation;
    t.after(() => {
        prisma.user[method] = original;
    });
};

const assertPublicSelect = (select) => {
    assert.deepEqual(select, {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
    });
    assert.equal(Object.hasOwn(select, 'password'), false);
};

test('user lookup selects and returns only public fields', { concurrency: false }, async (t) => {
    mockUserMethod(t, 'findUnique', async ({ where, select }) => {
        assert.deepEqual(where, { id: 7 });
        assertPublicSelect(select);
        return PUBLIC_USER;
    });

    const response = await invoke(getCurrentUser, {
        user: { id: 7 },
        params: { id: '999' }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(Object.hasOwn(response.body, 'password'), false);
});

test('profile update selects and returns only public fields', { concurrency: false }, async (t) => {
    mockUserMethod(t, 'findUnique', async ({ where }) => {
        assert.deepEqual(where, { id: 7 });
        return { ...PUBLIC_USER, password: 'stored-hash' };
    });
    mockUserMethod(t, 'update', async ({ where, data, select }) => {
        assert.deepEqual(where, { id: 7 });
        assert.deepEqual(data, { name: 'New Name', email: 'new@example.com' });
        assertPublicSelect(select);
        return { ...PUBLIC_USER, ...data };
    });

    const response = await invoke(updateCurrentUser, {
        user: { id: 7 },
        params: { id: '999' },
        body: { name: 'New Name', email: 'new@example.com', password: 'ignored' }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(Object.hasOwn(response.body, 'password'), false);
});

test('account deletion only targets the authenticated user', { concurrency: false }, async (t) => {
    mockUserMethod(t, 'findUnique', async ({ where }) => {
        assert.deepEqual(where, { id: 7 });
        return PUBLIC_USER;
    });
    mockUserMethod(t, 'delete', async ({ where }) => {
        assert.deepEqual(where, { id: 7 });
        return PUBLIC_USER;
    });

    const response = await invoke(deleteCurrentUser, {
        user: { id: 7 },
        params: { id: '999' }
    });

    assert.equal(response.statusCode, 204);
});

test('signup stores a bcrypt hash and returns a public user', { concurrency: false }, async (t) => {
    const plainPassword = 'signup-password';

    mockUserMethod(t, 'findUnique', async () => null);
    mockUserMethod(t, 'create', async ({ data }) => {
        assert.notEqual(data.password, plainPassword);
        assert.equal(await bcrypt.compare(plainPassword, data.password), true);
        return { ...PUBLIC_USER, password: data.password };
    });

    const response = await invoke(signup, {
        body: { name: PUBLIC_USER.name, email: PUBLIC_USER.email, password: plainPassword }
    });

    assert.equal(response.statusCode, 201);
    assert.equal(Object.hasOwn(response.body.user, 'password'), false);
});

test('password update verifies and stores bcrypt hashes', { concurrency: false }, async (t) => {
    const currentPassword = 'current-password';
    const newPassword = 'new-password';
    const currentHash = await bcrypt.hash(currentPassword, 4);

    mockUserMethod(t, 'findUnique', async ({ where }) => {
        assert.deepEqual(where, { id: 7 });
        return { ...PUBLIC_USER, password: currentHash };
    });
    mockUserMethod(t, 'update', async ({ where, data }) => {
        assert.deepEqual(where, { id: 7 });
        assert.notEqual(data.password, newPassword);
        assert.equal(await bcrypt.compare(newPassword, data.password), true);
        return PUBLIC_USER;
    });

    const response = await invoke(updatePassword, {
        user: { id: 7 },
        params: { id: '999' },
        body: { currentPassword, newPassword }
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { message: 'Password updated successfully' });
});
