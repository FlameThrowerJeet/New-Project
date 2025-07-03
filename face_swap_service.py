import tempfile
import os
from flask import Flask, request, send_file, jsonify

try:
    from facefusion import fusion  # type: ignore
except ImportError:
    fusion = None  # type: ignore
    print("[FaceSwapPy] facefusion not installed – swap endpoint will return 501. Run 'pip install facefusion onnxruntime opencv-python pillow flask' to enable.")

app = Flask(__name__)

@app.route('/swap', methods=['POST'])
def swap():
    if 'base' not in request.files or 'face' not in request.files:
        return jsonify({'error': 'Both base and face images are required'}), 400

    base_file = request.files['base']
    face_file = request.files['face']

    if fusion is None:
        return jsonify({'error': 'Face-swap service unavailable. Install facefusion to enable.'}), 501

    with tempfile.TemporaryDirectory() as temp_dir:
        base_path = os.path.join(temp_dir, 'base.png')
        face_path = os.path.join(temp_dir, 'face.png')
        out_path = os.path.join(temp_dir, 'out.png')

        base_file.save(base_path)
        face_file.save(face_path)

        # Perform face swap
        try:
            fusion.swap_faces(base_path, face_path, out_path, upscale=False, keep_eyes=True)
        except Exception as err:
            return jsonify({'error': str(err)}), 500

        return send_file(out_path, mimetype='image/png')

if __name__ == '__main__':
    # Listen only on localhost for security; change if remote access required
    app.run(host='127.0.0.1', port=5005) 