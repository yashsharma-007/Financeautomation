import pytesseract
from PIL import Image
import re
import json
import pandas as pd
from datetime import datetime
import schedule
import time
import os
from pdf2image import convert_from_path
from backend.deduction_identifier import identify_deductions
from backend.tax_calculator import calculate_tax_liability
from backend.error_validator import validate_invoice_data
from backend.filing_reminder import setup_enhanced_reminders
from backend.user_interaction import interact_with_user, append_to_enhanced_excel
from backend.gst_portal_simulator import simulate_gst_upload

# Specify Tesseract executable path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Extract text from image
def extract_text_from_image(image):
    try:
        if image.mode != 'RGB':
            image = image.convert('RGB')
        text = pytesseract.image_to_string(image, config='--psm 6')
        print("Raw Extracted Text:\n", text)
        if not text.strip():
            print("Warning: No text extracted from image. Check image quality or content.")
        return text
    except Exception as e:
        print(f"Error processing image: {e}")
        return ""

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    try:
        images = convert_from_path(pdf_path, dpi=200)
        all_text = ""
        for i, image in enumerate(images):
            print(f"Processing PDF page {i + 1}...")
            text = extract_text_from_image(image)
            all_text += text + "\n"
        print("Combined Raw Extracted Text from PDF:\n", all_text)
        if not text.strip():
            print("Warning: No text extracted from PDF. Check PDF content or quality.")
        return all_text
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return ""

# Parse GST-relevant fields
def parse_invoice_data(text):
    data = {}
    
    invoice_no_pattern = r"\b([A-Z0-9]{8,12}-[A-Z0-9]{6}|\d{4}-\d{2})\b"
    date_pattern = r"(\d{1,2}-(?:\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2,4})"
    taxable_amount_pattern = r"Taxable\s*(?:Value)?\s*[:\-]?\s*(\d+(?:,\d+)?(?:\.\d+)?)|Taxable\s*Value\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    igst_rate_pattern = r"IGST\s*(\d+)%"
    cgst_rate_pattern = r"CGST\s*(\d+)%|\b\d+\s*(?:%|%)\s*Amt\s*\d+\b"
    sgst_rate_pattern = r"SGST\s*(\d+)%|\b\d+\s*(?:%|%)\s*Amt\s*\d+\b"
    igst_amount_pattern = r"(?:IGST|iesr|YsiT)\s*[^\d]*(\d+(?:,\d+)?(?:\.\d+)?)|IGST\s*Amt\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    cgst_amount_pattern = r"CGST\s*[^\d]*(\d+(?:,\d+)?(?:\.\d+)?)|CGST\s*Amt\s*(\d+(?:,\d+)?(?:\.\d+)?)|\b\d+\s*(?:%|%)\s*Amt\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    sgst_amount_pattern = r"SGST\s*[^\d]*(\d+(?:,\d+)?(?:\.\d+)?)|SGST\s*Amt\s*(\d+(?:,\d+)?(?:\.\d+)?)|\b\d+\\s*(?:%|%)\s*Amt\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    total_amount_pattern = r"(?:YsiT\s*Exe\s*Tie|\bTotal\b|\|=)\s*(\d+(?:,\d+)?(?:\.\d+)?)|Total\s*Payable\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    
    date_pattern_alt = r"(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{2,4})"
    total_amount_pattern_alt = r"Grand\s*Total\s*[:\-]?\s*Rs\.\s*(\d+(?:,\d+)?(?:\.\d+)?)|Total\s*Rs\.\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    cgst_rate_pattern_alt = r"CGST@(\d+(?:\.\d+)?)%"
    sgst_rate_pattern_alt = r"[SC]GST@(\d+(?:\.\d+)?)%"
    cgst_amount_pattern_alt = r"CGST@(\d+(?:\.\d+)?)%\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    sgst_amount_pattern_alt = r"[SC]GST@(\d+(?:\.\d+)?)%\s*(\d+(?:,\d+)?(?:\.\d+)?)"  # Matches SCST or SGST
    taxable_amount_pattern_alt = r"Sub\s*Total\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    
    print("Searching for patterns in text...")
    invoice_no = re.search(invoice_no_pattern, text, re.IGNORECASE)
    if invoice_no:
        print(f"Found invoice_no: {invoice_no.group(1)}")
    date = re.search(date_pattern, text, re.IGNORECASE) or re.search(date_pattern_alt, text, re.IGNORECASE)
    if date:
        print(f"Found date: {date.group(1)}")
    taxable_amount = re.search(taxable_amount_pattern, text, re.IGNORECASE) or re.search(taxable_amount_pattern_alt, text, re.IGNORECASE)
    if taxable_amount:
        print(f"Found taxable_amount: {taxable_amount.group(1) or taxable_amount.group(2)}")
    igst_rate = re.search(igst_rate_pattern, text, re.IGNORECASE)
    if igst_rate:
        print(f"Found igst_rate: {igst_rate.group(1)}")
    cgst_rate = re.search(cgst_rate_pattern, text, re.IGNORECASE) or re.search(cgst_rate_pattern_alt, text, re.IGNORECASE)
    if cgst_rate:
        print(f"Found cgst_rate: {cgst_rate.group(1)}")
    else:
        print("cgst_rate not found in text.")
    sgst_rate = re.search(sgst_rate_pattern, text, re.IGNORECASE) or re.search(sgst_rate_pattern_alt, text, re.IGNORECASE)
    if sgst_rate:
        print(f"Found sgst_rate: {sgst_rate.group(1)}")
    else:
        print("sgst_rate not found in text.")
    igst_amount = re.search(igst_amount_pattern, text, re.IGNORECASE)
    if igst_amount:
        print(f"Found igst_amount: {igst_amount.group(1) or igst_amount.group(2)}")
    else:
        print("igst_amount not found in text.")
    cgst_amount = re.search(cgst_amount_pattern, text, re.IGNORECASE)
    if cgst_amount:
        print(f"Found cgst_amount (original): {cgst_amount.group(1) or cgst_amount.group(2) or cgst_amount.group(3)}")
    sgst_amount = re.search(sgst_amount_pattern, text, re.IGNORECASE)
    if sgst_amount:
        print(f"Found sgst_amount (original): {sgst_amount.group(1) or sgst_amount.group(2) or sgst_amount.group(3)}")
    total_amount = re.search(total_amount_pattern_alt, text, re.IGNORECASE) or re.search(total_amount_pattern, text, re.IGNORECASE)
    if total_amount:
        print(f"Found total_amount: {total_amount.group(1) or total_amount.group(2)}")
    
    if invoice_no:
        data["invoice_no"] = invoice_no.group(1)
    if date:
        raw_date = date.group(1).replace("Doc", "Dec").replace(" ", "")
        try:
            data["date"] = datetime.strptime(raw_date, "%d-%m-%y").strftime("%d-%m-%Y")
        except ValueError:
            data["date"] = datetime.strptime(raw_date, "%d%b%Y").strftime("%d-%m-%Y")
    if total_amount:
        data["total_amount"] = float((total_amount.group(1) or total_amount.group(2)).replace(",", ""))
    if taxable_amount:
        value = taxable_amount.group(1) or taxable_amount.group(2)
        data["taxable_value"] = float(value.replace(",", ""))
    
    if igst_amount:
        data["igst_amount"] = float((igst_amount.group(1) or igst_amount.group(2)).replace(",", ""))
    
    # Enhanced tax handling: Store multiple rates and amounts
    data["tax_details"] = {"cgst": [], "sgst": [], "igst": []}
    cgst_matches = re.findall(cgst_amount_pattern_alt, text, re.IGNORECASE)
    for rate, amount in cgst_matches:
        data["tax_details"]["cgst"].append({"rate": float(rate), "amount": float(amount.replace(",", ""))})
        print(f"Found CGST: rate={rate}%, amount={amount}")
    sgst_matches = re.findall(sgst_amount_pattern_alt, text, re.IGNORECASE)
    for rate, amount in sgst_matches:
        # Avoid duplicating CGST matches by checking context
        if "CGST" not in text[text.index(f"@{rate}% {amount}"):text.index(f"@{rate}% {amount}")] or "SCST" in text:
            data["tax_details"]["sgst"].append({"rate": float(rate), "amount": float(amount.replace(",", ""))})
            print(f"Found SGST: rate={rate}%, amount={amount}")
    
    if data["tax_details"]["cgst"]:
        data["cgst_amount"] = sum(item["amount"] for item in data["tax_details"]["cgst"])
        data["cgst_rate"] = data["tax_details"]["cgst"][0]["rate"]
    if data["tax_details"]["sgst"]:
        data["sgst_amount"] = sum(item["amount"] for item in data["tax_details"]["sgst"])
        data["sgst_rate"] = data["tax_details"]["sgst"][0]["rate"]
    
    if "total_amount" in data:
        if "igst_amount" in data and "taxable_value" not in data:
            data["taxable_value"] = data["total_amount"] - data["igst_amount"]
        elif "cgst_amount" in data and "sgst_amount" in data and "taxable_value" not in data:
            data["taxable_value"] = data["total_amount"] - (data["cgst_amount"] + data["sgst_amount"])
    
    if "igst_amount" in data and "taxable_value" in data:
        data["igst_rate"] = int(igst_rate.group(1)) if igst_rate else int((data["igst_amount"] / data["taxable_value"]) * 100 + 0.5)
    elif "cgst_amount" in data and "sgst_amount" in data and "taxable_value" in data:
        data["cgst_rate"] = int(cgst_rate.group(1)) if cgst_rate else int((data["cgst_amount"] / data["taxable_value"]) * 100 + 0.5)
        data["sgst_rate"] = int(sgst_rate.group(1)) if sgst_rate else data["cgst_rate"]
    
    if "total_amount" in data and "taxable_value" in data and not any(k in data for k in ["igst_amount", "cgst_amount", "sgst_amount"]):
        tax_amount = data["total_amount"] - data["taxable_value"]
        if "IGST" in text.upper():
            data["igst_amount"] = tax_amount
            data["igst_rate"] = int((tax_amount / data["taxable_value"]) * 100 + 0.5)
        elif "CGST" in text.upper() and "SGST" in text.upper():
            half_tax = tax_amount / 2
            data["cgst_amount"] = half_tax
            data["sgst_amount"] = half_tax
            data["cgst_rate"] = int((half_tax / data["taxable_value"]) * 100 + 0.5)
            data["sgst_rate"] = data["cgst_rate"]
    
    if "cgst_rate" not in data:
        data["cgst_rate"] = 0
    if "sgst_rate" not in data:
        data["sgst_rate"] = 0
    if "cgst_amount" not in data:
        data["cgst_amount"] = 0.0
    if "sgst_amount" not in data:
        data["sgst_amount"] = 0.0
    
    print("Parsed Data:", data)
    return data

# Convert to GSTR-1 JSON format
def to_gst_json(invoice_data):
    itms = []
    tax_details = invoice_data.get("tax_details", {"cgst": [], "sgst": [], "igst": []})
    
    total_taxable = invoice_data.get("taxable_value", 0.0)
    total_cgst = sum(item["amount"] for item in tax_details["cgst"])
    total_sgst = sum(item["amount"] for item in tax_details["sgst"])
    
    for i, cgst_item in enumerate(tax_details["cgst"]):
        taxable_portion = (cgst_item["amount"] / total_cgst) * total_taxable if total_cgst else total_taxable
        sgst_item = next((s for s in tax_details["sgst"] if s["rate"] == cgst_item["rate"]), {"rate": 0, "amount": 0.0})
        itms.append({
            "num": i + 1,
            "itm_det": {
                "rt": cgst_item["rate"],
                "txval": taxable_portion,
                "iamt": 0.0,
                "camt": cgst_item["amount"],
                "samt": sgst_item["amount"] if sgst_item["rate"] == cgst_item["rate"] else 0.0,
                "csamt": 0.0
            }
        })
    
    for i, sgst_item in enumerate(tax_details["sgst"]):
        if not any(cgst["rate"] == sgst_item["rate"] for cgst in tax_details["cgst"]):
            taxable_portion = (sgst_item["amount"] / total_sgst) * total_taxable if total_sgst else total_taxable
            itms.append({
                "num": len(itms) + 1,
                "itm_det": {
                    "rt": sgst_item["rate"],
                    "txval": taxable_portion,
                    "iamt": 0.0,
                    "camt": 0.0,
                    "samt": sgst_item["amount"],
                    "csamt": 0.0
                }
            })
    
    gst_data = {
        "gstin": "YOUR_GSTIN_HERE",
        "fp": "022025",
        "b2b": [
            {
                "inv": [
                    {
                        "inum": invoice_data.get("invoice_no", ""),
                        "idt": invoice_data.get("date", ""),
                        "val": invoice_data.get("total_amount", 0.0),
                        "pos": "07",
                        "rchrg": "N",
                        "etin": "",
                        "inv_typ": "R",
                        "itms": itms if itms else [{
                            "num": 1,
                            "itm_det": {
                                "rt": invoice_data.get("igst_rate", invoice_data.get("cgst_rate", 0)),
                                "txval": invoice_data.get("taxable_value", 0.0),
                                "iamt": invoice_data.get("igst_amount", 0.0),
                                "camt": invoice_data.get("cgst_amount", 0.0) if "cgst_amount" in invoice_data else 0.0,
                                "samt": invoice_data.get("sgst_amount", 0.0) if "sgst_amount" in invoice_data else 0.0,
                                "csamt": 0.0
                            }
                        }]
                    }
                ]
            }
        ]
    }
    return gst_data

# Modified Excel function with deduplication
def append_to_excel(invoice_data, filename="gst_data.xlsx", retries=3, delay=2):
    # Flatten tax_details into separate columns
    flattened_data = {
        "invoice_no": invoice_data.get("invoice_no", ""),
        "date": invoice_data.get("date", ""),
        "total_amount": invoice_data.get("total_amount", 0.0),
        "taxable_value": invoice_data.get("taxable_value", 0.0),
        "cgst_amount": invoice_data.get("cgst_amount", 0.0),
        "sgst_amount": invoice_data.get("sgst_amount", 0.0),
        "igst_amount": invoice_data.get("igst_amount", 0.0),
        "cgst_rate": invoice_data.get("cgst_rate", 0),
        "sgst_rate": invoice_data.get("sgst_rate", 0),
        "igst_rate": invoice_data.get("igst_rate", 0)
    }
    
    # Extract CGST details
    cgst_details = invoice_data.get("tax_details", {}).get("cgst", [])
    if cgst_details:
        flattened_data["cgst_rates"] = ", ".join(f"{d['rate']}" for d in cgst_details)
        flattened_data["cgst_amounts"] = ", ".join(f"{d['amount']:.2f}" for d in cgst_details)
    
    # Extract SGST details
    sgst_details = invoice_data.get("tax_details", {}).get("sgst", [])
    if sgst_details:
        flattened_data["sgst_rates"] = ", ".join(f"{d['rate']}" for d in sgst_details)
        flattened_data["sgst_amounts"] = ", ".join(f"{d['amount']:.2f}" for d in sgst_details)
    
    # Extract IGST details (if any)
    igst_details = invoice_data.get("tax_details", {}).get("igst", [])
    if igst_details:
        flattened_data["igst_rates"] = ", ".join(f"{d['rate']}" for d in igst_details)
        flattened_data["igst_amounts"] = ", ".join(f"{d['amount']:.2f}" for d in igst_details)
    
    df_new = pd.DataFrame([flattened_data])
    
    if os.path.exists(filename):
        try:
            df_existing = pd.read_excel(filename)
            # Check for duplicates based on invoice_no and date
            df_existing = df_existing.drop_duplicates(subset=["invoice_no", "date"], keep="first")
            if not df_existing[
                (df_existing["invoice_no"] == flattened_data["invoice_no"]) & 
                (df_existing["date"] == flattened_data["date"])
            ].empty:
                print(f"Duplicate entry for invoice {flattened_data['invoice_no']} on {flattened_data['date']} skipped.")
                return
            df_combined = pd.concat([df_existing, df_new], ignore_index=True)
        except Exception as e:
            print(f"Error reading existing Excel file: {e}")
            df_combined = df_new
    else:
        df_combined = df_new
    
    for attempt in range(retries):
        try:
            df_combined.to_excel(filename, index=False)
            print(f"GST data appended to {filename}")
            break
        except PermissionError:
            print(f"Permission denied for {filename}. Retrying in {delay} seconds... (Attempt {attempt + 1}/{retries})")
            time.sleep(delay)
    else:
        print(f"Failed to write to {filename} after {retries} attempts. Please close the file if it’s open.")

# Modified JSON function to append data
def append_to_json(invoice_data, filename="gst_data.json"):
    new_gst_data = to_gst_json(invoice_data)
    
    if os.path.exists(filename):
        with open(filename, "r") as f:
            existing_data = json.load(f)
        if "b2b" in existing_data and existing_data["b2b"]:
            existing_data["b2b"][0]["inv"].append(new_gst_data["b2b"][0]["inv"][0])
        else:
            existing_data["b2b"] = new_gst_data["b2b"]
        with open(filename, "w") as f:
            json.dump(existing_data, f, indent=2)
    else:
        with open(filename, "w") as f:
            json.dump(new_gst_data, f, indent=2)
    
    print(f"GST data appended to {filename}")

# Main function to process invoice with new features
def process_invoice(file_path):
    if file_path.lower().endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    else:
        image = Image.open(file_path)
        text = extract_text_from_image(image)
    
    if not text.strip():
        print("Warning: No text extracted from file. Check file quality, content, or path.")
        return {}, {}
    print("Raw Extracted Text:\n", text)
    invoice_data = parse_invoice_data(text)
    invoice_data["raw_text"] = text  # Add raw text for deduction identification
    print("Extracted Data:", invoice_data)
    
    if invoice_data and any(invoice_data.values()):
        # Add new features
        deductions = identify_deductions(invoice_data)
        invoice_data.update(deductions)

        tax_calcs = calculate_tax_liability(invoice_data)
        invoice_data.update(tax_calcs)

        validation_report = validate_invoice_data(invoice_data)
        if validation_report["errors"] or validation_report["warnings"]:
            print("Validation Report:", validation_report)

        interact_with_user(invoice_data)

        append_to_json(invoice_data)
        append_to_excel(invoice_data)

        setup_enhanced_reminders(invoice_data)

        gst_json = to_gst_json(invoice_data)
        portal_response = simulate_gst_upload(gst_json)
        print("GST Portal Simulation:", portal_response)
    else:
        print("No valid data extracted. Skipping file updates.")
    
    gst_json = to_gst_json(invoice_data)
    print("GST JSON (latest entry):", json.dumps(gst_json, indent=2))
    
    return invoice_data, gst_json

# Test it
if __name__ == "__main__":
    file_path = "invoice.pdf"
    extracted_data, gst_json = process_invoice(file_path)
    
    print("\nRunning scheduler for 10 seconds...")
    end_time = time.time() + 10
    while time.time() < end_time:
        schedule.run_pending()
        time.sleep(1)