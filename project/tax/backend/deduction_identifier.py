import re
from datetime import datetime

def identify_deductions(invoice_data):
    """
    Identify potential tax deductions (e.g., Input Tax Credit, business expenses) from invoice data.
    Returns a dictionary with deductible amounts and descriptions.
    """
    deductions = {
        "input_tax_credit": 0.0,
        "business_expenses": 0.0,
        "deduction_notes": []
    }

    # Example: Check SAC codes or descriptions for common deductible items
    sac_codes = re.findall(r"SAC\s*(\d+)", invoice_data.get("raw_text", ""))
    descriptions = re.findall(r"Description\s*([a-zA-Z\s]+)", invoice_data.get("raw_text", ""))
    
    if sac_codes:
        for sac in sac_codes:
            if sac in ["121", "222"]:  # Example SAC codes for deductible services (adjust based on GST rules)
                deductions["input_tax_credit"] += invoice_data.get("taxable_value", 0.0) * 0.18  # Assume 18% ITC for simplicity
                deductions["deduction_notes"].append(f"ITC eligible for SAC {sac}: {invoice_data.get('taxable_value', 0.0)}")
    
    if descriptions:
        for desc in descriptions:
            if "ac" in desc.lower() or "heat" in desc.lower():  # Example for AC/Heating as business expenses
                deductions["business_expenses"] += invoice_data.get("taxable_value", 0.0) * 0.1  # Assume 10% deductible
                deductions["deduction_notes"].append(f"Business expense deduction for {desc}: {invoice_data.get('taxable_value', 0.0) * 0.1}")

    return deductions

# Example usage (can be integrated with your app.py)
if __name__ == "__main__":
    # Mock invoice data (replace with actual invoice_data from app.py)
    sample_invoice = {
        "invoice_no": "80XBoEZ0-8BP000",
        "date": "26-02-2025",
        "total_amount": 15953.44,
        "taxable_value": 14596.0,
        "raw_text": "Type your company name here! Tax Invoice ... SAC 121 ... Description ac ...",
        "tax_details": {"cgst": [{"rate": 9.0, "amount": 434.52}, {"rate": 2.5, "amount": 244.20}, {"rate": 2.5, "amount": 244.20}], 
                       "sgst": [{"rate": 9.0, "amount": 494.52}], "igst": []}
    }
    deductions = identify_deductions(sample_invoice)
    print("Identified Deductions:", deductions)