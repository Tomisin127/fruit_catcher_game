import os
import shutil

# Path to the nested folder
nested_path = "/vercel/share/v0-project/Fruit Catcher Game"

# Remove the entire nested folder
if os.path.exists(nested_path):
    try:
        shutil.rmtree(nested_path)
        print(f"Successfully removed: {nested_path}")
    except Exception as e:
        print(f"Error removing folder: {e}")
else:
    print(f"Folder not found: {nested_path}")

print("Cleanup complete!")
