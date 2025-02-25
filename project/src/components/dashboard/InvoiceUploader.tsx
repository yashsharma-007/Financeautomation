import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { invoiceStorage, StoredInvoice } from "../../utils/localStorage";

const InvoiceUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedInvoices = invoiceStorage.getAll();
    setInvoices(storedInvoices);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const extractTextFromImage = async (file: File) => {
    try {
      const { data } = await Tesseract.recognize(file, "eng");
      return data.text;
    } catch (error) {
      console.error("OCR Extraction Failed:", error);
      return null;
    }
  };

  const parseInvoiceData = (text: string) => {
    const invoiceNoMatch = text.match(/Invoice\s*No[:\s]+(\S+)/i);
    const gstinMatch = text.match(/GSTIN[:\s]+([A-Z0-9]+)/i);
    const amountMatch = text.match(/Total\s*Amount[:\s]*₹?(\d+[,.\d]*)/i);
    const taxMatch = text.match(/Tax\s*Amount[:\s]*₹?(\d+[,.\d]*)/i);
    const dateMatch = text.match(/Date[:\s]+(\d{2}[-/]\d{2}[-/]\d{4})/i);

    return {
      invoiceNo: invoiceNoMatch ? invoiceNoMatch[1] : "N/A",
      gstin: gstinMatch ? gstinMatch[1] : "N/A",
      amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0,
      taxAmount: taxMatch ? parseFloat(taxMatch[1].replace(/,/g, "")) : 0,
      date: dateMatch ? dateMatch[1] : "N/A",
    };
  };

  const processInvoice = async (file: File) => {
    const invoice: StoredInvoice = {
      id: crypto.randomUUID(),
      fileName: file.name,
      status: "processing",
      createdAt: new Date().toISOString(),
    };

    invoiceStorage.add(invoice);
    setInvoices((prev) => [...prev, invoice]);

    if (file.type.startsWith("image/")) {
      const text = await extractTextFromImage(file);
      if (text) {
        const extractedData = parseInvoiceData(text);
        const updatedInvoice = { ...invoice, status: "completed", data: extractedData };
        invoiceStorage.update(updatedInvoice.id, updatedInvoice);
        setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processInvoice);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processInvoice);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeInvoice = (id: string) => {
    invoiceStorage.remove(id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Invoice Upload & Processing</h2>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Drag & Drop Invoices Here</h3>
        <p className="text-sm text-gray-500 mb-4">Support for image files (JPG, PNG)</p>
        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
        <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Select Files
        </button>
      </div>

      {invoices.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="font-medium text-gray-900">Processing Queue</h3>
          {invoices.map((invoice) => (
            <div key={invoice.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">{invoice.fileName}</h4>
                    {invoice.status === "completed" && invoice.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Invoice No: {invoice.data.invoiceNo}</p>
                        <p>GSTIN: {invoice.data.gstin}</p>
                        <p>Amount: ₹{invoice.data.amount.toLocaleString()}</p>
                        <p>Tax Amount: ₹{invoice.data.taxAmount.toLocaleString()}</p>
                        <p>Date: {invoice.data.date}</p>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => removeInvoice(invoice.id)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {invoice.status === "completed" && (
                <div className="mt-3 flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">Processing complete</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceUploader;
