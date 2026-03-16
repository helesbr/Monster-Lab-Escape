from PIL import Image
import os

# ============================================================
# CONFIGURATION — modifie seulement ces valeurs
# ============================================================

TILE_SIZE = 32  # Taille d'une tuile en pixels (32x32)
OUTPUT_FILE = "all_tilesets.png"  # Nom du fichier de sortie
DOSSIER = r"C:\Users\helia\OneDrive\Documents\EPF\2A\Monster Lab Escape\src\tilesets"

# ============================================================
# SCRIPT — détection automatique de tous les PNG du dossier
# ============================================================

def merge_tilesets(tile_size, output_file):
    tilesets = sorted([
        f for f in os.listdir(DOSSIER)
        if f.endswith(".png") and f != output_file
    ])

    if not tilesets:
        print("❌ Aucun fichier PNG trouvé dans ce dossier.")
        return

    print(f"🔍 {len(tilesets)} fichier(s) PNG détecté(s) :")

    images = []
    total_height = 0
    max_width = 0

    for filename in tilesets:
        filepath = os.path.join(DOSSIER, filename)
        img = Image.open(filepath).convert("RGBA")

        if img.width % tile_size != 0 or img.height % tile_size != 0:
            print(f"  ⚠️  {filename} ({img.width}x{img.height}px) — pas divisible par {tile_size}px, ignoré")
            continue

        print(f"  ✅ {filename} ({img.width}x{img.height}px — {img.width // tile_size}x{img.height // tile_size} tuiles)")
        images.append((filename, img))
        total_height += img.height
        max_width = max(max_width, img.width)

    if not images:
        print("❌ Aucun fichier valide à fusionner.")
        return

    # Crée une grande image vide transparente
    merged = Image.new("RGBA", (max_width, total_height), (0, 0, 0, 0))

    y_offset = 0
    for filename, img in images:
        merged.paste(img, (0, y_offset))
        y_offset += img.height

    output_path = os.path.join(DOSSIER, output_file)
    merged.save(output_path)

    print(f"\n✅ Fusion terminée !")
    print(f"📁 Fichier créé dans : {DOSSIER}")
    print(f"📐 Taille finale : {max_width}x{total_height}px")
    print(f"🎮 Total de tuiles : {max_width // tile_size} colonnes x {total_height // tile_size} lignes")
    print(f"\n💡 Dans Phaser, utilise :")
    print(f"   this.load.image('allTiles', 'src/tilesets/{output_file}');")

if __name__ == "__main__":
    merge_tilesets(TILE_SIZE, OUTPUT_FILE)
