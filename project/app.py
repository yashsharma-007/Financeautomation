import pytesseract
from PIL import Image
import re
import json
import pandas as pd
from datetime import datetime
import schedule
import time

# Specify Tesseract executable path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Extract text from image
def extract_text_from_image(image_path):
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image, config='--psm 6')
    return text

# Parse GST-relevant fields
def parse_invoice_data(text):
    data = {}
    
    # Regex patterns
    invoice_no_pattern = r"\b([A-Z0-9]{8,12}-[A-Z0-9]{6})(?=\s*\(HSN|\s*\d)"  # Matches full 80XBoEZ0-8BP000
    date_pattern = r"(\d{1,2}\s*[-/\s]?(?:Doc|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov)[-\s/]?\d{2,4})"
    taxable_amount_pattern = r"Taxable\s*(?:Value)?\s*[:\-]?\s*(\d+(?:,\d+)?(?:\.\d+)?)|(\d+(?:,\d+)?(?:\.\d+)?)(?=\s*(?:18%|IGST|CGST|SGST))"
    igst_rate_pattern = r"IGST\s*(\d+)%"
    cgst_rate_pattern = r"CGST\s*(\d+)%"
    sgst_rate_pattern = r"SGST\s*(\d+)%"
    igst_amount_pattern = r"(?:IGST|iesr|YsiT)\s*[^\d]*(\d+(?:,\d+)?(?:\.\d+)?)"
    cgst_amount_pattern = r"CGST\s*[^\d]*(\d+(?:,\d+)?(?:\.\d+)?)"
    sgst_amount_pattern = r"SGST\s*[^\d]*(\d+(?:,\d+)?(?:\.\d+)?)"
    total_amount_pattern = r"(?:YsiT\s*Exe\s*Tie|\bTotal\b|\|=)\s*(\d+(?:,\d+)?(?:\.\d+)?)"
    
    # Search for matches
    invoice_no = re.search(invoice_no_pattern, text, re.IGNORECASE)
    date = re.search(date_pattern, text, re.IGNORECASE)
    taxable_amount = re.search(taxable_amount_pattern, text, re.IGNORECASE)
    igst_rate = re.search(igst_rate_pattern, text, re.IGNORECASE)
    cgst_rate = re.search(cgst_rate_pattern, text, re.IGNORECASE)
    sgst_rate = re.search(sgst_rate_pattern, text, re.IGNORECASE)
    igst_amount = re.search(igst_amount_pattern, text, re.IGNORECASE)
    cgst_amount = re.search(cgst_amount_pattern, text, re.IGNORECASE)
    sgst_amount = re.search(sgst_amount_pattern, text, re.IGNORECASE)
    total_amount = re.search(total_amount_pattern, text, re.IGNORECASE)
    
    # Store basic fields
    if invoice_no:
        data["invoice_no"] = invoice_no.group(1)
    if date:
        raw_date = date.group(1).replace("Doc", "Dec").replace(" ", "")
        data["date"] = datetime.strptime(raw_date, "%d-%b-%y").strftime("%d-%m-%Y")
    if total_amount:
        data["total_amount"] = float(total_amount.group(1).replace(",", ""))
    if taxable_amount:
        value = taxable_amount.group(1) or taxable_amount.group(2)
        data["taxable_value"] = float(value.replace(",", ""))
    
    # Handle tax amounts first
    if igst_amount:
        data["igst_amount"] = float(igst_amount.group(1).replace(",", ""))
    if cgst_amount and sgst_amount:
        data["cgst_amount"] = float(cgst_amount.group(1).replace(",", ""))
        data["sgst_amount"] = float(sgst_amount.group(1).replace(",", ""))
    
    # Calculate taxable value if missing
    if "total_amount" in data:
        if "igst_amount" in data and "taxable_value" not in data:
            data["taxable_value"] = data["total_amount"] - data["igst_amount"]
        elif "cgst_amount" in data and "sgst_amount" in data and "taxable_value" not in data:
            data["taxable_value"] = data["total_amount"] - (data["cgst_amount"] + data["sgst_amount"])
    
    # Set tax rates (after taxable_value is ensured)
    if "igst_amount" in data and "taxable_value" in data:
        data["igst_rate"] = int(igst_rate.group(1)) if igst_rate else int((data["igst_amount"] / data["taxable_value"]) * 100 + 0.5)
    elif "cgst_amount" in data and "sgst_amount" in data and "taxable_value" in data:
        data["cgst_rate"] = int(cgst_rate.group(1)) if cgst_rate else int((data["cgst_amount"] / data["taxable_value"]) * 100 + 0.5)
        data["sgst_rate"] = int(sgst_rate.group(1)) if sgst_rate else data["cgst_rate"]
    
    # Fallback: Infer tax type and amounts if only total is present
    if "total_amount" in data and "taxable_value" in data and not any(k in data for k in ["igst_amount", "cgst_amount"]):
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
    
    return data

# Convert to GSTR-1 JSON format
def to_gst_json(invoice_data):
    gst_data = {
        "gstin": "YOUR_GSTIN_HERE",  # Replace with your GSTIN
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
                        "itms": [
                            {
                                "num": 1,
                                "itm_det": {
                                    "rt": invoice_data.get("igst_rate", invoice_data.get("cgst_rate", 0)),
                                    "txval": invoice_data.get("taxable_value", 0.0),
                                    "iamt": invoice_data.get("igst_amount", 0.0),
                                    "camt": invoice_data.get("cgst_amount", 0.0) if "cgst_amount" in invoice_data else 0.0,
                                    "samt": invoice_data.get("sgst_amount", 0.0) if "sgst_amount" in invoice_data else 0.0,
                                    "csamt": 0.0
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
    return gst_data

# Generate Excel
def to_excel(invoice_data, filename="gst_data.xlsx"):
    df = pd.DataFrame([invoice_data])
    df.to_excel(filename, index=False)
    print(f"GST data saved to {filename}")

# Reminders and checklist
def setup_reminders():
    def remind_gstr1():
        print("Reminder: File GSTR-1 by the 11th of this month!")
    
    def remind_gstr3b():
        print("Reminder: File GSTR-3B by the 20th of this month!")
    
    schedule.every().day.at("09:00").do(remind_gstr1)
    schedule.every().day.at("09:00").do(remind_gstr3b)
    
    checklist = [
        "Verify extracted invoice data",
        "Generate JSON/Excel files",
        "Upload to GST portal",
        "Confirm filing deadlines"
    ]
    print("Filing Checklist:")
    for item in checklist:
        print(f"- {item}")

# Main function
def process_invoice(image_path):
    text = extract_text_from_image(image_path)
    print("Raw Extracted Text:\n", text)
    invoice_data = parse_invoice_data(text)
    gst_json = to_gst_json(invoice_data)
    print("Extracted Data:", invoice_data)
    print("GST JSON:", json.dumps(gst_json, indent=2))
    
    with open("gst_data.json", "w") as f:
        json.dump(gst_json, f, indent=2)
    print("GST data saved to gst_data.json")
    
    to_excel(invoice_data)
    setup_reminders()
    
    return invoice_data, gst_json

# Test it
if __name__ == "__main__":
    image_path = "image.png"
    extracted_data, gst_json = process_invoice(image_path)
    
    print("\nRunning scheduler for 10 seconds...")
    end_time = time.time() + 10
    while time.time() < end_time:
        schedule.run_pending()
        time.sleep(1)