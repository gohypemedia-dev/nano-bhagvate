import os
import math
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

def process_founder_image(input_path, output_path, card_output_path):
    # Load original image
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    print(f"Original image size: {w}x{h}")
    
    # 1. Target aspect ratio: 16:10 (1.6:1) - perfect for website hero card
    # We want to crop slightly if needed to frame nicely while preserving logo on left & Krishna on right
    target_ratio = 1.6
    
    # Calculate crop box
    # Original is 430x242 (ratio ~1.776). To get 1.6, we take full height 242 and width = 242 * 1.6 = 387.2
    target_w = int(h * target_ratio)
    if target_w < w:
        # Center crop horizontally with slight bias to keep Sadhvi Ji and logo balanced
        crop_left = (w - target_w) // 2
        crop_right = crop_left + target_w
        crop_top = 0
        crop_bottom = h
    else:
        crop_left = 0
        crop_right = w
        target_h = int(w / target_ratio)
        crop_top = (h - target_h) // 2
        crop_bottom = crop_top + target_h

    img_cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    
    # 2. High Quality Upscaling (to 1600x1000 for crisp high-dpi display)
    out_w, out_h = 1600, 1000
    img_scaled = img_cropped.resize((out_w, out_h), Image.Resampling.LANCZOS)
    
    # 3. Visual Enhancements:
    # - Warm soft tone adjustment
    # - Sharpness and clarity
    # - Subtle contrast
    # Convert to RGB for color adjustments
    rgb_img = img_scaled.convert("RGB")
    
    # Enhancers
    # Slight contrast boost (1.06)
    contrast_enhancer = ImageEnhance.Contrast(rgb_img)
    rgb_img = contrast_enhancer.enhance(1.06)
    
    # Slight sharpness boost (1.25)
    sharpness_enhancer = ImageEnhance.Sharpness(rgb_img)
    rgb_img = sharpness_enhancer.enhance(1.25)
    
    # Subtle brightness fine-tuning (1.02)
    brightness_enhancer = ImageEnhance.Brightness(rgb_img)
    rgb_img = brightness_enhancer.enhance(1.02)
    
    # Slight warm tone tuning via RGB channel adjustment (very subtle +2% red/yellow)
    r, g, b = rgb_img.split()
    r = r.point(lambda i: min(255, int(i * 1.02)))
    g = g.point(lambda i: min(255, int(i * 1.01)))
    rgb_img = Image.merge("RGB", (r, g, b))
    
    # Convert back to RGBA for gradient layer
    final_img = rgb_img.convert("RGBA")
    
    # 4. Add subtle dark gradient overlay at the bottom for website card text legibility
    gradient_overlay = Image.new("RGBA", (out_w, out_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(gradient_overlay)
    
    # Gradient starting from y = 55% down to 100%
    start_y = int(out_h * 0.52)
    for y in range(start_y, out_h):
        # Progress from 0 to 1
        progress = (y - start_y) / (out_h - start_y)
        # Smooth quadratic easing curve for seamless dark fade at bottom
        alpha = int(220 * (progress ** 1.8))
        draw.line([(0, y), (out_w, y)], fill=(20, 15, 12, alpha))

    # Also add a slight subtle left-bottom shadow vignette for lower-left text area
    for y in range(int(out_h * 0.6), out_h):
        for x in range(0, int(out_w * 0.6)):
            prog_y = (y - out_h * 0.6) / (out_h * 0.6)
            prog_x = 1.0 - (x / (out_w * 0.6))
            vignette_alpha = int(120 * (prog_y ** 1.5) * (prog_x ** 1.5))
            if vignette_alpha > 0:
                cur_pixel = gradient_overlay.getpixel((x, y))
                new_alpha = min(240, cur_pixel[3] + vignette_alpha)
                gradient_overlay.putpixel((x, y), (18, 12, 10, new_alpha))

    # Composite gradient onto the image
    final_card = Image.alpha_composite(final_img, gradient_overlay)

    # Save outputs
    # Save crisp JPEG
    final_card.convert("RGB").save(output_path, "JPEG", quality=96)
    print(f"Saved hero photo to {output_path}")

    # Also save PNG version if needed
    final_card.save(card_output_path, "PNG")
    print(f"Saved hero photo card to {card_output_path}")

if __name__ == "__main__":
    src = r"C:\Users\BUNNY\.gemini\antigravity-ide\brain\999d973f-43e7-4f74-9898-197424b40b52\.user_uploaded\media_1790849308198.png"
    out_jpg = r"c:\Users\BUNNY\OneDrive\Desktop\NAMOH BHAGWATE\namohbhagwate\public\images\founder.jpg"
    out_hero = r"c:\Users\BUNNY\OneDrive\Desktop\NAMOH BHAGWATE\namohbhagwate\public\images\founder-hero-card.jpg"
    process_founder_image(src, out_jpg, out_hero)
