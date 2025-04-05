from flask import Flask, request, jsonify, render_template
import base64
import cv2
import numpy as np
import mediapipe as mp
import pickle
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

#Loading
with open('model.p', 'rb') as f:
    model_data = pickle.load(f)
    model = model_data['model']
    
labels_dict = {
    0: 'Hello', 1: 'Goodbye', 2: 'Thank you', 3: 'Please', 4: 'Help',
    5: 'Sorry', 6: 'Food', 7: 'Home', 8: 'Water', 9: 'Friend'
}

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.3)
mp_drawing = mp.solutions.drawing_utils

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        encoded_image = data['image'].split(',')[1]
        img_data = base64.b64decode(encoded_image)
        np_arr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        results = hands.process(image_rgb)
        if not results.multi_hand_landmarks:
            return jsonify({'prediction': 'No hand detected'})

        landmarks = results.multi_hand_landmarks[0]
        x = [lm.x for lm in landmarks.landmark]
        y = [lm.y for lm in landmarks.landmark]
        minX, minY = min(x), min(y)

        dataAux = []
        for lm in landmarks.landmark:
            dataAux.append(lm.x - minX)
            dataAux.append(lm.y - minY)

        prediction_index = model.predict([dataAux])[0]
        prediction_label = labels_dict.get(prediction_index, "Unknown")

        return jsonify({'prediction': prediction_label})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
