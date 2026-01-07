import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { HtmlCssToImageClient } from '../src/HtmlCssToImageClient.js';
import {CreateHtmlCssImageRequest, CreateUrlImageRequest, PDFOptions} from '../src/types/request.js';
import {CreateImageSuccessResponse} from "../src/types/response.js";

describe('HtmlCssToImageClient', () => {

    const apiId = 'user_id';
    const apiKey = 'api_key';

    test('createImage maps HTML/CSS and PDF options correctly', async (t) => {
        // Mock the global fetch
        const mockFetch = async (url: string, options: any) => {
            const body = JSON.parse(options.body);

            // Verify the mapping logic (internal serialization)
            assert.strictEqual(body.html, '<h1>Test</h1>');
            assert.deepStrictEqual(body.pdf_options.margins, ['10px', '20px', '10px', '20in']);
            assert.strictEqual(body.google_fonts, 'Roboto|Open+Sans');

            return {
                ok: true,
                json: async () => ({ id: '123', url: 'https://hcti.io/v1/image/123' } as CreateImageSuccessResponse)
            };
        };


        const request = new CreateHtmlCssImageRequest({
            html: '<h1>Test</h1>',
            google_fonts: ['Roboto', 'Open Sans','Open Sans'],
            pdf_options: new PDFOptions({
                margins: { top: 10,  bottom: 10, right: 20, left: {value: 20, unit: 'in'} }
            })
        });
        const client = new HtmlCssToImageClient(apiId, apiKey, mockFetch as any);

        const result = await client.createImage(request);

        if (result.success) {
            assert.strictEqual(result.id, '123');
        } else {
            assert.fail('Should have been a success response');
        }
    });

    test('createImageBatch correctly maps and sends batch request', async () => {

        const mockFetch = (async (url: string, options: any) => {
            assert.strictEqual(url, 'https://hcti.io/v1/image/batch');
            const body = JSON.parse(options.body);

            // Verify default options
            assert.strictEqual(body.default_options.viewport_width, 1280);

            // Verify variations mapping
            assert.strictEqual(body.variations.length, 2);
            assert.strictEqual(body.variations[0].html, '<h1>V1</h1>');
            assert.strictEqual(body.variations[1].html, '<h1>V2</h1>');
            console.log(options.body);

            return {
                ok: true,
                json: async () => ({ images: [{ id: '1', url: 'u1' }, { id: '2', url: 'u2' }] })
            };
        }) as any;

            const variations = [
                new CreateHtmlCssImageRequest({ html: '<h1>V1</h1>' }),
                new CreateHtmlCssImageRequest({ html: '<h1>V2</h1>', pdf_options: new PDFOptions({ margins: {top: 1, bottom: {value: 2, unit: 'cm'}, left: 3, right: 4}}) })
            ];
            const defaults = new CreateHtmlCssImageRequest({ html: '', viewport_width: 1280 });
            const client = new HtmlCssToImageClient(apiId, apiKey, mockFetch as any);
            const result = await client.createImageBatch(variations, defaults);
            assert.strictEqual(result.success, true);
            assert.ok(Array.isArray(result.images));
            assert.strictEqual(result.images.length, 2);

    });

    test('createImageBatch works with base html', async () => {

        const mockFetch = (async (url: string, options: any) => {
            assert.strictEqual(url, 'https://hcti.io/v1/image/batch');
            const body = JSON.parse(options.body);

            // Verify default options
            assert.strictEqual(body.default_options.viewport_width, 1280);

            // Verify variations mapping
            assert.strictEqual(body.variations.length, 2);
            assert.strictEqual(body.variations[0].html, '<h1>V1</h1>');
            assert.strictEqual(body.variations[1].html,  undefined);
            assert.strictEqual(body.default_options.html, '<h1>BASE</h1>');
            console.log(options.body);

            return {
                ok: true,
                json: async () => ({ images: [{ id: '1', url: 'u1' }, { id: '2', url: 'u2' }] })
            };
        }) as any;


            const variations = [
                new CreateHtmlCssImageRequest({ html: '<h1>V1</h1>' }),
                new CreateHtmlCssImageRequest({ pdf_options: new PDFOptions({ margins: {top: 1, bottom: {value: 2, unit: 'cm'}, left: 3, right: 4}}) })
            ];
            const defaults = new CreateHtmlCssImageRequest({ html: '<h1>BASE</h1>', viewport_width: 1280 });
        const client = new HtmlCssToImageClient(apiId, apiKey, mockFetch as any);
            const result = await client.createImageBatch(variations, defaults);
            assert.strictEqual(result.success, true);
            assert.ok(Array.isArray(result.images));
            assert.strictEqual(result.images.length, 2);

    });


    test('createTemplatedImageUrl generates valid HMAC token', () => {
        const client = new HtmlCssToImageClient(apiId, apiKey);
        const url = client.createTemplatedImageUrl('my-template', { name: 'Bob' });
        const parsed_url = new URL(url);
        assert.ok(parsed_url.protocol === 'https:');
        assert.ok(parsed_url.hostname === 'hcti.io');
        assert.ok(parsed_url.pathname.startsWith('/v1/image/my-template/'));
        assert.ok(parsed_url.search.includes('name=Bob'));
        // Verify it has the hex token (64 chars for sha256)
        const parts = parsed_url.pathname.split('/');
        assert.strictEqual(parts[parts.length - 1].length, 64);

    });

    test('createImage handles validation errors correctly', async () => {
        const mockFetch = async () => {
            return {
                ok: false,
                status: 400,
                json: async () => ({
                    error: 'Validation Failed',
                    message: 'Invalid input',
                    validation_errors: [
                        { path: 'html', message: 'is required' }
                    ]
                })
            } as Response;
        };

        const client = new HtmlCssToImageClient(apiId, apiKey, mockFetch as any);
        const request = new CreateHtmlCssImageRequest({ html: '' });

        const result = await client.createImage(request);

        assert.strictEqual(result.success, false);
        if (!result.success) {
            assert.strictEqual(result.error, 'Validation Failed');
            assert.ok(Array.isArray(result.validation_errors));
            assert.strictEqual(result.validation_errors[0].path, 'html');
        } else {
            assert.fail('Should have been an error response');
        }
    });

    test('responseToType handles empty or malformed error messages', async () => {
        const mockFetch = async () => {
            return {
                ok: false,
                status: 500,
                json: async () => ({ error: 'Internal Server Error' })
            } as Response;
        };

        const client = new HtmlCssToImageClient(apiId, apiKey, mockFetch as any);
        const request = new CreateUrlImageRequest({ url: 'https://example.com' });

        const result = await client.createImage(request);

        assert.strictEqual(result.success, false);
        if (!result.success) {
            assert.strictEqual(result.error, 'Internal Server Error');
        }
    });
});