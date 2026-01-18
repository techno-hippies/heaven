# fal.ai Integration Setup

## Overview

The PhotoStep component uses fal.ai's image processing API to apply artistic styles to user avatars. Currently using mock implementation - follow steps below to enable real processing.

## Artist Styles

Three classical artist styles are available:

1. **Michelangelo** 🗿 - Renaissance sculpture aesthetic, marble statue, dramatic chiaroscuro
2. **Rubens** 🎭 - Baroque painting, rich warm colors, dramatic composition
3. **Da Vinci** 🎨 - Renaissance painting, sfumato technique, classical harmonious composition

## Setup Instructions

### 1. Install fal.ai SDK

```bash
bun add @fal-ai/serverless-client
```

### 2. Get API Key

1. Sign up at [fal.ai](https://fal.ai)
2. Get your API key from the dashboard
3. Add to `.env`:

```bash
VITE_FAL_KEY=your_actual_key_here
```

### 3. Enable Integration

In `src/features/onboarding/hooks/useFalAI.ts`, uncomment the implementation:

```typescript
// Uncomment this section:
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
})

const result = await fal.subscribe("fal-ai/flux/dev", {
  input: {
    image_url: imageUrl,
    prompt: STYLE_PROMPTS[style],
    image_size: "square_hd",
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    enable_safety_checker: true,
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      console.log('Processing:', update.logs)
    }
  },
})

return {
  url: result.images[0].url,
  style,
}
```

### 4. Model Options

Current implementation uses `fal-ai/flux/dev`. Alternative models:

- `fal-ai/flux-pro` - Higher quality, slower
- `fal-ai/flux-lora` - Custom LoRA models
- `fal-ai/stable-diffusion-xl` - SD-based alternative

### 5. Cost Optimization

- **Cache results**: Store processed images to avoid reprocessing
- **Batch processing**: Process multiple images in parallel
- **Lower steps**: Reduce `num_inference_steps` for faster/cheaper results (trade quality)
- **Image size**: Use smaller sizes for previews

### 6. Testing

Mock implementation is enabled by default. Test the UI flow:

```bash
bun run storybook
# Navigate to Features/Onboarding/Steps/PhotoStep
```

Stories available:
- `Empty` - Initial upload state
- `WithPhoto` - Photo uploaded, choose style
- `WithMichelangeloStyle` - Processed with Michelangelo
- `WithRubensStyle` - Processed with Rubens
- `WithDaVinciStyle` - Processed with Da Vinci

## API Reference

### processImageWithFalAI

```typescript
processImageWithFalAI({
  imageUrl: string,  // URL or blob of source image
  style: ArtistStyle // 'michelangelo' | 'rubens' | 'davinci'
}): Promise<ProcessImageResult>
```

Returns:
```typescript
{
  url: string,      // URL of processed image
  style: ArtistStyle // Style that was applied
}
```

## Troubleshooting

**API key not working:**
- Verify env var is prefixed with `VITE_`
- Restart dev server after adding env var
- Check fal.ai dashboard for API key validity

**Processing fails:**
- Check network connection
- Verify image URL is accessible
- Check fal.ai API status
- Review console for error messages

**Slow processing:**
- Normal for first request (cold start)
- Reduce `num_inference_steps` for speed
- Consider caching results

## Production Considerations

1. **Upload to CDN**: Store processed images on R2/S3, not fal.ai URLs (temporary)
2. **Error handling**: Add retry logic for transient failures
3. **Progress feedback**: Use `onQueueUpdate` for real-time progress
4. **Rate limiting**: Implement client-side queuing to avoid API limits
5. **Fallback**: Allow users to skip styling if processing fails
