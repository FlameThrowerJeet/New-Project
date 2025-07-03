#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AnimeGANv2 Batch Processor for Miina Images (FIXED VERSION)
Processes all Miina images and generates anime versions using local AnimeGANv2

FIXES APPLIED:
- Fixed import paths and TensorFlow compatibility  
- Proper error handling and dependency checking
- Correct subprocess calls to AnimeGANv2
- Improved path handling and cleanup
- UTF-8 encoding support
"""

import os
import sys
import json
import time
import shutil
import subprocess
from pathlib import Path
import argparse
from datetime import datetime

def check_dependencies():
    """Check if all required dependencies are installed"""
    missing_deps = []
    
    try:
        import cv2
        print("✅ OpenCV found")
    except ImportError:
        missing_deps.append("opencv-python")
    
    try:
        import numpy as np
        print("✅ NumPy found")
    except ImportError:
        missing_deps.append("numpy")
    
    try:
        from tqdm import tqdm
        print("✅ tqdm found")
    except ImportError:
        missing_deps.append("tqdm")
    
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow found: {tf.__version__}")
        if tf.__version__.startswith('2.'):
            print("⚠️ TensorFlow 2.x detected. AnimeGANv2 requires TensorFlow 1.15.x")
            print("💡 Run: pip install tensorflow==1.15.0")
    except ImportError:
        missing_deps.append("tensorflow==1.15.0")
    
    if missing_deps:
        print(f"❌ Missing: {', '.join(missing_deps)}")
        print(f"📦 Install: pip install {' '.join(missing_deps)}")
        return False
    
    return True

class MiinaAnimeProcessor:
    def __init__(self):
        self.input_dir = Path("client/Miina - Pics")
        self.output_dir = Path("client/public/images/miina-ai-generated")
        self.animeganv2_dir = Path("AnimeGANv2")
        self.checkpoint_dir = self.animeganv2_dir / "checkpoint"
        self.temp_dir = Path("temp_anime_processing")
        
        self.styles = {
            'hayao': 'generator_Hayao_weight',
            'shinkai': 'generator_Shinkai_weight',
            'paprika': 'generator_Paprika_weight'
        }
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"🎨 Miina Anime Processor (FIXED)")
        print(f"📁 Input: {self.input_dir}")
        print(f"📁 Output: {self.output_dir}")

    def validate_setup(self):
        """Validate AnimeGANv2 setup"""
        if not self.animeganv2_dir.exists():
            raise Exception(f"AnimeGANv2 not found: {self.animeganv2_dir}")
        
        if not (self.animeganv2_dir / "test.py").exists():
            raise Exception("AnimeGANv2 test.py not found")
        
        if not self.input_dir.exists():
            raise Exception(f"Miina images not found: {self.input_dir}")
        
        print("✅ Setup validation passed")

    def check_checkpoint(self, style='hayao'):
        """Check if checkpoint exists"""
        checkpoint_path = self.checkpoint_dir / self.styles[style]
        
        if not checkpoint_path.exists():
            print(f"❌ Checkpoint missing: {checkpoint_path}")
            print(f"📥 Download from: https://github.com/TachibanaYoshino/AnimeGANv2/releases")
            return False
        
        print(f"✅ {style} checkpoint found")
        return True

    def get_miina_images(self, max_images=None):
        """Get Miina images to process"""
        extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']
        image_files = []
        
        for ext in extensions:
            image_files.extend(list(self.input_dir.glob(ext)))
        
        if max_images and len(image_files) > max_images:
            image_files = image_files[:max_images]
        
        print(f"📸 Found {len(image_files)} images")
        return image_files

    def process_single_image(self, image_path, style='hayao'):
        """Process single image with AnimeGANv2"""
        try:
            style_temp_dir = self.temp_dir / style
            style_temp_dir.mkdir(parents=True, exist_ok=True)
            
            temp_image = style_temp_dir / image_path.name
            shutil.copy2(image_path, temp_image)
            
            checkpoint_path = self.checkpoint_dir / self.styles[style]
            result_dir = f"results_{style}"
            
            original_dir = os.getcwd()
            os.chdir(self.animeganv2_dir)
            
            try:
                cmd = [
                    sys.executable, "test.py",
                    "--checkpoint_dir", str(checkpoint_path),
                    "--test_dir", str(style_temp_dir),
                    "--save_dir", result_dir,
                    "--if_adjust_brightness", "True"
                ]
                
                print(f"🔄 Processing: {image_path.name}")
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    results_path = self.animeganv2_dir / "results" / result_dir
                    generated_files = list(results_path.glob("*"))
                    
                    if generated_files:
                        generated_file = generated_files[0]
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        output_filename = f"miina_anime_{style}_{image_path.stem}_{timestamp}.jpg"
                        output_path = self.output_dir / output_filename
                        
                        shutil.move(str(generated_file), str(output_path))
                        
                        if results_path.exists():
                            shutil.rmtree(results_path, ignore_errors=True)
                        
                        return {
                            'original': image_path.name,
                            'generated': output_filename,
                            'style': style,
                            'timestamp': timestamp,
                            'path': str(output_path),
                            'success': True
                        }
                else:
                    print(f"❌ Process failed: {result.stderr}")
                
            finally:
                os.chdir(original_dir)
                if temp_image.exists():
                    temp_image.unlink()
            
            return None
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

    def process_batch(self, style='hayao', max_images=5):
        """Process batch of images"""
        print(f"🚀 Processing with {style} style...")
        
        try:
            self.validate_setup()
            if not self.check_checkpoint(style):
                return []
        except Exception as e:
            print(f"❌ Setup failed: {e}")
            return []
        
        image_files = self.get_miina_images(max_images)
        if not image_files:
            print("❌ No images found")
            return []
        
        results = []
        successful = 0
        
        for i, image_path in enumerate(image_files):
            print(f"\n🎨 [{i+1}/{len(image_files)}] {image_path.name}")
            
            result = self.process_single_image(image_path, style)
            
            if result and result.get('success'):
                results.append(result)
                successful += 1
                print(f"✅ Generated: {result['generated']}")
            else:
                results.append({
                    'original': image_path.name,
                    'generated': None,
                    'error': 'Processing failed',
                    'success': False
                })
            
            time.sleep(0.5)
        
        print(f"\n🎉 Completed! Success: {successful}/{len(image_files)}")
        
        if self.temp_dir.exists():
            shutil.rmtree(self.temp_dir, ignore_errors=True)
        
        return results

    def create_manifest(self, results, style='hayao'):
        """Create manifest for web interface"""
        successful_results = [r for r in results if r.get('success')]
        
        manifest = {
            'generated': datetime.now().isoformat(),
            'style': style,
            'total_processed': len(results),
            'successful': len(successful_results),
            'success_rate': f"{len(successful_results)/len(results)*100:.1f}%" if results else "0%",
            'images': successful_results
        }
        
        manifest_path = self.output_dir / f'miina-{style}-manifest.json'
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        
        main_manifest_path = self.output_dir / 'miina-ai-manifest.json'
        
        try:
            with open(main_manifest_path, 'r', encoding='utf-8') as f:
                main_manifest = json.load(f)
            
            if 'styles' not in main_manifest:
                main_manifest['styles'] = {}
            
            main_manifest['styles'][style] = manifest
            main_manifest['last_updated'] = datetime.now().isoformat()
            
        except (FileNotFoundError, json.JSONDecodeError):
            main_manifest = {
                'last_updated': datetime.now().isoformat(),
                'styles': {style: manifest}
            }
        
        with open(main_manifest_path, 'w', encoding='utf-8') as f:
            json.dump(main_manifest, f, indent=2, ensure_ascii=False)
        
        print(f"📋 Manifests saved: {manifest_path}")
        return manifest_path

def main():
    parser = argparse.ArgumentParser(description="AnimeGANv2 Miina Processor (FIXED)")
    parser.add_argument('--style', choices=['hayao', 'shinkai', 'paprika'], 
                       default='hayao', help='Anime style')
    parser.add_argument('--max-images', type=int, default=5, 
                       help='Max images to process')
    parser.add_argument('--check-only', action='store_true',
                       help='Only validate setup')
    
    args = parser.parse_args()
    
    print("🎨 ANIMEGANV2 MIINA PROCESSOR (FIXED)")
    print("=" * 40)
    
    if not check_dependencies():
        return 1
    
    try:
        processor = MiinaAnimeProcessor()
        
        if args.check_only:
            processor.validate_setup()
            for style in processor.styles.keys():
                processor.check_checkpoint(style)
            print("\n✅ Setup check complete!")
            return 0
        
        results = processor.process_batch(style=args.style, max_images=args.max_images)
        
        if results:
            processor.create_manifest(results, args.style)
            successful_count = len([r for r in results if r.get('success')])
            
            print(f"\n🎉 PROCESSING COMPLETE!")
            print(f"📊 Processed: {len(results)}")
            print(f"✅ Successful: {successful_count}")
            print(f"🌐 Images in: {processor.output_dir}")
            print(f"💡 View in web interface Images section!")
        else:
            print(f"\n❌ No images processed successfully")
            print(f"💡 Try --check-only to validate setup")
            return 1
        
    except KeyboardInterrupt:
        print(f"\n⚠️ Interrupted by user")
        return 1
    except Exception as e:
        print(f"💥 Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
