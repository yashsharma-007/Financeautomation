import sys
import os
from flask import Flask, request, send_file, jsonify
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.app import process_invoice

app = Flask(__name__)

UPLOAD_FOLDER = 'TaxAssistant/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/process-invoice', methods=['POST'])
def process_invoice_endpoint():
    if 'invoice' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['invoice']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not file.filename.lower().endswith(('.pdf', '.jpg', '.png')):
        return jsonify({"error": "Only PDF, JPG, or PNG files are accepted"}), 400

    # Save the uploaded file temporarily
    upload_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(upload_path)

    try:
        # Process the invoice
        result = process_invoice(upload_path)
        if "error" in result:
            return jsonify(result), 400

        # Clean up temporary file
        if os.path.exists(upload_path):
            os.remove(upload_path)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@app.route('/download-report/<format>/<filename>', methods=['GET'])
def download_report_endpoint(format, filename):
    file_path = os.path.join('TaxAssistant', f"{filename}.{format}")
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    try:
        return send_file(file_path, as_attachment=True, download_name=f"tax_output_{filename}.{format}")
    except Exception as e:
        return jsonify({"error": f"Download error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)