# Admin Panel - Add Items

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env and set SECRET_KEY
```

3. Run the admin panel:
```bash
python add_game.py
```

4. Access at: http://localhost:5000

## Production Deployment

### Using Gunicorn (Recommended)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 add_game:app
```

### Environment Variables
- `SECRET_KEY` - Flask secret key (required in production)
- `PORT` - Port to run on (default: 5000)

## Security Notes
- Max file upload size: 5MB
- Allowed image formats: png, jpg, jpeg, gif, webp
- Files saved to: `data/icons/`
- Change SECRET_KEY in production
