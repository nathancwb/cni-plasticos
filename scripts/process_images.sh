#!/bin/bash

# Configuration
ZIP_FILE="$HOME/Downloads/FOTOS PRODUTOS 3D.zip"
TMP_DIR="/tmp/cni_raw_images"
VARIANTS_DIR="$HOME/.gemini/antigravity/scratch/cni-plasticos-site/assets/images/products/variants"
MAX_SIZE=800

echo "🚀 Starting Automated Image Processing Workflow"

# 1. Clean and Setup temporary environment
echo "🧹 Cleaning up previous runs..."
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
mkdir -p "$VARIANTS_DIR"

# 2. Extract Archive
echo "📦 Extracting 1.4GB Archive (this might take a minute)..."
unzip -q "$ZIP_FILE" -d "$TMP_DIR"

BASE_SRC="$TMP_DIR/FOTOS PRODUTOS 3D"

# Function to slugify folder names
slugify() {
    echo "$1" | iconv -t ascii//TRANSLIT | sed -E 's/[^a-zA-Z0-9]+/-/g' | sed -E 's/^-+|-+$//g' | tr A-Z a-z
}

echo "⚙️ Processing Images..."

# Counter for tracking
TOTAL_PROCESSED=0

# Clean existing variants to avoid stale data
rm -rf "${VARIANTS_DIR:?}/"*

# Process each category (product folder)
while IFS= read -r -d '' category_path; do
    category_name=$(basename "$category_path")
    category_slug=$(slugify "$category_name")
    
    # Create the base variant slug directory
    category_out_dir="$VARIANTS_DIR/$category_slug"
    mkdir -p "$category_out_dir"
    
    echo "  > Processing Category: $category_name -> $category_slug"
    
    # Check for direct images in the category folder (some might not have sub-colors)
    find "$category_path" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | while IFS= read -r -d '' img_path; do
        img_name=$(basename "$img_path")
        img_slug=$(slugify "${img_name%.*}")
        
        # Output file mapping
        out_file="$category_out_dir/$img_slug.jpg"
        
        # Convert, Resize and Compress to JPG
        # Using built-in sips on MacOS. Resample to MAX_SIZE x MAX_SIZE maintaining aspect ratio
        sips -Z $MAX_SIZE -s format jpeg -s formatOptions 75 "$img_path" --out "$out_file" >/dev/null 2>&1
        TOTAL_PROCESSED=$((TOTAL_PROCESSED + 1))
    done
    
    # Now check for variant subfolders (colors)
    find "$category_path" -mindepth 1 -maxdepth 1 -type d -not -name "SHOPEE" -print0 | while IFS= read -r -d '' variant_path; do
        variant_name=$(basename "$variant_path")
        variant_slug=$(slugify "$variant_name")
        
        echo "    - Found Variant: $variant_name -> $variant_slug"
        
        # We'll put all variant images loosely inside the category_slug dir, but named with the variant prefix
        # e.g. variants/gancho-19cm/amarelo-1.jpg, variants/gancho-19cm/amarelo-2.jpg
        
        img_counter=1
        find "$variant_path" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | while IFS= read -r -d '' img_path; do
            out_file="$category_out_dir/${variant_slug}-${img_counter}.jpg"
            
            sips -Z $MAX_SIZE -s format jpeg -s formatOptions 75 "$img_path" --out "$out_file" >/dev/null 2>&1
            img_counter=$((img_counter + 1))
            TOTAL_PROCESSED=$((TOTAL_PROCESSED + 1))
        done
    done
    
done < <(find "$BASE_SRC" -mindepth 1 -maxdepth 1 -type d -print0)

echo "✅ Processed $TOTAL_PROCESSED images successfully!"
echo "🗑️ Cleaning up 2GB of temporary extracted files..."
rm -rf "$TMP_DIR"

echo "🎉 Done! New size: $(du -sh "$VARIANTS_DIR" | cut -f1)"
