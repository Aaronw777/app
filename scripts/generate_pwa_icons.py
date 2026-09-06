"""Generates PWA icons for Court Mastery into /app/frontend/public/."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path("/app/frontend/public")

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
]


def load_font(size):
    for p in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(p, size=size)
        except (IOError, OSError):
            continue
    return ImageFont.load_default()


def draw_icon(size, out, maskable=False):
    # Solid gold background
    img = Image.new("RGB", (size, size), (255, 205, 0))
    d = ImageDraw.Draw(img)

    # Bottom black bar (accent stripe)
    stripe_h = int(size * 0.16)
    d.rectangle([0, size - stripe_h, size, size], fill=(13, 13, 13))

    # Basketball line-art in bottom stripe (small circle + lines)
    ball_r = int(stripe_h * 0.34)
    ball_cx = int(size * 0.86)
    ball_cy = size - stripe_h // 2
    d.ellipse(
        [ball_cx - ball_r, ball_cy - ball_r, ball_cx + ball_r, ball_cy + ball_r],
        outline=(255, 205, 0),
        width=max(2, size // 128),
    )
    d.line([(ball_cx - ball_r, ball_cy), (ball_cx + ball_r, ball_cy)], fill=(255, 205, 0), width=max(2, size // 160))
    d.line([(ball_cx, ball_cy - ball_r), (ball_cx, ball_cy + ball_r)], fill=(255, 205, 0), width=max(2, size // 160))

    # "CM" wordmark centred in the gold area
    text = "CM"
    # Safe-zone padding: 10% for maskable icons, 4% otherwise
    safe = 0.15 if maskable else 0.05
    max_h = int(size * (0.68 - safe))
    # Pick font that fits
    font = load_font(int(max_h))
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0]
    ty = int(size * 0.05) if maskable else int(size * 0.03)
    d.text((tx, ty), text, fill=(13, 13, 13), font=font)

    img.save(out, "PNG")
    print(f"Wrote {out} ({size}x{size})")


if __name__ == "__main__":
    draw_icon(192, OUT / "icon-192.png")
    draw_icon(512, OUT / "icon-512.png")
    draw_icon(512, OUT / "icon-512-maskable.png", maskable=True)
    draw_icon(180, OUT / "apple-touch-icon.png")
    draw_icon(32, OUT / "favicon-32.png")
