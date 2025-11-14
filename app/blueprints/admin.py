from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.utils.db import get_db
from app.utils.helpers import validate_required_fields, validate_email, validate_image_url, hash_password, check_password
import sqlite3

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/')
def dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login'))

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()

    return render_template('admin.html', user=user)

@admin_bp.route('/edit', methods=['POST'])
def edit_profile():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login'))

    username = request.form.get('username')
    email = request.form.get('email')
    bio = request.form.get('bio')
    profile_image_url = request.form.get('profile_image_url')

    valid, error = validate_required_fields(request.form, ['username', 'email'])
    if not valid:
        flash(error, 'error')
        return redirect(url_for('admin.dashboard'))

    if not validate_email(email):
        flash('Invalid email format', 'error')
        return redirect(url_for('admin.dashboard'))

    if profile_image_url and not validate_image_url(profile_image_url):
        flash('Invalid image URL format', 'error')
        return redirect(url_for('admin.dashboard'))

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            'UPDATE users SET username = ?, email = ?, bio = ?, profile_image_url = ? WHERE id = ?',
            (username, email, bio, profile_image_url, user_id)
        )
        db.commit()
        session['username'] = username
        flash('Profile updated successfully!', 'success')
    except sqlite3.IntegrityError:
        flash('Username or email already exists', 'error')

    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/change-password', methods=['POST'])
def change_password():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login'))

    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')

    valid, error = validate_required_fields(request.form, ['current_password', 'new_password', 'confirm_password'])
    if not valid:
        flash(error, 'error')
        return redirect(url_for('admin.dashboard'))

    if new_password != confirm_password:
        flash('New passwords do not match', 'error')
        return redirect(url_for('admin.dashboard'))

    if len(new_password) < 6:
        flash('Password must be at least 6 characters long', 'error')
        return redirect(url_for('admin.dashboard'))

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT password_hash FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()

    if not check_password(user['password_hash'], current_password):
        flash('Current password is incorrect', 'error')
        return redirect(url_for('admin.dashboard'))

    cursor.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        (hash_password(new_password), user_id)
    )
    db.commit()

    flash('Password changed successfully!', 'success')
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/delete-account', methods=['POST'])
def delete_account():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login'))

    # For security, require password confirmation
    password = request.form.get('password')
    if not password:
        flash('Password required to delete account', 'error')
        return redirect(url_for('admin.dashboard'))

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT password_hash FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()

    if not check_password(user['password_hash'], password):
        flash('Incorrect password', 'error')
        return redirect(url_for('admin.dashboard'))

    # Delete user data
    cursor.execute('DELETE FROM follows WHERE follower_id = ? OR following_id = ?', (user_id, user_id))
    cursor.execute('DELETE FROM user_interests WHERE user_id = ?', (user_id,))
    cursor.execute('DELETE FROM activity_logs WHERE user_id = ?', (user_id,))
    cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
    db.commit()

    session.clear()
    flash('Account deleted successfully', 'success')
    return redirect(url_for('auth.register'))
