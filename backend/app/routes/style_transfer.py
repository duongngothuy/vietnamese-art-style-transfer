# backend/app/routes/style_transfer.py

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import os
from PIL import Image, ImageFilter, ImageEnhance, ImageOps
import io
import base64
import cv2
import numpy as np

# Create router for style transfer endpoints
router = APIRouter()

# Directory to save uploaded images temporarily
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Style descriptions
style_descriptions = {
    "lacquer": {
        "name": "Vietnamese Lacquer Painting",
        "characteristics": "Glossy surface, gold/silver inlays, layered texture",
        "processing_notes": "Applying lacquer effects with metallic highlights"
    },
    "silk": {
        "name": "Vietnamese Silk Painting", 
        "characteristics": "Soft brushstrokes, delicate colors, flowing transitions",
        "processing_notes": "Converting to silk painting style with watercolor effects"
    },
    "dongho": {
        "name": "Dong Ho Folk Prints",
        "characteristics": "Bold colors, geometric patterns, woodblock print style", 
        "processing_notes": "Applying traditional folk art patterns and bold color palette"
    }
}

def apply_vietnamese_style(image_data: bytes, style: str, crop_analysis: dict = None) -> dict:
    """Apply Vietnamese art style effects to an image using PIL"""
    
    # Open the image
    image = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Apply smart crop if detected
    if crop_analysis and crop_analysis.get("crop_detected"):
        image = apply_smart_crop(image, crop_analysis)
    
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

def smart_crop_image(image_data: bytes) -> dict:
    """Use AI to detect faces/objects and suggest optimal crop"""
    
    # Convert to OpenCV format
    nparr = np.frombuffer(image_data, np.uint8)
    cv_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    height, width = cv_image.shape[:2]
    
    # Try face detection first
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) > 0:
        # Focus on largest face
        largest_face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h = largest_face
        
        # Expand crop area around face (40% margin)
        margin = 0.4
        x1 = max(0, int(x - w * margin))
        y1 = max(0, int(y - h * margin))
        x2 = min(width, int(x + w * (1 + margin)))
        y2 = min(height, int(y + h * (1 + margin)))
        
        return {
            "crop_detected": True,
            "detection_type": "face",
            "confidence": 0.85,
            "crop_box": [x1, y1, x2, y2],
            "recommendation": "Face detected - cropping to portrait format for optimal art style"
        }
    
    # Fallback: Center crop using rule of thirds
    edges = cv2.Canny(gray, 50, 150)
    
    # Divide into 3x3 grid and find region with most edges
    grid_regions = []
    for i in range(3):
        for j in range(3):
            y1 = height * i // 3
            y2 = height * (i + 1) // 3
            x1 = width * j // 3
            x2 = width * (j + 1) // 3
            
            region_edges = edges[y1:y2, x1:x2]
            edge_density = np.sum(region_edges) / (region_edges.size * 255)
            grid_regions.append((edge_density, (x1, y1, x2, y2)))
    
    # Find region with highest edge density
    best_region = max(grid_regions, key=lambda x: x[0])
    edge_density, (x1, y1, x2, y2) = best_region
    
    # Expand crop area around interesting region
    center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
    crop_size = min(width, height) // 2
    
    crop_x1 = max(0, center_x - crop_size)
    crop_y1 = max(0, center_y - crop_size)
    crop_x2 = min(width, center_x + crop_size)
    crop_y2 = min(height, center_y + crop_size)
    
    return {
        "crop_detected": True,
        "detection_type": "edge_analysis",
        "confidence": min(0.7, edge_density * 2),
        "crop_box": [crop_x1, crop_y1, crop_x2, crop_y2],
        "recommendation": "Smart crop based on image composition analysis"
    }

def apply_smart_crop(image: Image.Image, crop_info: dict) -> Image.Image:
    """Apply the AI-suggested crop"""
    if crop_info["crop_detected"]:
        x1, y1, x2, y2 = crop_info["crop_box"]
        return image.crop((x1, y1, x2, y2))
    return image
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
    image = ImageOps.posterize(image, 4)  # Reduce to 16 colors per channel
    
    # Add slight red tint for traditional Vietnamese red
    overlay = Image.new('RGB', image.size, (218, 2, 14))  # Vietnamese red
    image = Image.blend(image, overlay, 0.08)
    
    return image

@router.post("/api/style-transfer")
async def style_transfer(
    image: UploadFile = File(...),
    style: str = Form(...)
):
    """Process an uploaded image with the selected Vietnamese art style"""
    
    # Validate file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate style selection
    valid_styles = ["lacquer", "silk", "dongho"]
    if style not in valid_styles:
        raise HTTPException(status_code=400, detail=f"Style must be one of: {valid_styles}")
    
    try:
        # Read the uploaded image
        image_data = await image.read()
        
        # Open with PIL to validate and get info
        pil_image = Image.open(io.BytesIO(image_data))
        
        # Get image information
        image_info = {
            "filename": image.filename,
            "size": pil_image.size,  # (width, height)
            "format": pil_image.format,
            "mode": pil_image.mode,  # RGB, RGBA, etc.
            "file_size_bytes": len(image_data)
        }
        
        print(f"Processing {image.filename} with {style} style...")
        
        # AI Smart Crop Analysis
        try:
            crop_analysis = smart_crop_image(image_data)
            print(f"Smart crop: {crop_analysis['detection_type']} detected with {crop_analysis['confidence']:.2f} confidence")
        except Exception as crop_error:
            print(f"Smart crop failed: {crop_error}")
            crop_analysis = {"crop_detected": False}
        
        # Apply actual style transfer
        try:
            style_result = apply_vietnamese_style(image_data, style, crop_analysis)
            print(f"Style processing successful! Base64 length: {len(style_result['styled_image_base64'])}")
        except Exception as style_error:
            print(f"Style processing error: {style_error}")
            raise HTTPException(status_code=500, detail=f"Style processing failed: {str(style_error)}")
        
        # Return response with styled image
        response_data = {
            "success": True,
            "message": f"Successfully processed image with {style} style",
            "original_image": image_info,
            "selected_style": style_descriptions[style],
            "styled_image": style_result,
            "smart_crop": crop_analysis,
            "processing_status": "completed",
            "cultural_context": get_cultural_context(style)
        }
        
        print("Response prepared successfully!")
        return JSONResponse(content=response_data, status_code=200)
        
    except Exception as e:
        print(f"General error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

def get_cultural_context(style: str) -> dict:
    """Provide cultural context for each Vietnamese art style"""
    contexts = {
        "lacquer": {
            "origin": "Traditional Vietnamese lacquer art dates back over 1000 years",
            "technique": "Made from resin of indigenous lacquer trees, often decorated with gold/silver",
            "significance": "Represents luxury and refinement in Vietnamese court art",
            "modern_use": "Still practiced today, popular in contemporary Vietnamese art"
        },
        "silk": {
            "origin": "Developed during French colonial period, blending Eastern and Western techniques",
            "technique": "Painted on silk canvas with special dyes that create flowing effects",
            "significance": "Captures the delicate beauty of Vietnamese landscapes and nature",
            "modern_use": "Popular among tourists and collectors worldwide"
        },
        "dongho": {
            "origin": "From Dong Ho village, dating back to 16th century",
            "technique": "Hand-carved woodblocks with natural pigments from plants and minerals",
            "significance": "Folk art celebrating Vietnamese festivals, especially Tet New Year",
            "modern_use": "UNESCO recognized intangible cultural heritage"
        }
    }
    
    return contexts.get(style, {})