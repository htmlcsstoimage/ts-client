import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
    HtmlCssToImageClient,
    CreateHtmlCssRecordingRequest,
    CreateUrlRecordingRequest,
    RequestOverrideAction,
    RequestOverrideResourceType,
} from '../src/index.js';
import type {
    IHtmlCssToImageClient,
    RecordingAction,
    RecordingStatus,
    RecordingTrigger,
} from '../src/index.js';

const recordingId = '01a1b2c3-d4e5-7f60-8a9b-0c1d2e3f4a5b';
const created = {
    id: recordingId,
    status_url: `https://hcti.io/v1/recordings/${recordingId}/status`,
    recording_url: `https://hcti.io/v1/recording/${recordingId}.mp4`,
};

function assertAuth(init?: RequestInit) {
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Basic aWQ6a2V5');
}

test('createRecording maps HTML fonts and strips the internal discriminator without mutating input', async () => {
    const request = new CreateHtmlCssRecordingRequest({
        html: '<h1>Hello</h1>', css: 'h1 { font-family: "Open Sans"; }', duration_ms: 3000,
        google_fonts: [' Roboto ', 'Open Sans', 'Open Sans', ''],
        audio: {asset_id: 'asset_1', delay_ms: 0, error_on_source_invalid: false},
    });
    const before = JSON.stringify(request);
    const client: IHtmlCssToImageClient = new HtmlCssToImageClient('id', 'key', async (url, init) => {
        assert.equal(url, 'https://hcti.io/v1/recording');
        assert.equal(init?.method, 'POST');
        assertAuth(init);
        assert.equal(new Headers(init?.headers).get('Content-Type'), 'application/json');
        assert.deepEqual(JSON.parse(init?.body as string), {
            html: '<h1>Hello</h1>', css: 'h1 { font-family: "Open Sans"; }', duration_ms: 3000,
            google_fonts: 'Roboto|Open+Sans',
            audio: {asset_id: 'asset_1', delay_ms: 0, error_on_source_invalid: false},
        });
        return new Response(JSON.stringify(created));
    });
    const result = await client.createRecording(request);
    assert.deepEqual(result, {success: true, ...created});
    if (result.success) assert.equal(result.recording_url, created.recording_url);
    assert.equal(JSON.stringify(request), before);
});

test('createRecording preserves URL settings, browser options, and nested timeline branches', async () => {
    const actions: RecordingAction[] = [
        {
            type: 'locate_selector', selector: '#dialog', timeout_ms: 1000,
            if_found: [{
                type: 'click', selector: '#close', button: 'right', count: 2,
                delay_ms: 0, offset_x: 0, offset_y: -1, if_not_found: [{type: 'error'}],
            }],
            if_not_found: [],
        },
        {type: 'execute_javascript', script: 'await Promise.resolve();', timeout_ms: 500, if_error: []},
        {type: 'execute_javascript', script: 'throw new Error();', if_error: null},
        {type: 'execute_javascript', script: 'document.title = "Demo";'},
        {
            type: 'scroll', container_selector: 'main', if_not_found: [{type: 'stall', duration_ms: 100}],
            steps: [
                {to: {type: 'position', position: 'bottom'}, duration_ms: 800, easing: 'ease_in_out_cubic'},
                {to: {type: 'coordinates', x: 0, y: 200}, duration_ms: 500, easing: 'linear'},
                {to: {type: 'selector', selector: '#footer', offset_x: 0, offset_y: -40, if_not_found: []}, duration_ms: 800},
            ],
        },
        {type: 'simple_scroll', scroll_duration_ms: 800, ms_between_scrolls: 0, scroll_distance: '90vh', easing: 'ease_in_out_expo', stall_at_end_ms: 0},
        {type: 'simple_scroll', scroll_distance: 900},
        {type: 'stall', duration_ms: 0},
    ];
    const options = {
        url: 'https://example.com/private', duration_ms: 5000, css: 'body { background: black; }',
        headers: {Authorization: 'Bearer test'}, additional_header_origins: ['https://assets.example.com'],
        include_headers_on_subrequests: false, identify_as_hcti: true, block_consent_banners: true,
        device_scale: 2, viewport_width: 1280, viewport_height: 720,
        disable_twemoji: false, dedupe_duration_s: 0, color_scheme: 'dark' as const,
        timezone: 'America/New_York', viewport_mobile: false, viewport_landscape: true,
        viewport_touch: false, media_type: 'screen' as const, proxy_id: 'proxy_1',
        storage_destination_id: 'storage_1',
        request_overrides: [{action: RequestOverrideAction.Block, resource_types: [RequestOverrideResourceType.Script]}],
        duration_mode: 'at_least' as const, defer_render: false, skip_scroll_preload: true,
        output: {format: 'webm' as const, fps: 60, scale: 0.5},
        audio: {url: 'https://cdn.example.com/audio/intro.mp3', source_start_ms: 100, when_audio_ends: 'loop' as const},
        trigger: {type: 'element_visible' as const, selector: '#ready', timeout_ms: 2000}, actions,
    };
    const request = new CreateUrlRecordingRequest(options);
    const before = JSON.stringify(request);
    const client = new HtmlCssToImageClient('id', 'key', async (url, init) => {
        assert.equal(url, 'https://hcti.io/v1/recording');
        assert.equal(init?.method, 'POST');
        assertAuth(init);
        assert.deepEqual(JSON.parse(init?.body as string), options);
        return new Response(JSON.stringify(created));
    });
    assert.equal((await client.createRecording(request)).success, true);
    assert.equal(JSON.stringify(request), before);
});

for (const trigger of [{type: 'immediate'}, {type: 'function_call', timeout_ms: 1000}] satisfies RecordingTrigger[]) {
    test(`createRecording sends the ${trigger.type} trigger`, async () => {
        const client = new HtmlCssToImageClient('id', 'key', async (_url, init) => {
            assert.deepEqual(JSON.parse(init?.body as string), {url: 'https://example.com', duration_ms: 1000, trigger});
            return new Response(JSON.stringify(created));
        });
        await client.createRecording(new CreateUrlRecordingRequest({url: 'https://example.com', duration_ms: 1000, trigger}));
    });
}

for (const google_fonts of [undefined, [], null]) {
    test(`createRecording handles ${JSON.stringify(google_fonts)} fonts without adding defaults`, async () => {
        const client = new HtmlCssToImageClient('id', 'key', async (_url, init) => {
            const body = JSON.parse(init?.body as string);
            assert.deepEqual(body, {
                html: '<h1>Hello</h1>', duration_ms: 1000,
                ...(google_fonts === null ? {google_fonts: null} : {}),
            });
            return new Response(JSON.stringify(created));
        });
        await client.createRecording(new CreateHtmlCssRecordingRequest({html: '<h1>Hello</h1>', duration_ms: 1000, google_fonts}));
    });
}

test('createRecording preserves explicit null settings and leaves option validation to the API', async () => {
    const options = {
        url: 'https://example.com', duration_ms: 0,
        actions: null, trigger: null, output: null, duration_mode: null, defer_render: null,
    };
    const client = new HtmlCssToImageClient('id', 'key', async (_url, init) => {
        assert.deepEqual(JSON.parse(init?.body as string), options);
        return new Response(JSON.stringify({error: 'Bad Request', message: 'Invalid duration'}), {status: 400});
    });
    assert.deepEqual(await client.createRecording(new CreateUrlRecordingRequest(options)), {
        success: false, error: 'Bad Request', message: 'Invalid duration',
    });
});

const states: [RecordingStatus, number][] = [
    ['awaiting_render', 202], ['processing', 202], ['pending_retry', 202],
    ['ready', 200], ['failed', 200], ['cancelled', 200],
];
for (const [status, httpStatus] of states) {
    test(`fetchRecordingStatus returns ${status} from HTTP ${httpStatus}`, async () => {
        const body = {
            id: recordingId, recording_url: created.recording_url, status,
            status_entered_at: '2026-11-16T10:00:00Z', attempt_count: 2,
            stored_duration_ms: status === 'ready' ? 1500 : null,
            storage_destination_hcti_storage_disabled: status === 'ready' ? true : null,
            error: status === 'pending_retry' || status === 'failed' ? {
                code: 'action_error', message: 'Missing element', occurred_at: '2026-11-16T09:59:00Z',
                retryable: status === 'pending_retry', action_path: 'actions[1].if_found[0]',
            } : null,
        };
        const client: IHtmlCssToImageClient = new HtmlCssToImageClient('id', 'key', async (url, init) => {
            assert.equal(url, created.status_url);
            assert.equal(init?.method, 'GET');
            assert.equal(init?.body, undefined);
            assertAuth(init);
            return new Response(JSON.stringify(body), {status: httpStatus});
        });
        const result = await client.fetchRecordingStatus(recordingId);
        assert.deepEqual(result, {success: true, ...body});
        if (result.success) {
            assert.equal(result.status, status);
            assert.equal(result.attempt_count, 2);
        }
    });
}

test('fetchRecordingStatus maps unrecognized statuses to unknown', async () => {
    const body = {id: recordingId, recording_url: created.recording_url, status: 'archived', status_entered_at: '2026-11-16T10:00:00Z', attempt_count: 1};
    const client: IHtmlCssToImageClient = new HtmlCssToImageClient('id', 'key', async () => new Response(JSON.stringify(body)));
    assert.deepEqual(await client.fetchRecordingStatus(recordingId), {success: true, ...body, status: 'unknown'});
});

test('deleteRecording accepts an empty success body', async () => {
    const client: IHtmlCssToImageClient = new HtmlCssToImageClient('id', 'key', async (url, init) => {
        assert.equal(url, `https://hcti.io/v1/recordings/${recordingId}`);
        assert.equal(init?.method, 'DELETE');
        assert.equal(init?.body, undefined);
        assertAuth(init);
        return new Response(null, {status: 202});
    });
    assert.deepEqual(await client.deleteRecording(recordingId), {success: true});
});

test('deleteRecordingBatch sends IDs without local filtering', async () => {
    const ids = [recordingId, 'second-id'];
    const client: IHtmlCssToImageClient = new HtmlCssToImageClient('id', 'key', async (url, init) => {
        assert.equal(url, 'https://hcti.io/v1/recordings/batch');
        assert.equal(init?.method, 'DELETE');
        assertAuth(init);
        assert.equal(new Headers(init?.headers).get('Content-Type'), 'application/json');
        assert.deepEqual(JSON.parse(init?.body as string), {ids});
        return new Response(null, {status: 202});
    });
    assert.deepEqual(await client.deleteRecordingBatch(ids), {success: true});
});

test('deleteRecordingBatch returns success for an empty list without a request', async () => {
    let calls = 0;
    const client: IHtmlCssToImageClient = new HtmlCssToImageClient('id', 'key', async () => {
        calls++;
        return new Response(null, {status: 202});
    });
    assert.deepEqual(await client.deleteRecordingBatch([]), {success: true});
    assert.equal(calls, 0);
});

const operations = {
    createRecording: (client: IHtmlCssToImageClient) => client.createRecording(new CreateUrlRecordingRequest({url: 'https://example.com', duration_ms: 1000})),
    fetchRecordingStatus: (client: IHtmlCssToImageClient) => client.fetchRecordingStatus(recordingId),
    deleteRecording: (client: IHtmlCssToImageClient) => client.deleteRecording(recordingId),
    deleteRecordingBatch: (client: IHtmlCssToImageClient) => client.deleteRecordingBatch([recordingId]),
};
for (const [name, call] of Object.entries(operations)) {
    test(`${name} returns API errors through the existing response union`, async () => {
        const error = {error: 'Forbidden', message: 'Missing permission', validation_errors: [{path: 'duration_ms', message: 'Invalid value'}]};
        const client = new HtmlCssToImageClient('id', 'key', async () => new Response(JSON.stringify(error), {status: 403}));
        const result = await call(client);
        assert.deepEqual(result, {success: false, ...error});
        if (!result.success) assert.equal(result.error, 'Forbidden');
    });

    test(`${name} uses the existing fallback for non-JSON server errors`, async () => {
        const client = new HtmlCssToImageClient('id', 'key', async () => new Response('Unavailable', {status: 502}));
        assert.deepEqual(await call(client), {
            success: false, error: 'Internal Server Error',
            message: 'The server returned an unexpected response (Status: 502).',
        });
    });

    test(`${name} propagates transport errors`, async () => {
        const error = new Error('Network unavailable');
        const client = new HtmlCssToImageClient('id', 'key', async () => {throw error;});
        await assert.rejects(() => call(client), error);
    });
}
