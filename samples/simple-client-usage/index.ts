import {
    HtmlCssToImageClient,
    CreateHtmlCssImageRequest,
    CreateUrlImageRequest
} from '@html-css-to-image/client';

// Initialize with your credentials
const client = new HtmlCssToImageClient('your_user_id', 'your_api_key');

// Or use environment variables:
// const client = HtmlCssToImageClient.fromEnv();

async function main() {
    // Example 1: Create image from HTML/CSS
    const htmlRequest = new CreateHtmlCssImageRequest({
        html: '<div class="card"><h1>Hello World!</h1><p>Generated with @html-css-to-image/client</p></div>',
        css: `
      .card {
        font-family: sans-serif;
        padding: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
      }
      h1 { margin: 0 0 10px; }
      p { margin: 0; opacity: 0.9; }
    `,
        google_fonts: ['Inter']
    });

    console.log('Creating image from HTML/CSS...');
    const htmlResult = await client.createImage(htmlRequest);

    if (htmlResult.success) {
        console.log('✅ Image created:', htmlResult.url);
    } else {
        console.error('❌ Error:', htmlResult.error);
    }

    // Example 2: Screenshot a URL
    const urlRequest = new CreateUrlImageRequest({
        url: 'https://example.com',
        viewport_width: 1280,
        viewport_height: 800
    });

    console.log('\nTaking screenshot of URL...');
    const urlResult = await client.createImage(urlRequest);

    if (urlResult.success) {
        console.log('✅ Screenshot created:', urlResult.url);
    } else {
        console.error('❌ Error:', urlResult.error);
    }

    // Example 3: Generate a signed URL (no API call, instant)
    const signedUrl = client.generateCreateAndRenderUrl(
        new CreateUrlImageRequest({
            url: 'https://example.com',
            viewport_width: 800
        })
    );
    console.log('\n🔗 Signed URL (renders on first request):', signedUrl);
}

main().catch(console.error);