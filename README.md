# HTML/CSS to Image TypeScript Client

A lightweight TypeScript client for the [HTML/CSS to Image API](https://htmlcsstoimage.com). Easily generate images from HTML/CSS, URLs, or templates in your TypeScript or JavaScript projects.

## Installation

```bash
npm install @htmlcsstoimage/ts-client
```

## Quick Start

### Initialize the Client

You can initialize the client with your API ID and API Key. You can find these in your [HTML/CSS to Image dashboard](https://htmlcsstoimage.com/dashboard).

```typescript
import { HtmlCssToImageClient } from '@htmlcsstoimage/ts-client';

const client = new HtmlCssToImageClient('your_user_id', 'your_api_key');
```

Alternatively, you can use environment variables (`HCTI_API_ID` and `HCTI_API_KEY`) and initialize the client like this:

```typescript
const client = HtmlCssToImageClient.fromEnv();
```

### Create an Image from HTML/CSS

```typescript
import { CreateHtmlCssImageRequest } from '@htmlcsstoimage/ts-client';

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
import { CreateUrlImageRequest } from '@htmlcsstoimage/ts-client';

const request = new CreateUrlImageRequest({
  url: 'https://example.com',
  full_screen: true
});

const result = await client.createImage(request);

if (result.success) {
  console.log('Image URL:', result.url);
}
```

## Advanced Usage

### Using Templates

If you have created a template in your dashboard, you can generate an image by passing your template ID and the data for your variables.

```typescript
const result = await client.createImage({
  template_id: 'your_template_id',
  template_values: {
    title: 'Hello from Template',
    subtitle: 'This is a dynamic value'
  }
});
```

### Generating Signed Template URLs

For use cases where you want to generate a URL on the server and use it safely on the client (without exposing your API key), you can generate a signed URL.

```typescript
const signedUrl = client.createTemplatedImageUrl('your_template_id', {
  title: 'Dynamic Title'
});

console.log('Signed URL:', signedUrl);
```

### PDF Generation

You can generate PDF documents by providing `pdf_options`.

```typescript
import { CreateHtmlCssImageRequest, PDFOptions } from '@htmlcsstoimage/ts-client';

const request = new CreateHtmlCssImageRequest({
  html: '<h1>This will be a PDF</h1>',
  pdf_options: new PDFOptions({
    page_size: 'A4',
    margins: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
  })
});

const result = await client.createImage(request);
```

### Batch Processing

Generate multiple images in a single request for better performance.

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

### Custom Fetch

By default, the client uses the global `fetch`. If you are in an environment without a global fetch or want to use a custom implementation (like `node-fetch` or `undici`), you can pass it to the constructor.

```typescript
import fetch from 'node-fetch';

const client = new HtmlCssToImageClient(apiId, apiKey, fetch);
```

## Features

- **Full TypeScript support**: Strongly typed requests and responses.
- **HTML/CSS & URL Support**: Generate images from raw content or live websites.
- **Templates**: Use your HCTI dashboard templates with dynamic data.
- **Signed URLs**: Securely generate image URLs with HMAC authentication.
- **PDF Support**: Comprehensive PDF generation options.
- **Batching**: Efficiently generate multiple images in one go.
- **Zero Dependencies**: Lightweight and uses native fetch by default.

## License

MIT
