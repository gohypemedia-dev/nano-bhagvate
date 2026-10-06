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
    
    # 4. Pure clean image without heavy dark overlays (HTML/CSS will handle subtle text legibility gradient)
    final_card = rgb_img

    # Save outputs
    # Save crisp JPEG
    final_card.convert("RGB").save(output_path, "JPEG", quality=96)
    print(f"Saved hero photo to {output_path}")

    # Also save PNG version if needed
    final_card.save(card_output_path, "PNG")
    print(f"Saved hero photo card to {card_output_path}")

if __name__ == "__main__":
    src = r"C:\Users\BUNNY\.gemini\antigravity-ide\brain\de2e4cb6-590f-43b8-b06b-c57700313d3d\.user_uploaded\media_1791268733986.jpg"
    out_jpg = r"c:\Users\BUNNY\OneDrive\Desktop\NAMOH BHAGWATE\namohbhagwate\public\images\founder.jpg"
    out_hero = r"c:\Users\BUNNY\OneDrive\Desktop\NAMOH BHAGWATE\namohbhagwate\public\images\founder-hero-card.jpg"
    process_founder_image(src, out_jpg, out_hero)
