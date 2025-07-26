import os
from PIL import Image, ImageFilter, ImageEnhance
import io
import base64

def apply_vietnamese_style(image_data: bytes, style: str) ->  dict:
    """
    Apply Vietnamese art style effects to an image using PIL
    """

    # Open the image
    image = Image.open(io.BytesIO(image_data))

    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
     # Apply style-specific effects
    if style == "lacquer":
        styled_image = apply_lacquer_style(image)
    elif style == "silk":
        styled_image = apply_silk_style(image)
    elif style == "dongho":
        styled_image = apply_dongho_style(image)
    else:
        styled_image = image
    
    # Convert back to bytes
    output_buffer = io.BytesIO()
    styled_image.save(output_buffer, format='JPEG', quality=90)
    output_bytes = output_buffer.getvalue()
    
    # Convert to base64 for frontend display
    output_base64 = base64.b64encode(output_bytes).decode('utf-8')
    
    return {
        "styled_image_base64": output_base64,
        "width": styled_image.width,
        "height": styled_image.height
    }

def apply_lacquer_style(image: Image.Image) -> Image.Image:
    """Apply lacquer painting effects: glossy, enhanced contrast, golden tint"""
    
    # Enhance contrast for that glossy look
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.3)
    
    # Enhance saturation
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.2)
    
    # Add slight blur then sharpen for layered effect
    image = image.filter(ImageFilter.GaussianBlur(0.5))
    image = image.filter(ImageFilter.SHARPEN)
    
    # Add golden tint overlay
    overlay = Image.new('RGB', image.size, (255, 215, 0))  # Gold color
    image = Image.blend(image, overlay, 0.1)  # 10% gold overlay
    
    return image


def apply_silk_style(image: Image.Image) -> Image.Image:
    """Apply silk painting effects: soft, watercolor-like, flowing"""
    
    # Reduce contrast for soft look
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(0.8)
    
    # Slight desaturation
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(0.9)
    
    # Apply gaussian blur for soft, flowing effect
    image = image.filter(ImageFilter.GaussianBlur(1.0))
    
    # Add slight blue tint for silk effect
    overlay = Image.new('RGB', image.size, (240, 248, 255))  # Alice blue
    image = Image.blend(image, overlay, 0.05)
    
    return image

def apply_dongho_style(image: Image.Image) -> Image.Image:
    """Apply Dong Ho folk art effects: bold colors, simplified forms"""
    
    # Increase contrast and saturation for bold effect
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.4)
    
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.5)
    
    # Apply edge enhancement to simulate woodblock printing
    image = image.filter(ImageFilter.EDGE_ENHANCE_MORE)
    
    # Posterize to reduce colors (simulate woodblock limitation)
    from PIL import ImageOps
    image = ImageOps.posterize(image, 4)  # Reduce to 16 colors per channel
    
    # Add slight red tint for traditional Vietnamese red
    overlay = Image.new('RGB', image.size, (218, 2, 14))  # Vietnamese red
    image = Image.blend(image, overlay, 0.08)
    
    return image