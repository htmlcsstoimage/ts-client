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
  google_fonts: ['Roboto']
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
  url: 'https://example.com',
  full_screen: true
});

const result = await client.createImage(request);

if (result.success) {
  console.log('Image URL:', result.url);
}
```

## Creating Image URLs

For use cases where you want to generate a URL on the server and use it safely on the client (without exposing your API key), you can generate a signed URL.

You can generate signed URLs for images without actually calling the API by calling `generateCreateAndRenderUrl` or `generateTemplatedImageUrl`.

These methods are synchronous because they don't make any network calls and have been designed to be very high-performance.

Read more about signed URLs in the [create-and-render docs](https://docs.htmlcsstoimage.com/getting-started/create-and-render/).

These URLs are tied to the API Key & API ID you provide when creating the client. If you change them or disable the keys, you'll need to generate new URLs.

These methods are handy when you have a lot of content that may never be rendered and want to render on-demand, as to not waste your image credits.

### Signed Template URLs

```typescript
const signedUrl = client.createTemplatedImageUrl('your_template_id', {
  title: 'Dynamic Title'
});

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
    url: `https://website.com/_social/${this_tem_id}?updated_at=${updated_at.valueOf()}`, 
    viewport_width: 600, 
    viewport_height: 200});
const signedUrl = client.generateCreateAndRenderUr(url_request);

// now it's safe to use signedUrl on the frontend in a meta or img tag, without exposing your API key, and it will be kept updated as the updated_at changes.
```

### Using Templates

If you have created a template for your account, you can generate an image by passing your template ID and the data for your variables.

```typescript
const result = await client.createImage({
  template_id: 'your_template_id',
  template_values: {
    title: 'Hello from Template',
    subtitle: 'This is a dynamic value'
  }
});
```

### PDF Generation

You can generate PDF documents by providing `pdf_options`.

```typescript
import { CreateHtmlCssImageRequest, PDFOptions } from '@html-css-to-image/client';

const request = new CreateHtmlCssImageRequest({
    html: '<h1>This will be a PDF</h1>',
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
  css: 'h1 { color: red; }' 
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