from flask import Flask, request, jsonify, render_template, redirect, url_for
import base64
import cv2
import numpy as np
import mediapipe as mp
import pickle

app = Flask(__name__, static_folder='static', template_folder='templates')

try:
    with open('model.p', 'rb') as f:
        model_data = pickle.load(f)
        model = model_data['model']
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)

labels_dict = {
    0: {'en': 'Hello', 'ta': 'வணக்கம்'},
    1: {'en': 'Goodbye', 'ta': 'விடைபெறுகிறேன்'},
    2: {'en': 'Thank you', 'ta': 'நன்றி'},
    3: {'en': 'Please', 'ta': 'தயவுசெய்து'},
    4: {'en': 'Help', 'ta': 'உதவி'},
    5: {'en': 'Sorry', 'ta': 'மன்னிக்கவும்'},
    6: {'en': 'Food', 'ta': 'உணவு'},
    7: {'en': 'Home', 'ta': 'வீடு'},
    8: {'en': 'Water', 'ta': 'தண்ணீர்'},
    9: {'en': 'Friend', 'ta': 'நண்பர்'}
}

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.3)

@app.route('/')
def auth():
    return render_template('auth.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Get language from request, default to 'en' (English)
        language = data.get('language', 'ta')  # 'en' for English, 'ta' for Tamil

        encoded_image = data['image'].split(',')[1]
        img_data = base64.b64decode(encoded_image)
        np_arr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400

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

        prediction = model.predict([np.asarray(dataAux)])
        prediction_idx = int(prediction[0])
        prediction_label = labels_dict.get(prediction_idx, {'en': 'Unknown', 'ta': 'Unknown'})[language]
        print(f"Predicted: {prediction_label} (Language: {language})")
        return jsonify({'prediction': prediction_label})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
