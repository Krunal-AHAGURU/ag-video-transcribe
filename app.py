# from flask import Flask, render_template

# app = Flask(__name__)

# @app.route('/')
# def home():
#     return render_template('index.html')  # video URL is hardcoded in the template

# if __name__ == '__main__':
#     app.run(debug=True)

import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')  # your template

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # use Render's PORT or default to 5000 locally
    app.run(host='0.0.0.0', port=port)