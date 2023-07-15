from os import makedirs
from os.path import join
import os

import eel
import torch as pt
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from matplotlib.animation import FuncAnimation, FFMpegWriter
from scipy.signal import welch
from flowtorch.data import CSVDataloader, mask_box
from flowtorch.analysis import SVD, DMD
import glob
import numpy as np
from vtktools import vtu

#设置eel路径
eel.init('')

plt.rcParams["figure.dpi"] = 160
output = "output"
makedirs(output, exist_ok=True)


desired_length = 9
# Get a list of all .vtu files in the directory
vtu_files = glob.glob(r"D:\PycharmPlace\bootstrap-project\VTU\*.vtu")

# Create a list to hold the scalar field data
pressure_data_list = []
vof_data_list = []

# Iterate over the list of .vtu files
for filename in vtu_files:
    # Get the base name of the file (excluding the path and extension)
    base_name = os.path.basename(filename)[:-4]  # remove the '.vtu' extension

    # Skip files whose base name does not have the desired length
    if len(base_name) != desired_length:
        continue
    # Create a vtu instance for the current file
    VTU = vtu(filename)

    # Get the scalar field data for the current file
    pressure_data = VTU.GetScalarField("P_G")
    vof_data = VTU.GetScalarField("EP_G")

    # Append the scalar field data to the list
    pressure_data_list.append(pressure_data)
    vof_data_list.append(vof_data)

# Convert the list of scalar field data arrays into a single NumPy array
pressure_data = np.array(pressure_data_list)
vof_data = np.array(vof_data_list)

vertices = VTU.GetCellCenters()

target = []
target.append(pt.tensor(pressure_data.transpose()))
target.append(pt.tensor(vof_data.transpose()))

# Print the shape of the tensor to confirm that it has the expected dimensions
print(target[1].shape)
print(target[0].shape)
print(vertices.shape)


n_points, n_times = target[0].shape[0], target[0].shape[1]

dm_1 = pt.zeros((n_points, n_times))
dm_2 = pt.zeros((n_points, n_times))

dm_1 = target[0] #pressure
dm_2 = target[1] #vof
x, y = vertices[:, 0], vertices[:, 1]  # get the x and y coordinates

# 1. Perform singular value decomposition (SVD)
# Assume 'dm_1' and 'n_times' are predefined

svd = SVD(dm_2, rank=1000)
print(svd)

from matplotlib.cm import ScalarMappable
b = 0
#创建方法，用eel进行修饰
@eel.expose
def plot_show(j):
    # 1. Set up the parameters for the plots
    n_plot = 3  # Number of subplots
    vmin_values = [-0.035, -0.06, -0.06]  # Lower bounds for colorbars
    vmax_values = [-0.01, 0.1, 0.1]  # Upper bounds for colorbars
    cbar_labels = ['Mode 1', 'Mode 2', 'Mode 3']  # Labels for the colorbars

    # 2. Create the figure and subplots
    fig, axarr = plt.subplots(1, n_plot, figsize=(11, 8), sharex=True, sharey=True)
    # 3. For each subplot, plot the corresponding mode from the SVD and add a colorbar
    b=j*3
    for i in range(n_plot):

        # Create a filled contour plot
        contour = axarr[i].tricontourf(x, y, svd.U[:, i+b], levels=50, cmap='jet', vmin=vmin_values[i], vmax=vmax_values[i])
        # Set the labels and aspect ratio for the subplot
        axarr[i].set_aspect('equal')
        axarr[i].tick_params(axis='y', labelsize=20)

        # Define the tick locations for the colorbar
        ticks = np.round(np.linspace(vmin_values[i], vmax_values[i], num=5), 3)
        # Create a colorbar for the contour plot
        cbar = plt.colorbar(ScalarMappable(norm=contour.norm, cmap=contour.cmap), ax=axarr[i], shrink=1.0, extend='both')
        # Set the tick labels for the colorbar
        cbar.set_ticks(ticks)
        cbar.ax.set_yticklabels(ticks, fontsize=18)

        # Add a label below the subplot
        axarr[i].text(0.5, -0.1, cbar_labels[i], transform=axarr[i].transAxes, ha='center', fontsize=20)

    # 4. Adjust the layout and display the plots
    plt.tight_layout()
    chart_file = 'plot.png'
    plt.savefig(chart_file, format='png')

    # 返回图表文件路径
    return chart_file

eel.start('index.html',mode='edge')
