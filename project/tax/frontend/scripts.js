// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('invoiceUpload');
    const uploadStatus = document.getElementById('uploadStatus');
    const invoiceData = document.getElementById('invoiceData');
    const reportStatus = document.getElementById('reportStatus');
    const downloadLinks = document.getElementById('downloadLinks');

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        uploadStatus.textContent = `Uploading ${file.name}...`;
        const formData = new FormData();
        formData.append('invoice', file);

        try {
            const response = await fetch('http://localhost:5000/process-invoice', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.error) {
                uploadStatus.textContent = `Error: ${data.error}`;
                return;
            }
            uploadStatus.textContent = 'Upload successful!';
            displayInvoiceData(data.invoice_data);
            displayDownloadLinks(data.outputs);
        } catch (error) {
            uploadStatus.textContent = `Error uploading file: ${error.message}`;
        }
    }

    function displayInvoiceData(data) {
        invoiceData.innerHTML = `
            <h3>Invoice Data</h3>
            <p><strong>Invoice No:</strong> ${data.invoice_no || 'N/A'}</p>
            <p><strong>Date:</strong> ${data.date || 'N/A'}</p>
            <p><strong>Total Amount:</strong> ${data.total_amount || 'N/A'}</p>
            <p><strong>Tax Details:</strong> ${JSON.stringify(data.tax_details) || 'N/A'}</p>
            <p><strong>Input Tax Credit:</strong> ${data.input_tax_credit || 'N/A'}</p>
            <p><strong>Business Expenses:</strong> ${data.business_expenses || 'N/A'}</p>
            <p><strong>Total Tax Liability:</strong> ${data.total_tax_liability || 'N/A'}</p>
            <p><strong>Net Tax Payable:</strong> ${data.net_tax_payable || 'N/A'}</p>
            ${data.validation_report.errors.length ? `<p style="color: red;">Errors: ${data.validation_report.errors.join(', ')}</p>` : ''}
            ${data.validation_report.warnings.length ? `<p style="color: orange;">Warnings: ${data.validation_report.warnings.join(', ')}</p>` : ''}
        `;
    }

    function displayDownloadLinks(outputs) {
        downloadLinks.innerHTML = `
            <h3>Download Outputs</h3>
            <p>Click the buttons below to download your reports:</p>
        `;
    }

    async function processInvoice() {
        try {
            const response = await fetch('http://localhost:5000/process-invoice', { method: 'POST' });
            const data = await response.json();
            if (data.error) {
                uploadStatus.textContent = `Error: ${data.error}`;
                return;
            }
            displayInvoiceData(data.invoice_data);
            displayDownloadLinks(data.outputs);
            uploadStatus.textContent = 'Invoice processed successfully!';
        } catch (error) {
            uploadStatus.textContent = `Error processing invoice: ${error.message}`;
        }
    }

    async function downloadReport(format) {
        try {
            const invoiceNo = document.querySelector('#invoiceData p:nth-child(2)').textContent.split(': ')[1] || 'unknown';
            const response = await fetch(`http://localhost:5000/download-report/${format}/${invoiceNo}`, {
                method: 'GET'
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tax_output_${invoiceNo}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            reportStatus.textContent = `Report downloaded as ${format.toUpperCase()}!`;
        } catch (error) {
            reportStatus.textContent = `Error downloading report: ${error.message}`;
        }
    }

    window.handleFileUpload = handleFileUpload;
    window.processInvoice = processInvoice;
    window.downloadReport = downloadReport;
});