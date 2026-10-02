import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HtmlCssToImageClient, TemplatedBatchImageOptions, CreateTemplatedImageRequest} from '../src/index.js';

test('template batches preserve optional fields and nested null values without merging or mutating', async () => {
    const defaults = new TemplatedBatchImageOptions({template_id: 't-card', template_version: 3, template_values: {brand: {name: 'Acme', color: 'red'}}, format: 'webp'});
    const variations = [
        new TemplatedBatchImageOptions(),
        new CreateTemplatedImageRequest({template_id: 't-other', template_values: {brand: {color: null}, tags: [], active: false}})
    ];
    const before = JSON.stringify({defaults, variations});
    const client = new HtmlCssToImageClient('id', 'key', async (url, init) => {
        assert.equal(url, 'https://hcti.io/v1/image/batch/templated');
        assert.equal(init?.method, 'POST');
        assert.equal((init?.headers as Record<string, string>).Authorization, 'Basic aWQ6a2V5');
        assert.deepEqual(JSON.parse(init?.body as string), {
            default_options: {template_id: 't-card', template_version: 3, template_values: {brand: {name: 'Acme', color: 'red'}}, format: 'webp'},
            variations: [{}, {template_id: 't-other', template_values: {brand: {color: null}, tags: [], active: false}}]
        });
        return new Response(JSON.stringify({images: [{id: 'two', url: 'two'}, {id: 'one', url: 'one'}]}), {status: 200});
    });
    const result = await client.createTemplatedImageBatch(variations, defaults);
    assert.equal(result.success, true);
    if (result.success) assert.deepEqual(result.images.map(image => image.id), ['two', 'one']);
    assert.equal(JSON.stringify({defaults, variations}), before);
});

test('template batches omit defaults, propagate API errors and skip empty input', async () => {
    let calls = 0;
    const client = new HtmlCssToImageClient('id', 'key', async (_url, init) => {
        calls++;
        assert.deepEqual(JSON.parse(init?.body as string), {variations: [{template_id: 't-missing', template_values: {title: 'Hello'}}]});
        return new Response(JSON.stringify({error: 'Bad Request', message: 'Invalid template'}), {status: 400});
    });
    assert.deepEqual(await client.createTemplatedImageBatch([]), {success: true, images: []});
    assert.equal(calls, 0);
    const result = await client.createTemplatedImageBatch([new TemplatedBatchImageOptions({template_id: 't-missing', template_values: {title: 'Hello'}})]);
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.message, 'Invalid template');
    assert.equal(calls, 1);
});
