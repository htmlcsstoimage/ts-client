# HTML/CSS to Image TypeScript Client

A lightweight TypeScript client for the [HTML/CSS to Image API](https://htmlcsstoimage.com). Easily generate images from HTML/CSS, URLs, or templates in your TypeScript or JavaScript projects.

## Installation

```bash
npm install @html-css-to-image/client
```

## Quick Start

### Initialize the Client

You can initialize the client with your API ID and API Key. You can find these in your [HTML/CSS to Image dashboard](https://htmlcsstoimage.com/dashboard).

```typescript
import { HtmlCssToImageClient } from '@html-css-to-image/client';

const client = new HtmlCssToImageClient('your_user_id', 'your_api_key');
```

Alternatively, you can use environment variables (`HCTI_API_ID` and `HCTI_API_KEY`) and initialize the client like this:

```typescript
const client = HtmlCssToImageClient.fromEnv();
```

> [!CAUTION]
> **Security Warning:** Your API Key should always be kept secret. Never use this client directly in frontend code (browsers, mobile apps). If you need to generate images or signed URLs for the frontend, always do so from a secure backend server.

### Create an Image from HTML/CSS

```typescript
import { CreateHtmlCssImageRequest } from '@html-css-to-image/client';

const request = new CreateHtmlCssImageRequest({
  html: '<h1>Hello World</h1>',
  css: 'h1 { color: blue; }',
  google_fonts: ['Roboto'],
  format: 'webp'
});

const result = await client.createImage(request);

if (result.success) {
  console.log('Image URL:', result.url);
} else {
  console.error('Error:', result.error);
}
```

### Create an Image from a URL

```typescript
import { CreateUrlImageRequest } from '@html-css-to-image/client';

const request = new CreateUrlImageRequest({
  url: 'https://example.com/private-report',
  css: '.cookie-banner { display: none; }',
  headers: {
    Authorization: 'Bearer short-lived-token',
    'X-Preview-Mode': 'enabled'
  },
  additional_header_origins: ['https://api.example.com'],
  include_headers_on_subrequests: true,
  identify_as_hcti: true,
  full_screen: true
});

const result = await client.createImage(request);

if (result.success) {
  console.log('Image URL:', result.url);
}
```

Custom `headers` are restricted to the requested URL's origin. Set `include_headers_on_subrequests: true` when same-origin resources also require them, and use `additional_header_origins` to allow an exact cross-origin scheme, host, and port. See the [custom headers documentation](https://docs.htmlcsstoimage.com/parameters/headers/) for the complete request formats and security guidance.

### Delete Images

Delete one or more existing images from HCTI and clear them from the CDN using their image IDs.

```typescript
const result = await client.deleteImage('your_image_id');

if (!result.success) {
  console.error('Error:', result.error);
}

const batchResult = await client.deleteImageBatch([
  'first_image_id',
  'second_image_id'
]);
```

## Recordings

Create MP4, WebM, or GIF recordings with `createRecording`. Use `CreateUrlRecordingRequest` for a public webpage or `CreateHtmlCssRecordingRequest` for HTML/CSS:

```typescript
import {
  CreateUrlRecordingRequest,
  CreateHtmlCssRecordingRequest
} from '@html-css-to-image/client';

const result = await client.createRecording(new CreateUrlRecordingRequest({
  url: 'https://example.com',
  viewport_width: 1280,
  viewport_height: 720,
  duration_ms: 10000,
  actions: [{type: 'simple_scroll'}],
  output: {format: 'mp4'}
}));

if (result.success) {
  // Embed or request this URL directly; it responds once the recording is ready.
  console.log('Recording URL:', result.recording_url);
} else {
  console.error('Error:', result.error);
}

const animation = await client.createRecording(new CreateHtmlCssRecordingRequest({
  html: '<h1>Hello</h1>',
  css: '@keyframes fade { from { opacity: 0; } to { opacity: 1; } } h1 { animation: fade 2s; font-family: Roboto; }',
  google_fonts: ['Roboto'],
  duration_ms: 3000,
  duration_mode: 'fixed',
  output: {format: 'gif', scale: 0.5}
}));
```

Both request types share browser settings, triggers, ordered timeline actions, and output options. Optional settings use the API defaults.

To add a soundtrack to MP4 or WebM, pass `audio: {asset_id: "YOUR_ASSET_ID", delay_ms: 500}` or `audio: {url: "https://cdn.example.com/audio/intro.mp3"}` on either recording request. [Audio sources and playback options](https://docs.htmlcsstoimage.com/parameters/audio/).

Creation returns an ID, `status_url`, and `recording_url`. Embed the `recording_url` (in a `<video>` tag, or an `<img>` tag for GIFs) or request it directly; the request waits until the recording is ready, so there is no need to poll.

Checking status is optional and useful for workflows that track progress or failures:

```typescript
const status = await client.fetchRecordingStatus(result.id);
if (status.success) {
  console.log('Recording status:', status.status);
}
```

`fetchRecordingStatus` fetches the current state once; both HTTP 200 and 202 return `{success: true, ...}` with status information. The recording states `ready`, `failed`, and `cancelled` are terminal. A successful status fetch can report a failed recording, and a nonterminal recording can include an error from a previous attempt. A status this client version does not recognize, such as one added in a newer API version, is returned as `unknown`.

Triggers and actions are typed objects with a `type` discriminator. For example, wait until a page element appears, then click a button and hold the result:

```typescript
const demo = await client.createRecording(new CreateUrlRecordingRequest({
  url: 'https://example.com/demo',
  duration_ms: 5000,
  duration_mode: 'fixed',
  trigger: {type: 'element_visible', selector: '#demo', timeout_ms: 2000},
  actions: [
    {type: 'click', selector: '#start', if_not_found: [{type: 'error'}]},
    {type: 'stall', duration_ms: 1000}
  ]
}));
```

Nested branches run on the API. For JavaScript actions, omitting `if_error` or setting it to `null` fails the recording on a script error; `if_error: []` ignores the error.

Delete recordings by ID, individually or in a batch:

```typescript
const deleted = await client.deleteRecording('recording-id');
const batchDeleted = await client.deleteRecordingBatch(['first-id', 'second-id']);
```

Both delete methods return `{success: true}` when deletion is accepted, or the existing error response shape with `success: false`. `deleteRecordingBatch([])` returns `{success: true}` without making a request, as does `deleteImageBatch([])`.

See the [recording guide](https://docs.htmlcsstoimage.com/getting-started/recordings/), [actions reference](https://docs.htmlcsstoimage.com/parameters/actions/), and [trigger reference](https://docs.htmlcsstoimage.com/parameters/trigger/) for options and examples.

## Creating Image URLs

For use cases where you want to generate a URL on the server and use it safely on the client (without exposing your API key), you can generate a signed URL.

You can generate signed URLs for images without actually calling the API by calling `generateCreateAndRenderUrl` or `generateTemplatedImageUrl`.

These methods are synchronous because they don't make any network calls and have been designed to be very high-performance.

Read more about signed URLs in the [create-and-render docs](https://docs.htmlcsstoimage.com/getting-started/create-and-render/).

These URLs are tied to the API Key & API ID you provide when creating the client. If you change them or disable the keys, you'll need to generate new URLs.

These methods are handy when you have a lot of content that may never be rendered and want to render on-demand, as to not waste your image credits.

### Signed Template URLs

```typescript
const signedUrl = client.generateTemplatedImageUrl('your_template_id', {
  title: 'Dynamic Title'
}, undefined, 'webp');

console.log('Signed URL:', signedUrl);
```

> [!TIP]
> You can also pass in a `CreateTemplatedImageRequest` object to generate a signed URL for a template.

### Signed Screenshot URLs
Sometimes you want to maintain an endpoint for your images, and just take a screenshot of it. This is where the `generateCreateAndRenderUrl` method is handy.

```typescript
import {CreateUrlImageRequest} from '@html-css-to-image/client';
const this_item = {
    id: 123,
    updated_at: new Date(2025, 7, 15)
};
const url_request = new CreateUrlImageRequest({
    url: `https://website.com/_social/${this_item.id}?updated_at=${this_item.updated_at.valueOf()}`,
    format: 'webp',
    viewport_width: 600,
    viewport_height: 200});
const signedUrl = client.generateCreateAndRenderUrl(url_request);

// now it's safe to use signedUrl on the frontend in a meta or img tag, without exposing your API key, and it will be kept updated as the updated_at changes.
```

The helper serializes custom headers as repeated `headers=name:value` query parameters and each `additional_header_origins` entry as a repeated query parameter. Do not include secrets in signed URLs because the header values remain visible in the URL.

### Using Templates

If you have created a template for your account, you can generate an image by passing your template ID and the data for your variables.

```typescript
import { CreateTemplatedImageRequest } from '@html-css-to-image/client';

const result = await client.createImage(new CreateTemplatedImageRequest({
  template_id: 'your_template_id',
  format: 'jpg',
  template_values: {
    title: 'Hello from Template',
    subtitle: 'This is a dynamic value'
  }
}));
```

### PDF Generation

You can generate PDF documents by providing `pdf_options`.

```typescript
import { CreateHtmlCssImageRequest, PDFOptions } from '@html-css-to-image/client';

const request = new CreateHtmlCssImageRequest({
    html: '<h1>This will be a PDF</h1>',
    format: 'pdf',
    pdf_options: new PDFOptions({
        // Use numbers for pixels (default)
        // Or use an object for specific units (in, cm, mm, px)
        margins: {
            top: { value: 10, unit: 'mm' },
            right: { value: 10, unit: 'mm' },
            bottom: 20, // defaults to 20px
            left: { value: 1, unit: 'in' }
        }
    })
});

const result = await client.createImage(request);
```

### Batch Image Creation

Generate multiple images in a single request for better performance.

The number of images allowed in a batch depends on your plan, most plans allow up to 25 images per request.

```typescript
const variations = [
  new CreateHtmlCssImageRequest({ html: '<h1>Image 1</h1>' }),
  new CreateHtmlCssImageRequest({ html: '<h1>Image 2</h1>' })
];

const defaults = new CreateHtmlCssImageRequest({ 
  css: 'h1 { color: red; }',
  format: 'webp'
});

const result = await client.createImageBatch(variations, defaults);

if (result.success) {
  result.images.forEach(img => console.log(img.url));
}
```

## Custom Fetch

By default, the client uses the global `fetch`. 

If you are in an environment without a global fetch or want to use a custom implementation (like `node-fetch` or `undici`), you can pass it to the constructor.

```typescript
import fetch from 'node-fetch';

const client = new HtmlCssToImageClient(apiId, apiKey, fetch);
```

## Features

- **Full TypeScript support**: Strongly typed requests and responses.
- **HTML/CSS & URL Support**: Generate images from raw content or live websites.
- **Recordings**: Record HTML/CSS or webpages as MP4, WebM, or GIF with scripted interactions.
- **Templates**: Use your HCTI templates with dynamic data.
- **Signed URLs**: Securely generate image URLs with HMAC authentication.
- **PDF Support**: Comprehensive PDF generation options.
- **Batching**: Efficiently generate multiple images in one go.
- **Zero Dependencies**: Lightweight and uses native fetch by default.

---

> [!IMPORTANT]
> Check out the [HTML/CSS To Image Docs](https://docs.htmlcsstoimage.com) for more details on the API's capabilities.

> [!TIP]
> Get started for free at [htmlcsstoimage.com](https://htmlcsstoimage.com).

## Templated image batches

Create images from one or more templates with shared defaults and ordered variations:

```typescript
import {TemplatedBatchImageOptions} from '@html-css-to-image/client';

const result = await client.createTemplatedImageBatch([
  new TemplatedBatchImageOptions({template_values: {title: 'First'}}),
  new TemplatedBatchImageOptions({template_id: 't-other', template_values: {title: 'Second'}})
], new TemplatedBatchImageOptions({template_id: 't-card', template_version: 3, format: 'webp'}));
```

Omitted fields inherit defaults. Supplying a template ID resets the inherited version; omit its version to use latest. Template value objects merge recursively on the API; arrays, scalars, and explicit null values replace defaults. Results preserve input order and identical images reuse existing assets. Each merged values object must be nonempty and satisfy its template's required variables.

See the [API reference](https://docs.htmlcsstoimage.com/getting-started/using-the-api/#batch-templated-image-creation) for plan limits and examples.
