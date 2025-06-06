import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import img1 from "../../../../Assets/logo_01.png";
import { useNavigate } from "react-router-dom";
import "../invoicecreate/invoice.css";

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDelhiSupplier, setIsDelhiSupplier] = useState(true);

  // Pagination constants - adjusted for better spacing
  const ITEMS_PER_PAGE = 20; // Reduced to allow more space for signatures
  const ITEMS_ON_FIRST_PAGE = 12; // Conservative number for first page

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication failed. Please log in.");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/get-pobyid/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch invoice data.");
        }

        setInvoiceData(data.data);
        setIsDelhiSupplier(
          data.data.supplierAddress.toLowerCase().includes("delhi")
        );
      } catch (err) {
        setError(err.message || "Failed to load invoice data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Improved chunking function with better space management
  const chunkItems = (items) => {
    if (!items || items.length === 0) return [[]];
    
    // If items fit on first page with space for signatures, keep them together
    if (items.length <= ITEMS_ON_FIRST_PAGE) {
      return [items];
    }
    
    // First chunk - conservative number to ensure space for signatures if needed
    const firstChunk = items.slice(0, ITEMS_ON_FIRST_PAGE);
    const remainingChunks = [];
    
    // Process remaining items
    for (let i = ITEMS_ON_FIRST_PAGE; i < items.length; i += ITEMS_PER_PAGE) {
      remainingChunks.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
    
    return [firstChunk, ...remainingChunks];
  };

  // Function to determine if signatures should be on current page
  const shouldShowSignatures = (pageIndex, totalPages, itemsOnCurrentPage) => {
    // Always show on last page
    if (pageIndex === totalPages - 1) return true;
    
    // Show on first page if it's the only page OR if items are few enough to fit comfortably
    if (pageIndex === 0 && (totalPages === 1 || itemsOnCurrentPage <= 10)) return true;
    
    return false;
  };

  const downloadInvoice = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageElements = document.querySelectorAll(".page-content");
      
      if (pageElements.length === 0) {
        console.error("No pages found");
        return;
      }

      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        backgroundColor: '#FFFFFF',
        windowHeight: 1123,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            body { margin: 0; padding: 0; }
            .pdf-text-content {
              display: inline-block;
              width: 100%;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .signature-image-wrapper img {
              max-width: 100%;
              height: auto;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      };
      
      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i];
        
        pageElement.style.display = 'block';
        pageElement.style.margin = '0';
        pageElement.style.padding = '0';
        
        const canvas = await html2canvas(pageElement, options);
        const imgData = canvas.toDataURL("image/png", 1.0);
        
        const imgWidth = 190;
        const pageHeight = 277;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(
          imgData, 
          "PNG", 
          10,
          10,
          imgWidth, 
          Math.min(imgHeight, pageHeight)
        );
      }

      pdf.save(`invoice_${invoiceData.poNo}.pdf`);

      setTimeout(() => {
        navigate("/admin/get-invoice");
      }, 5000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Signature component for reusability
  const SignatureSection = () => (
    <div className="grid grid-cols-3 gap-4 mt-16">
      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">Prepared By:</div>
          <div
            className="signature-image-wrapper border border-none flex items-center justify-center"
            style={{ width: "7cm", height: "3cm" }}
          >
            {invoiceData.preparedBySignature && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/signatures/${invoiceData.preparedBySignature.split("/").pop()}`}
                alt="Prepared By Signature"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-signature.png";
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">Verified By:</div>
          <div
            className="signature-image-wrapper border border-none flex items-center justify-center"
            style={{ width: "7cm", height: "3cm" }}
          >
            {invoiceData.verifiedBySignature && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/signatures/${invoiceData.verifiedBySignature.split("/").pop()}`}
                alt="Verified By Signature"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-signature.png";
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">Authorized By:</div>
          <div
            className="signature-image-wrapper border border-none flex items-center justify-center"
            style={{ width: "7cm", height: "3cm" }}
          >
            {invoiceData.authorizedSignature && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/signatures/${invoiceData.authorizedSignature.split("/").pop()}`}
                alt="Authorized Signature"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-signature.png";
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Terms and conditions component
  const TermsAndConditions = () => (
    <div className="border border-black p-4">
      <div className="text-lg font-bold mb-4">Terms and Condition</div>
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="p-2 align-top w-8">1.</td>
            <td className="p-2 font-semibold">
              Mandatory Documents : Please provide valid documentation with the delivery.
            </td>
          </tr>
          <tr>
            <td className="p-2 align-top">2.</td>
            <td className="p-2 font-semibold">
              Commercial original invoice is required for payment processing.
            </td>
          </tr>
          <tr>
            <td className="p-2 align-top">3.</td>
            <td className="p-2 font-semibold">
              Guarantee / Warranty certificate is required for delivered products.
            </td>
          </tr>
          <tr>
            <td className="p-2 align-top w-8">4.</td>
            <td className="p-2 font-semibold">
              If there is any defect in the Material, Replacement will be done Immediately, 
              Otherwise Payment will be made after debiting the amount of defective Part.
            </td>
          </tr>
          <tr>
            <td className="p-2 align-top w-8">5.</td>
            <td className="p-2 font-semibold">
              Courier charges of defective part will be bare by supplier
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;
  if (!invoiceData) return <div className="p-8">No invoice found</div>;

  const itemChunks = chunkItems(invoiceData.items);
  const totalPages = itemChunks.length;

  return (
    <div className="p-8" style={{ backgroundColor: "gray" }}>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">View Purchase Order</h1>
        <button
          onClick={downloadInvoice}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Download as PDF
        </button>
      </div>

      <div
        className="w-full p-4 relative"
        style={{ backgroundColor: "white", color: "black" }}
        id="printable-invoice"
      >
        {/* Page 1 - Header and Company Info */}
        <div className="page-content relative" style={{ minHeight: "297mm", pageBreakAfter: totalPages > 1 ? "always" : "auto" }}>
          {/* Page Number */}
          <div className="flex justify-end absolute bottom-0 right-0 mb-4 mr-4">
            <span className="text-sm font-semibold">Page 1 of {totalPages}</span>
          </div>

          <div className="flex flex-col items-center mb-4">
            <div className="h-26 flex items-center justify-center mr-4 p-2">
              <img
                src={img1}
                alt="Company Logo"
                className="h-20 object-cover rounded-full"
              />
            </div>
            <div className="flex flex-center">
              <h2 className="text-xl font-bold text-black">Purchase Order-</h2>
              <div className="text-xl font-bold" style={{ color: '#11599c', borderBottom: '1px solid #11599c' }}>
                PO Number: {invoiceData.poNo}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-black p-2">
              <h3 className="font-semibold">To,</h3>
              <div className="w-full min-h-8 text-black font-semibold">
                {invoiceData.supplierAddress}
              </div>
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-black">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Supplier:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.supplier}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Contact Person:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.contactPerson}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Contact No:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.contactNo}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">WhatsApp No:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.whatsappNo}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Email:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.email}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">PR NO:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.prNo}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Payment Terms:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.paymentTerms}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">GST No:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.gstNo}</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-semibold border-r border-black">Supplier GST:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.supplierGST}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-black">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Supplier Offer Date:</td>
                    <td className="p-1 text-left font-semibold">{formatDate(invoiceData.supplierOfferDate)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Date:</td>
                    <td className="p-1 text-left font-semibold">{formatDate(invoiceData.date)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Ref No:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.refNo}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Validity:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.validity}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Supplier Offer No.:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.supplierOfferNo}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Delivery Period:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.deliveryPeriod}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Transportation:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.transportation}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Pan No:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.panNo}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-semibold border-r border-black">Purchase Request:</td>
                    <td className="p-1 text-left font-semibold">{invoiceData.purchaseRequest}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-lg font-bold mb-1">Invoice and Delivery Information</div>
            <div className="grid grid-cols-2">
              <div className="border border-black p-2">
                <h3 className="font-bold mb-2">Invoice Address:</h3>
                <p className="font-semibold">{invoiceData.invoiceAddress}</p>
              </div>
              <div className="border border-black p-2">
                <h3 className="font-bold mb-2">Delivery Address:</h3>
                <p className="font-semibold">{invoiceData.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Material and Pricing - First Page */}
          <div className="overflow-x-auto">
            <div className="text-lg font-bold mb-1">Material and Pricing</div>
            <table className="min-w-full border border-black">
              <thead>
                <tr>
                  <th className="border border-black p-2 w-12">S.No</th>
                  <th className="border border-black p-2 w-24">ItemCode</th>
                  <th className="border border-black p-2 w-1/4">Product Name</th>
                  <th className="border border-black p-2 w-1/3">Description</th>
                  <th className="border border-black p-2 w-20">Units</th>
                  <th className="border border-black p-2 w-20">Rate</th>
                  <th className="border border-black p-2 w-20">Quantity</th>
                  {isDelhiSupplier ? (
                    <>
                      <th className="border border-black p-2 w-20">CGST (%)</th>
                      <th className="border border-black p-2 w-20">SGST (%)</th>
                    </>
                  ) : (
                    <th className="border border-black p-2 w-20">IGST (%)</th>
                  )}
                  <th className="border border-black p-2 w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {itemChunks[0]?.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-black p-2 text-center">{index + 1}</td>
                    <td className="border border-black p-2 text-center">{item.itemcode}</td>
                    <td className="border border-black p-2 text-center font-semibold">{item.productname}</td>
                    <td className="border border-black p-2 text-center font-semibold">{item.description}</td>
                    <td className="border border-black p-2 text-center font-semibold">{item.units}</td>
                    <td className="border border-black p-2 text-center font-semibold">{item.rate.toFixed(2)}</td>
                    <td className="border border-black p-2 text-center font-semibold">{item.quantity}</td>
                    {isDelhiSupplier ? (
                      <>
                        <td className="border border-black p-2 text-center font-semibold">{item.cgst}%</td>
                        <td className="border border-black p-2 text-center font-semibold">{item.sgst}%</td>
                      </>
                    ) : (
                      <td className="border border-black p-2 text-center">{item.igst}%</td>
                    )}
                    <td className="border border-black p-2 text-center font-semibold">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show totals, terms and signatures on first page if conditions are met */}
          {shouldShowSignatures(0, totalPages, itemChunks[0]?.length || 0) && (
            <>
              <div className="flex flex justify-start border border-black p-1 mt-4">
                <div className="font-bold">
                  Total Amount: {parseFloat(invoiceData.totalAmount).toFixed(2)}
                </div>
              </div>

              <div className="border border-black flex items-center justify-start gap-4">
                <div className="font-semi-bold">Amount in Words:</div>
                <div className="font-bold">{invoiceData.amountInWords}</div>
              </div>

              <TermsAndConditions />
              <SignatureSection />
            </>
          )}
        </div>

        {/* Additional Pages for Items */}
        {itemChunks.slice(1).map((chunk, pageIndex) => (
          <div key={pageIndex + 1} className="page-break page-content" style={{ minHeight: "297mm", pageBreakAfter: pageIndex === itemChunks.length - 2 ? "auto" : "always" }}>
        <div className="flex justify-end absolute bottom-0 right-0 mb-4 mr-4">
              <span className="text-sm font-semibold">Page {pageIndex + 2} of {totalPages}</span>
            </div>

            {/* Material Table Continuation */}
            <div className="overflow-x-auto">
              <div className="text-lg font-bold mb-1">Material and Pricing (Continued)</div>
              <table className="min-w-full border border-black">
                <thead>
                  <tr>
                    <th className="border border-black p-2 w-12">S.No</th>
                    <th className="border border-black p-2 w-24">ItemCode</th>
                    <th className="border border-black p-2 w-1/4">Product Name</th>
                    <th className="border border-black p-2 w-1/3">Description</th>
                    <th className="border border-black p-2 w-20">Units</th>
                    <th className="border border-black p-2 w-20">Rate</th>
                    <th className="border border-black p-2 w-20">Quantity</th>
                    {isDelhiSupplier ? (
                      <>
                        <th className="border border-black p-2 w-20">CGST (%)</th>
                        <th className="border border-black p-2 w-20">SGST (%)</th>
                      </>
                    ) : (
                      <th className="border border-black p-2 w-20">IGST (%)</th>
                    )}
                    <th className="border border-black p-2 w-32">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((item, index) => {
                    const globalIndex = ITEMS_ON_FIRST_PAGE + (pageIndex * ITEMS_PER_PAGE) + index + 1;
                    
                    return (
                      <tr key={item.id}>
                        <td className="border border-black p-2 text-center">{globalIndex}</td>
                        <td className="border border-black p-2 text-center">{item.itemcode}</td>
                        <td className="border border-black p-2 text-center font-semibold">{item.productname}</td>
                        <td className="border border-black p-2 text-center font-semibold">{item.description}</td>
                        <td className="border border-black p-2 text-center font-semibold">{item.units}</td>
                        <td className="border border-black p-2 text-center font-semibold">{item.rate.toFixed(2)}</td>
                        <td className="border border-black p-2 text-center font-semibold">{item.quantity}</td>
                        {isDelhiSupplier ? (
                          <>
                            <td className="border border-black p-2 text-center font-semibold">{item.cgst}%</td>
                            <td className="border border-black p-2 text-center font-semibold">{item.sgst}%</td>
                          </>
                        ) : (
                          <td className="border border-black p-2 text-center">{item.igst}%</td>
                        )}
                        <td className="border border-black p-2 text-center font-semibold">{item.total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Show totals, terms and signatures only on the last page */}
            {shouldShowSignatures(pageIndex + 1, totalPages, chunk.length) && (
              <>
                <div className="flex flex justify-start border border-black p-1 mt-4">
                  <div className="font-bold">
                    Total Amount: {parseFloat(invoiceData.totalAmount).toFixed(2)}
                  </div>
                </div>

                <div className="border border-black flex items-center justify-start gap-4">
                  <div className="font-semi-bold">Amount in Words:</div>
                  <div className="font-bold">{invoiceData.amountInWords}</div>
                </div>

                <TermsAndConditions />
                <SignatureSection />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewInvoice;