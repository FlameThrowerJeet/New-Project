from flask import Flask, Response, render_template_string
import cv2
import threading
import time
import numpy as np

app = Flask(__name__)

# Global variable to store the camera
camera = None
frame_buffer = None

def get_camera():
    global camera
    if camera is None:
        # Try to open OBS Virtual Camera
        camera = cv2.VideoCapture(0)  # Usually OBS Virtual Camera is at index 0
        if not camera.isOpened():
            # Try different indices
            for i in range(10):
                camera = cv2.VideoCapture(i)
                if camera.isOpened():
                    break
    return camera

def generate_frames():
    global frame_buffer
    while True:
        cam = get_camera()
        if cam is None or not cam.isOpened():
            # Create a black frame if camera not available
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(frame, "OBS Virtual Camera Not Found", (50, 240), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        else:
            success, frame = cam.read()
            if not success:
                continue
        
        # Encode frame to JPEG
        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ret:
            continue
        
        frame_buffer = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_buffer + b'\r\n')
        
        time.sleep(0.033)  # ~30 FPS

@app.route('/')
def index():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>OBS Virtual Camera Stream</title>
        <style>
            body { margin: 0; background: #000; }
            img { width: 100%; height: 100vh; object-fit: cover; }
        </style>
    </head>
    <body>
        <img src="/video_feed" alt="OBS Stream">
    </body>
    </html>
    ''')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    print("Starting OBS Stream Server...")
    print("Make sure OBS Virtual Camera is running!")
    app.run(host='0.0.0.0', port=8080, debug=False) 