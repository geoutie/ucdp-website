"""
UCDP Photo Resizer
==================
Run this script ONCE before uploading your photos to Netlify.
It automatically resizes all images in the photos/ folder so
pages load fast without you having to do anything manually.

HOW TO USE:
  1. Put all your photos into the correct photos/ subfolders
  2. Open a terminal in this folder (where this script is)
  3. Run:  python resize_photos.py
  4. Done! Then upload everything to Netlify as normal.

REQUIREMENTS:
  pip install Pillow

WHAT IT DOES:
  - Hero photos      → max 1600px wide  (large but sharp for carousel)
  - Project photos   → max 1000px wide  (sidebar + project pages)
  - About/team photos→ max 1000px wide
  - All others       → max 1200px wide
  - Converts to JPEG at 82% quality (great quality, small file)
  - Skips files already under 200KB (already small enough)
  - Never upscales a small image
  - Originals are kept in photos/originals/ as backup
"""

import os
import shutil
from pathlib import Path

try:
    from PIL import Image, ExifTags
except ImportError:
    print("❌  Pillow not installed. Run:  pip install Pillow")
    exit(1)

# ── SETTINGS ──────────────────────────────────────────────────────────────────
PHOTOS_DIR   = Path("photos")
BACKUP_DIR   = Path("photos/originals")
QUALITY      = 82          # JPEG quality (80–90 is the sweet spot)
SKIP_UNDER   = 200_000     # Skip files already under 200KB

SIZE_RULES = {
    "hero":         1600,
    "about":        1000,
    "team":         1000,
    "projects":     1000,
    "clinic":       1000,
    "kindergarten": 1000,
    "tailoring":    1000,
    "safe-house":   1000,
    "street-work":  1000,
    "sanitary-pads":1000,
    "relief-food":  1000,
    "school-sponsor":1000,
    "lobby-advocacy":1000,
    "research":     1000,
    "mobile-youth": 1000,
    "wkpi":         1000,
    "news":         1000,
}
DEFAULT_MAX = 1200
# ──────────────────────────────────────────────────────────────────────────────


def fix_rotation(img):
    """Respect EXIF orientation so photos aren't rotated wrongly."""
    try:
        for tag, val in img._getexif().items():
            if ExifTags.TAGS.get(tag) == "Orientation":
                ops = {3: 180, 6: 270, 8: 90}
                if val in ops:
                    img = img.rotate(ops[val], expand=True)
                break
    except Exception:
        pass
    return img


def get_max_width(folder_name):
    for key, size in SIZE_RULES.items():
        if key in folder_name.lower():
            return size
    return DEFAULT_MAX


def resize_image(src_path: Path, max_width: int):
    file_size = src_path.stat().st_size
    if file_size < SKIP_UNDER:
        print(f"  ⏭  Skipped (already small): {src_path.name}")
        return

    # Backup original
    backup_path = BACKUP_DIR / src_path.relative_to(PHOTOS_DIR)
    backup_path.parent.mkdir(parents=True, exist_ok=True)
    if not backup_path.exists():
        shutil.copy2(src_path, backup_path)

    img = Image.open(src_path)
    img = fix_rotation(img)

    # Convert RGBA/P to RGB for JPEG
    if img.mode in ("RGBA", "P", "LA"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    w, h = img.size
    if w > max_width:
        new_h = int(h * max_width / w)
        img = img.resize((max_width, new_h), Image.LANCZOS)
        print(f"  ✅  {src_path.name}: {w}×{h} → {max_width}×{new_h}  ({file_size//1024}KB → ", end="")
    else:
        print(f"  🔧  {src_path.name}: already fits ({w}px), re-saving compressed  ({file_size//1024}KB → ", end="")

    # Save as JPEG even if original was PNG
    out_path = src_path.with_suffix(".jpg")
    img.save(out_path, "JPEG", quality=QUALITY, optimize=True)
    new_size = out_path.stat().st_size
    print(f"{new_size//1024}KB)")

    # Remove original if it was a PNG (replaced by JPEG)
    if src_path.suffix.lower() in (".png", ".webp", ".bmp", ".tiff") and out_path != src_path:
        src_path.unlink()


def main():
    if not PHOTOS_DIR.exists():
        print("❌  photos/ folder not found. Run this script from the site root folder.")
        return

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\n🖼  UCDP Photo Resizer\n{'─'*40}")

    exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}
    total = 0

    for folder in sorted(PHOTOS_DIR.iterdir()):
        if not folder.is_dir() or folder.name == "originals":
            continue
        images = [f for f in folder.iterdir() if f.suffix.lower() in exts]
        if not images:
            continue
        max_w = get_max_width(folder.name)
        print(f"\n📁  {folder.name}/  (max {max_w}px wide)")
        for img_path in sorted(images):
            try:
                resize_image(img_path, max_w)
                total += 1
            except Exception as e:
                print(f"  ⚠️  Error on {img_path.name}: {e}")

    # Also handle images directly in photos/ (like about-home.jpg, about-story.jpg)
    print(f"\n📁  photos/  (root level, max {DEFAULT_MAX}px)")
    for img_path in sorted(PHOTOS_DIR.iterdir()):
        if img_path.is_file() and img_path.suffix.lower() in exts:
            try:
                resize_image(img_path, DEFAULT_MAX)
                total += 1
            except Exception as e:
                print(f"  ⚠️  Error on {img_path.name}: {e}")

    print(f"\n{'─'*40}")
    print(f"✅  Done! {total} photo(s) processed.")
    print(f"📦  Originals backed up to: photos/originals/")
    print(f"\nYou can now upload the site to Netlify.\n")


if __name__ == "__main__":
    main()
