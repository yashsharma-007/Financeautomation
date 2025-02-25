import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
import os
import time

def interact_with_user(invoice_data):
    """
    Prompt user for additional tax-related data and generate a report.
    """
    print("\nTax Assistant - User Input")
    print("Enter additional tax information for invoice:", invoice_data.get("invoice_no", ""))
    
    additional_itc = float(input("Enter additional Input Tax Credit (ITC) amount (or 0): ") or 0)
    additional_expenses = float(input("Enter additional business expenses (or 0): ") or 0)

    # Update invoice_data with user input
    invoice_data["additional_itc"] = additional_itc
    invoice_data["additional_expenses"] = additional_expenses

    # Generate detailed report (PDF)
    generate_report(invoice_data)

def generate_report(invoice_data):
    """
    Generate a PDF report summarizing tax data, deductions, and liabilities.
    """
    pdf_filename = f"tax_report_{invoice_data.get('invoice_no', 'unknown')}.pdf"
    doc = SimpleDocTemplate(pdf_filename, pagesize=letter)
    elements = []

    # Data for the table
    data = [
        ["Field", "Value"],
        ["Invoice No.", invoice_data.get("invoice_no", "")],
        ["Date", invoice_data.get("date", "")],
        ["Total Amount", f"{invoice_data.get('total_amount', 0.0):.2f}"],
        ["Taxable Value", f"{invoice_data.get('taxable_value', 0.0):.2f}"],
        ["CGST Amount", f"{invoice_data.get('cgst_amount', 0.0):.2f}"],
        ["SGST Amount", f"{invoice_data.get('sgst_amount', 0.0):.2f}"],
        ["IGST Amount", f"{invoice_data.get('igst_amount', 0.0):.2f}"],
        ["Additional ITC", f"{invoice_data.get('additional_itc', 0.0):.2f}"],
        ["Additional Expenses", f"{invoice_data.get('additional_expenses', 0.0):.2f}"],
        ["Tax Details", str(invoice_data.get("tax_details", {}))],
        ["Input Tax Credit", f"{invoice_data.get('input_tax_credit', 0.0):.2f}"],
        ["Business Expenses", f"{invoice_data.get('business_expenses', 0.0):.2f}"],
        ["Total Tax Liability", f"{invoice_data.get('total_tax_liability', 0.0):.2f}"],
        ["Net Tax Payable", f"{invoice_data.get('net_tax_payable', 0.0):.2f}"]
    ]

    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))

    elements.append(table)
    doc.build(elements)
    print(f"Detailed tax report generated: {pdf_filename}")

    # Also enhance Excel output with additional fields
    append_to_enhanced_excel(invoice_data)

def append_to_enhanced_excel(invoice_data, filename="gst_data.xlsx", retries=3, delay=2):
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
        "igst_rate": invoice_data.get("igst_rate", 0),
        "additional_itc": invoice_data.get("additional_itc", 0.0),
        "additional_expenses": invoice_data.get("additional_expenses", 0.0),
        "input_tax_credit": invoice_data.get("input_tax_credit", 0.0),
        "business_expenses": invoice_data.get("business_expenses", 0.0),
        "total_tax_liability": invoice_data.get("total_tax_liability", 0.0),
        "net_tax_payable": invoice_data.get("net_tax_payable", 0.0)
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

# Example usage
if __name__ == "__main__":
    # Mock invoice data (replace with actual invoice_data from app.py)
    sample_invoice = {
        "invoice_no": "80XBoEZ0-8BP000",
        "date": "26-02-2025",
        "total_amount": 15953.44,
        "taxable_value": 14596.0,
        "cgst_amount": 922.92,
        "sgst_amount": 494.52,
        "igst_amount": 0.0,
        "tax_details": {"cgst": [{"rate": 9.0, "amount": 434.52}, {"rate": 2.5, "amount": 244.20}, {"rate": 2.5, "amount": 244.20}], 
                       "sgst": [{"rate": 9.0, "amount": 494.52}], "igst": []}
    }
    interact_with_user(sample_invoice)