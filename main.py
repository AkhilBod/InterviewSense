# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import jwt
import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_secret_key')  # Use environment variable in production
DATABASE = 'interviewsense.db'

# Database setup
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Helper functions
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

# Generate JWT token
def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

# Verify JWT token
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

# Routes
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', email.split('@')[0])  # Default name from email if not provided
    
    # Hash the password
    hashed_password = generate_password_hash(password)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
                      (email, hashed_password, name))
        conn.commit()
        
        # Get the user id for token generation
        user_id = cursor.lastrowid
        
        # Generate token
        token = generate_token(user_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name
            }
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'User already exists'}), 409
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    user = cursor.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if user and check_password_hash(user['password'], password):
        token = generate_token(user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }), 200
    
    return jsonify({'message': 'Invalid email or password'}), 401

@app.route('/api/github-login', methods=['POST'])
def github_login():
    # In a real implementation, you would handle GitHub OAuth flow
    # For this demo, we'll simulate a successful GitHub login
    
    # Create or find GitHub user
    github_email = "github-user@example.com"
    github_name = "GitHub User"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    user = cursor.execute('SELECT * FROM users WHERE email = ?', (github_email,)).fetchone()
    
    if not user:
        # Create new user with random password (OAuth users don't need passwords)
        random_password = generate_password_hash(os.urandom(24).hex())
        cursor.execute('INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
                      (github_email, random_password, github_name))
        conn.commit()
        user_id = cursor.lastrowid
    else:
        user_id = user['id']
    
    conn.close()
    
    # Generate token
    token = generate_token(user_id)
    
    return jsonify({
        'message': 'GitHub login successful',
        'token': token,
        'user': {
            'id': user_id,
            'email': github_email,
            'name': github_name
        }
    }), 200

@app.route('/api/verify-token', methods=['POST'])
def verify_token_route():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'valid': False}), 401
    
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'valid': False}), 401
    
    conn = get_db_connection()
    user = conn.execute('SELECT id, email, name FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    
    if not user:
        return jsonify({'valid': False}), 401
    
    return jsonify({
        'valid': True,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        }
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)