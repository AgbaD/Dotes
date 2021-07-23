#!/usr/bin/python3
# Author:   @AgbaD || @agba_dr3

from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_sslify import SSLify
import jwt

from schema import validate_login, validate_reg, validate_user_db

import uuid
from functools import wraps
from datetime import  datetime, timedelta

app = Flask(__name__)

# Configurations
app.config['SECRET_KEY'] = ''
app.config['MONGO_URI'] = 'mongodb+srv://asteroid:{password}@cluster0.ppcp1.mongodb.net/{database}?retryWrites=true&w=majority'\
    .format(password='asteroidpass', database="asteroiddb")
app.config['SSL_DISABLE'] = False

mongo = PyMongo(app)
sslify = SSLify()
CORS(app)

workspaces = mongo.db.workspaces
users = mongo.db.users

if not app.debug and not app.testing and not app.config['SSL_DISABLE']:
    sslify.init_app(app)


def token_optional(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'x-access_token' in request.headers:
            token = request.headers['x-access_token']

        if not token:
            return f(user=None, *args, **kwargs)

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            user = users.find_one({'public_id': data['public_id']})
            if user:
                return f(user=user, *args, **kwargs)
            return f(user=None, *args, **kwargs)
        except Exception:
            return f(user=None, *args, **kwargs)
    return decorated


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
        try:
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

            if check_password_hash(user['password'], password):
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
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': e
            }), 402
    else:
        return jsonify({
            'status': 'error',
            'message': "Endpoint does not support GET requests"
        }), 402


@app.route('/register', methods=['POST'])
@token_optional
def register(user):
    if request.method == "POST":
        try:
            data = request.get_json()

            email = data['email']
            password = data['password']
            repeat_password = data['repeat_password']
            fullname = data['fullname']
            workspace = data['workspace']

            if user:
                if not user['is_admin']:
                    return jsonify({
                        'status': 'error',
                        'message': 'Forbidden for users without full privileges'
                    }), 403

            # to be removed later
            if users.find_one({'email': email}):
                return jsonify({
                    'status': 'error',
                    'message': 'Email has been used'
                }), 401

            if password != repeat_password:
                return jsonify({
                    'status': 'error',
                    'message': 'Passwords do not match'
                }), 401

            info = {
                "fullname": fullname,
                "email": email,
                "password": password,
                "workspace": workspace
            }

            schema = validate_reg(info)
            if schema['msg'] != "success":
                return jsonify({
                    'status': 'error',
                    'message': schema['error']
                }), 401

            if workspaces.find_one({'name': workspace}):
                if user and user['workspace'] == workspace:
                    pass
                else:
                    return jsonify({
                        'status': 'error',
                        'message': 'workspace name has been used. Choose unique name'
                    }), 401

            password_hash = generate_password_hash(password)
            admin = False
            if not user:
                admin = True

            public_id = str(uuid.uuid4())
            new_user = {
                "email": email,
                "fullname": fullname,
                "password": password_hash,
                "public_id": public_id,
                "workspace": workspace,
                "is_admin": admin
            }
            users.insert_one(new_user)

        except Exception as e:
            pass
    else:
        pass


if __name__ == "__main__":
    app.run()
