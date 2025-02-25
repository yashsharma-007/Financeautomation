def calculate_tax_liability(invoice_data):
    """
    Calculate total tax liability, net tax payable, and input tax credit (ITC).
    Returns a dictionary with calculated values.
    """
    tax_calculations = {
        "total_tax_liability": 0.0,
        "net_tax_payable": 0.0,
        "input_tax_credit": 0.0,
        "notes": []
    }

    # Sum CGST, SGST, and IGST amounts
    cgst_amount = invoice_data.get("cgst_amount", 0.0)
    sgst_amount = invoice_data.get("sgst_amount", 0.0)
    igst_amount = invoice_data.get("igst_amount", 0.0)

    total_tax_liability = cgst_amount + sgst_amount + igst_amount
    tax_calculations["total_tax_liability"] = total_tax_liability

    # Net tax payable (assuming no ITC for simplicity; adjust based on deductions)
    taxable_value = invoice_data.get("taxable_value", 0.0)
    total_amount = invoice_data.get("total_amount", 0.0)
    tax_calculations["net_tax_payable"] = total_amount - taxable_value  # Should match total_tax_liability

    # Estimate ITC (can be refined with deduction_identifier.py)
    tax_calculations["input_tax_credit"] = taxable_value * 0.18  # Example: 18% ITC (adjust based on GST rules)

    # Validation
    if abs(tax_calculations["net_tax_payable"] - total_tax_liability) > 0.01:
        tax_calculations["notes"].append("Warning: Net tax payable does not match total tax liability.")

    return tax_calculations

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
        "igst_amount": 0.0
    }
    calculations = calculate_tax_liability(sample_invoice)
    print("Tax Calculations:", calculations)