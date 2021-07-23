#!/usr/bin/python3
# Author:   @AgbaD || @agba_dr3

from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_caching import Cache
from flask_sslify import SSLify
import jwt

from schema import validate_login, validate_reg, validate_user_db

from functools import wraps
from datetime import  datetime, timedelta

app = Flask(__name__)

# Configurations
app.config['SECRET_KEY'] = ''
app.config['MONGO_URI'] = 'mongodb+srv://asteroid:{password}@cluster0.ppcp1.mongodb.net/{database}?retryWrites=true&w=majority'\
    .format(password='asteroidpass', database="asteroiddb")
app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['SSL_DISABLE'] = False

cache = Cache()
mongo = PyMongo(app)
sslify = SSLify()
CORS(app)
cache.init_app(app)

workspaces = mongo.db.workspaces
users = mongo.db.users

if not app.debug and not app.testing and not app.config['SSL_DISABLE']:
    sslify.init_app(app)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({
                'status': 'error',
                'message': "Token is invalid"
            }), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = users.find_one({'public_id': data['public_id']})

        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': "Token is invalid"
            }), 401

        return f(current_user, *args, **kwargs)
    return decorated


@app.route('/login', methods=['POST'])
def login():
    if request.method == "POST":
        data = request.get_json()

        email = data['email']
        password = data['password']

        user_data = {
            "email": email,
            "password": password
        }

        schema = validate_login(user_data)
        if schema['msg'] == "error":
            return jsonify({
                'status': 'error',
                'message': schema['error']
            }), 402

        user = users.find_one({'email': email})
        if not user:
            return jsonify({
                'status': 'error',
                'message': "Invalid email or password."
            }), 402

        if check_password_hash(user['password', password]):
            token = jwt.encode({
                'public_id': user['public_id'],
                'exp': datetime.utcnow() + timedelta(minutes=30)
            }, app.config['SECRET_KEY'])

            return jsonify({
                'status': 'success',
                'message': "Login successful",
                'data': {
                    'token': token.decode('UTF-8')
                }
            })
        else:
            return jsonify({
                'status': 'error',
                'message': "Invalid email or password."
            }), 402







if __name__ == "__main__":
    app.run()
