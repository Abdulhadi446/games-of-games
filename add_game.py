from flask import Flask, request, render_template
import json
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
DATA_FILE = 'data/items.json'
ICONS_DIR = 'data/icons'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def add_game():
    if request.method == 'POST':
        with open(DATA_FILE, 'r') as f:
            items = json.load(f)
        
        new_id = max(item['id'] for item in items) + 1
        tags = [tag.strip() for tag in request.form['tags'].split(',')]
        
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
    
    return render_template('add_game.html', success=False)

if __name__ == '__main__':
    app.run(debug=True)
