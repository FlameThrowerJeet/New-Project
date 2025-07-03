@echo off
REM Batch file to set up AnimeGANv2 for anime-style image conversion

REM Set Python 3.8 path (no extra quotes)
set PY38=C:\Users\Namit\AppData\Local\Programs\Python\Python38\python.exe

REM Create and activate virtual environment
%PY38% -m venv AnimeGANv2\venv

REM Upgrade pip
AnimeGANv2\venv\Scripts\python.exe -m pip install --upgrade pip

REM Download and install torch 1.7.1 and torchvision 0.8.2 wheels for Windows + Python 3.8 + CPU
curl -L -o torch-1.7.1+cpu-cp38-cp38-win_amd64.whl https://download.pytorch.org/whl/cpu/torch-1.7.1%2Bcpu-cp38-cp38-win_amd64.whl
curl -L -o torchvision-0.8.2+cpu-cp38-cp38-win_amd64.whl https://download.pytorch.org/whl/cpu/torchvision-0.8.2%2Bcpu-cp38-cp38-win_amd64.whl
AnimeGANv2\venv\Scripts\python.exe -m pip install torch-1.7.1+cpu-cp38-cp38-win_amd64.whl torchvision-0.8.2+cpu-cp38-cp38-win_amd64.whl

REM Install tensorflow, pillow, numpy
AnimeGANv2\venv\Scripts\python.exe -m pip install tensorflow==1.15.0 pillow numpy

REM Download pre-trained AnimeGANv2 model (face_paint_512_v2)
cd AnimeGANv2
if not exist "checkpoint\face_paint_512_v2" mkdir checkpoint\face_paint_512_v2
curl -L -o checkpoint\face_paint_512_v2\generator_Hayao_weight.data-00000-of-00001 https://github.com/TachibanaYoshino/AnimeGANv2/releases/download/weights/generator_Hayao_weight.data-00000-of-00001
curl -L -o checkpoint\face_paint_512_v2\generator_Hayao_weight.index https://github.com/TachibanaYoshino/AnimeGANv2/releases/download/weights/generator_Hayao_weight.index
curl -L -o checkpoint\face_paint_512_v2\generator_Hayao_weight.meta https://github.com/TachibanaYoshino/AnimeGANv2/releases/download/weights/generator_Hayao_weight.meta
cd ..

REM Verify setup
AnimeGANv2\venv\Scripts\python.exe -c "import tensorflow as tf; print('TensorFlow version:', tf.__version__)"
AnimeGANv2\venv\Scripts\python.exe -c "import torch; print('Torch version:', torch.__version__)"

pause 