import re

def validate_invoice_data(invoice_data):
    """
    Validate invoice data for errors and return a report of issues.
    """
    validation_report = {
        "errors": [],
        "warnings": []
    }

    # Check for required fields
    required_fields = ["invoice_no", "date", "total_amount", "taxable_value"]
    for field in required_fields:
        if field not in invoice_data or not invoice_data[field]:
            validation_report["errors"].append(f"Missing or empty field: {field}")

    # Validate GSTIN format (e.g., 22AAAAA0000A1Z5)
    if "customer_gstin" in invoice_data and invoice_data["customer_gstin"]:
        gstin = invoice_data["customer_gstin"]
        if not re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[Z]{1}\d{1}$", gstin):
            validation_report["warnings"].append(f"Invalid GSTIN format: {gstin}")

    # Check if total_amount = taxable_value + taxes
    total_tax = (invoice_data.get("cgst_amount", 0.0) + 
                 invoice_data.get("sgst_amount", 0.0) + 
                 invoice_data.get("igst_amount", 0.0))
    expected_total = invoice_data.get("taxable_value", 0.0) + total_tax
    if abs(invoice_data.get("total_amount", 0.0) - expected_total) > 0.01:
        validation_report["warnings"].append(f"Mismatch: Total amount ({invoice_data.get('total_amount', 0.0)}) does not match taxable value + taxes ({expected_total})")

    return validation_report

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
        "customer_gstin": "22AAAAA0000A1Z5"
    }
    report = validate_invoice_data(sample_invoice)
    print("Validation Report:", report)