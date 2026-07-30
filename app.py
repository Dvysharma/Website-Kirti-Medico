from flask import Flask, request, jsonify, send_from_directory
import os
from uuid import uuid4
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load .env from project root and trim whitespace
load_dotenv(os.path.join(BASE_DIR, '.env'))
WEB3FORMS_URL = (os.environ.get('WEB3FORMS_URL') or '').strip()
WEB3FORMS_ACCESS_KEY = (os.environ.get('WEB3FORMS_ACCESS_KEY') or '').strip()

app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path == '':
        return send_from_directory(BASE_DIR, 'index.html')
    # Protect against directory traversal
    safe_path = os.path.join(BASE_DIR, os.path.normpath(path))
    if os.path.exists(safe_path) and os.path.commonpath([BASE_DIR, safe_path]) == BASE_DIR:
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/api/orders', methods=['POST'])
def api_orders():
    # Accept form fields and files, then respond with JSON
    name = request.form.get('name') or request.form.get('custName')
    phone = request.form.get('phone')
    email = request.form.get('email')
    message = request.form.get('message') or request.form.get('orderRequirements')

    # Save uploaded files to temp folder
    files = request.files.getlist('attachment')
    saved_files = []
    if os.environ.get('VERCEL') == '1':
        upload_dir = '/tmp/uploads'
    else:
        upload_dir = os.path.join(BASE_DIR, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    for f in files:
        filename = f"{uuid4().hex}_{f.filename}"
        path = os.path.join(upload_dir, filename)
        f.save(path)
        saved_files.append(filename)

    # Simple validation
    if not name or not phone or not message:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    # Here you would connect to backend services, databases, etc.
    order_id = uuid4().hex[:8]

    # If configured, forward the same form+files to the Web3Forms / Web3World endpoint
    forward_response = None
    if WEB3FORMS_URL and WEB3FORMS_ACCESS_KEY:
        try:
            forward_headers = {
                'Authorization': f'Bearer {WEB3FORMS_ACCESS_KEY}',
                'Accept': 'application/json'
            }

            # Build multipart form for forwarding
            forward_data = {
                'name': name,
                'phone': phone,
                'email': email or '',
                'message': message or ''
            }

            # Some providers expect the access key as a form field instead of a header
            if WEB3FORMS_ACCESS_KEY:
                forward_data['access_key'] = WEB3FORMS_ACCESS_KEY

            forward_files = []
            for fname in saved_files:
                fpath = os.path.join(upload_dir, fname)
                try:
                    forward_files.append(('attachment', (fname, open(fpath, 'rb'))))
                except Exception:
                    continue

            resp = requests.post(WEB3FORMS_URL, headers=forward_headers, data=forward_data, files=forward_files, timeout=15)
            forward_response = {
                'status_code': resp.status_code,
                'body': None
            }
            try:
                forward_response['body'] = resp.json()
            except Exception:
                forward_response['body'] = resp.text

            # Log forwarding result to console and file for debugging
            try:
                log_entry = {
                    'url': WEB3FORMS_URL,
                    'status_code': forward_response.get('status_code'),
                    'body': forward_response.get('body')
                }
                print('WEB3FORMS FORWARD RESULT:', log_entry)
                if os.environ.get('VERCEL') != '1':
                    with open(os.path.join(BASE_DIR, 'forward.log'), 'a', encoding='utf-8') as lf:
                        from datetime import datetime
                        lf.write(f"[{datetime.utcnow().isoformat()}] {log_entry}\n")
            except Exception as e:
                print('Failed to write forward log:', e)

        except Exception as e:
            forward_response = {'error': str(e)}
            # Log errors too
            try:
                err_log = {'url': WEB3FORMS_URL, 'error': str(e)}
                print('WEB3FORMS FORWARD ERROR:', err_log)
                if os.environ.get('VERCEL') != '1':
                    with open(os.path.join(BASE_DIR, 'forward.log'), 'a', encoding='utf-8') as lf:
                        from datetime import datetime
                        lf.write(f"[{datetime.utcnow().isoformat()}] ERROR {err_log}\n")
            except Exception:
                pass

    return jsonify({'success': True, 'message': 'Order received', 'order_id': order_id, 'saved_files': saved_files, 'forward': forward_response}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
