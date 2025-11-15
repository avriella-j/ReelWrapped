import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Absolute path to SQLite database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:////home/ajimenez2/ReelWrapped/instance/reelwrapped.db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Uploads folder absolute path
    UPLOAD_FOLDER = os.path.join('/home/ajimenez2/ReelWrapped', 'uploads')
    
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
