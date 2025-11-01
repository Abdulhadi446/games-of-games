from flask import Flask, request, render_template, abort
import json
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')

DATA_FILE = 'data/items.json'
ICONS_DIR = 'data/icons'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

if not os.path.exists(ICONS_DIR):
    os.makedirs(ICONS_DIR)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def add_game():
    if request.method == 'POST':
        try:
            with open(DATA_FILE, 'r') as f:
                items = json.load(f)
            
            new_id = max(item['id'] for item in items) + 1 if items else 1
            tags = [tag.strip() for tag in request.form['tags'].split(',') if tag.strip()]
            
            icon_path = f'https://via.placeholder.com/200x300/1a1a1a/7dd3fc?text={request.form["title"]}'
            
            if 'icon' in request.files:
                file = request.files['icon']
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(f"{new_id}_{file.filename}")
                    file.save(os.path.join(ICONS_DIR, filename))
                    icon_path = f'data/icons/{filename}'
            
            new_item = {
                'id': new_id,
                'type': request.form['type'],
                'title': request.form['title'],
                'description': request.form['description'],
                'category': request.form['category'],
                'tags': tags,
                'link': request.form['link'],
                'icon': icon_path
            }
            
            if 'trending' in request.form:
                new_item['trending'] = True
            
            items.append(new_item)
            
            with open(DATA_FILE, 'w') as f:
                json.dump(items, f, indent=2)
            
            return render_template('add_game.html', success=True)
        except Exception as e:
            app.logger.error(f'Error adding item: {e}')
            return render_template('add_game.html', success=False, error=str(e))
    
    return render_template('add_game.html', success=False)

@app.errorhandler(413)
def too_large(e):
    return render_template('add_game.html', success=False, error='File too large (max 5MB)'), 413

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
