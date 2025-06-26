import json
import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter
import argparse
import os

def create_heatmap_plot(json_file_path, output_png_path, sigma=15):
    """
    Loads a heatmap from a JSON file, applies Gaussian smoothing,
    and saves it as a PNG image.

    Args:
        json_file_path (str): Path to the input JSON heatmap file.
        output_png_path (str): Path to save the output PNG image.
        sigma (float): Standard deviation for Gaussian filter, controlling smoothing.
                       Higher value means more smoothing.
    """
    try:
        with open(json_file_path, 'r') as f:
            heatmap_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: JSON file not found at '{json_file_path}'")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{json_file_path}'. Is it a valid JSON file?")
        return

    if not heatmap_data or not isinstance(heatmap_data, list) or not all(isinstance(row, list) for row in heatmap_data):
        print("Error: Invalid heatmap data format. Expected a list of lists.")
        print("Please ensure the JSON file contains a 2D array (e.g., [[0, 100, 0], [0, 0, 200]]).")
        return

    # Convert list of lists to a NumPy array
    np_heatmap = np.array(heatmap_data, dtype=float)

    # Apply Gaussian smoothing
    # 'mode=constant' with cval=0.0 handles boundaries by padding with zeros,
    # which is suitable for spreading values from sparse points.
    smoothed_heatmap = gaussian_filter(np_heatmap, sigma=sigma, mode='constant', cval=0.0)

    # Determine min/max for color scaling.
    # We set vmin to 0 as time cannot be negative.
    # vmax is set to the maximum value found in the smoothed heatmap.
    max_val = np.max(smoothed_heatmap)
    if max_val == 0:
        print("Warning: Heatmap contains only zero values after smoothing (or no Waldo finds were recorded).")
        print("No meaningful plot can be generated. Please ensure your JSON has non-zero time values.")
        return

    # Plotting
    # Adjust figure size based on heatmap dimensions for better aspect ratio
    height, width = smoothed_heatmap.shape
    # A common aspect ratio for screens is 16:9 or 4:3. Let's aim for a reasonable size.
    # Scale figure size based on image dimensions, with a base size.
    base_width = 12
    base_height = base_width * (height / width) if width > 0 else base_width * (3/4) # Default to 4:3 if width is 0
    plt.figure(figsize=(base_width, base_height))
    
    # Use 'plasma_r' colormap: bright for low values (fast times), dark for high values (slow times).
    # 'origin='upper'' ensures that the (0,0) coordinate is at the top-left, matching image conventions.
    # 'interpolation='bilinear'' provides a smooth visual representation of the smoothed data.
    plt.imshow(smoothed_heatmap, cmap='plasma_r', origin='upper', vmin=0, vmax=max_val, interpolation='bilinear')
    
    plt.colorbar(label='Average Time to Find Waldo (ms)')
    plt.title(f'Waldo Field of Vision Heatmap (Smoothed with $\sigma={sigma}$)')
    plt.xlabel('X Coordinate (pixels)')
    plt.ylabel('Y Coordinate (pixels)')
    
    # Ensure the output directory exists
    output_dir = os.path.dirname(output_png_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    plt.tight_layout() # Adjust layout to prevent labels from overlapping
    plt.savefig(output_png_path, dpi=300) # Save with high DPI for better quality
    print(f"Heatmap saved successfully to '{output_png_path}'")
    plt.close() # Close the plot to free memory

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="Generate a smoothed heatmap plot from Waldo 'field of vision' JSON data.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        'input_json',
        type=str,
        help="Path to the input JSON heatmap file (e.g., waldo_field_of_vision_heatmap.json)."
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='waldo_heatmap.png',
        help="Path to save the output PNG image. Default: waldo_heatmap.png"
    )
    parser.add_argument(
        '--sigma', '-s',
        type=float,
        default=15,
        help="Standard deviation for Gaussian smoothing filter.\n"
             "Higher value means more smoothing (e.g., 5 for light, 15 for medium, 30 for heavy).\n"
             "Default: 15."
    )

    args = parser.parse_args()

    create_heatmap_plot(args.input_json, args.output, args.sigma)
