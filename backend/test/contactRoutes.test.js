import test from 'node:test';
import assert from 'node:assert/strict';

import contactRoutes from '../src/routes/contactRoutes.js';

const routeContracts = contactRoutes.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods).sort()
    }));

test('exposes one authenticated collection endpoint without a user ID', () => {
    assert.deepEqual(routeContracts, [
        { path: '/', methods: ['get'] },
        { path: '/', methods: ['post'] },
        { path: '/:id', methods: ['get'] },
        { path: '/:id', methods: ['put'] },
        { path: '/all', methods: ['delete'] },
        { path: '/:id', methods: ['delete'] }
    ]);
});

test('registers the delete-all route before the delete-by-id route', () => {
    const deletePaths = contactRoutes.stack
        .filter((layer) => layer.route?.methods.delete)
        .map((layer) => layer.route.path);

    assert.deepEqual(deletePaths, ['/all', '/:id']);
});
