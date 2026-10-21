import test from 'node:test';
import assert from 'node:assert/strict';
import userRoutes from '../src/routes/userRoutes.js';
import authRoutes from '../src/routes/authRoutes.js';

const routeContracts = (router) => router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods).sort()
    }));

test('profile routes identify the current user without URL parameters', () => {
    assert.deepEqual(routeContracts(userRoutes), [
        { path: '/me', methods: ['get'] },
        { path: '/me', methods: ['put'] },
        { path: '/me', methods: ['delete'] }
    ]);
});

test('password update route does not accept a user ID', () => {
    assert.deepEqual(routeContracts(authRoutes), [
        { path: '/signup', methods: ['post'] },
        { path: '/login', methods: ['post'] },
        { path: '/password', methods: ['put'] }
    ]);
});
