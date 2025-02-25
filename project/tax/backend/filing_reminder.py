from datetime import datetime, timedelta
import schedule
import time

def setup_enhanced_reminders(invoice_data):
    """
    Set up reminders for GSTR-1, GSTR-3B, and other deadlines based on invoice date and GSTIN state.
    """
    invoice_date = datetime.strptime(invoice_data.get("date", ""), "%d-%m-%Y")
    gstin_state = invoice_data.get("customer_gstin", "")[:2] if invoice_data.get("customer_gstin") else "01"  # Default to state 01 (J&K)

    def remind_gstr1():
        gstr1_deadline = invoice_date.replace(day=11, month=invoice_date.month + 1) if invoice_date.day <= 10 else invoice_date.replace(day=11, month=invoice_date.month + 2)
        if gstr1_deadline < datetime.now():
            gstr1_deadline = gstr1_deadline.replace(year=gstr1_deadline.year + 1)
        print(f"Reminder: File GSTR-1 by {gstr1_deadline.strftime('%d-%m-%Y')} for invoice {invoice_data.get('invoice_no', '')}!")

    def remind_gstr3b():
        gstr3b_deadline = invoice_date.replace(day=20, month=invoice_date.month + 1) if invoice_date.day <= 20 else invoice_date.replace(day=20, month=invoice_date.month + 2)
        if gstr3b_deadline < datetime.now():
            gstr3b_deadline = gstr3b_deadline.replace(year=gstr3b_deadline.year + 1)
        print(f"Reminder: File GSTR-3B by {gstr3b_deadline.strftime('%d-%m-%Y')} for invoice {invoice_data.get('invoice_no', '')}!")

    # Schedule daily reminders at 9:00 AM
    schedule.every().day.at("09:00").do(remind_gstr1)
    schedule.every().day.at("09:00").do(remind_gstr3b)

    # Filing checklist
    checklist = [
        "Verify extracted invoice data",
        "Generate JSON/Excel files",
        "Calculate deductions and tax liability",
        "Validate data for errors",
        "Upload to GST portal",
        "Confirm filing deadlines"
    ]
    print("Filing Checklist:")
    for item in checklist:
        print(f"- {item}")

    # Run scheduler for 10 seconds to demonstrate
    print("\nRunning scheduler for 10 seconds...")
    end_time = time.time() + 10
    while time.time() < end_time:
        schedule.run_pending()
        time.sleep(1)

# Example usage
if __name__ == "__main__":
    # Mock invoice data (replace with actual invoice_data from app.py)
    sample_invoice = {
        "invoice_no": "80XBoEZ0-8BP000",
        "date": "26-02-2025",
        "customer_gstin": "22AAAAA0000A1Z5"
    }
    setup_enhanced_reminders(sample_invoice)