from flask import Flask, request, jsonify, render_template
import pickle
import os
import numpy as np

app = Flask(__name__)

# Load pre-trained model
MODEL_PATH = 'model.p'
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Model file 'model.p' not found. Ensure it’s in the root directory.")
model_dict = pickle.load(open(MODEL_PATH, 'rb'))
model = model_dict['model']

labels_dict = {
    0: 'Hello', 1: 'Goodbye', 2: 'Thank you', 3: 'Please', 4: 'Help',
    5: 'Sorry', 6: 'Food', 7: 'Home', 8: 'Water', 9: 'Friend'
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json['landmarks']
        # Pad to match training data length (42 features: 21 landmarks * 2)
        max_length = 42
        if len(data) < max_length:
            data.extend([0] * (max_length - len(data)))
        prediction = model.predict([np.asarray(data)])
        result = labels_dict.get(int(prediction[0]), 'Unknown')
        return jsonify({'prediction': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
