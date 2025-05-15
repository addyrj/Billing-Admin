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

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication failed. Please log in.");
        }
  
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-pobyid/${id}`, {
          // mode: 'no-cors',
          headers: {
            "Authorization": `Bearer ${token}`,
            
            "Content-Type": "application/json",
          },
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch invoice data.");
        }
  
        setInvoiceData(data.data); // Ensure data.data exists
        setIsDelhiSupplier(data.data.supplierAddress.toLowerCase().includes("delhi"));
      } catch (err) {
        setError(err.message || "Failed to load invoice data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchInvoiceData();
  }, [id]);
  

  const downloadInvoice = async () => {
    const element = document.getElementById("printable-invoice");
    if (!element) return;
  
    const options = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      letterRendering: true,
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
  
    try {
      const canvas = await html2canvas(element, options);
      const imgData = canvas.toDataURL("image/png", 1.0);
  
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 0);
      pdf.save(`invoice_${invoiceData.poNo}.pdf`);
  
      // Redirect after 10 seconds
      setTimeout(() => {
        navigate("/admin/get-invoice");
      }, 5000); // 10,000 milliseconds = 10 seconds
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;
  if (!invoiceData) return <div className="p-8">No invoice found</div>;

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
        className="w-full p-4"
        style={{ backgroundColor: "white", color: "black" }}
        id="printable-invoice"
      >
        <div className="flex flex-col items-center mb-4">
          <div className="h-26 flex items-center justify-center mr-4 p-2">
            <img
              src={img1}
              alt="Company Logo"
              className="h-20 object-cover rounded-full"
            />
          </div>
          <div className="flex flex-center">
            <h2 className="text-xl font-bold text-black">Purchase Order</h2>
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
  <td className="p-1 text-left font-semibold">
    {invoiceData.supplier}
  </td>
</tr>



                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Contact Person:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.contactPerson}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Contact No:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.contactNo}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Email:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.email}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">PR NO:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.prNo}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Supplier Offer Date:</td>
                  <td className="p-1 text-left font-semibold">
                    {new Date(invoiceData.supplierOfferDate).toLocaleDateString()}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Payment Terms:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.paymentTerms}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">GST No:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.gstNo}
                  </td>
                </tr>
                <tr>
                  <td className="p-1 font-semibold border-r border-black">Supplier GST:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.supplierGST}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-black">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">PO NO.:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.poNo}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Date:</td>
                  <td className="p-1 text-left font-semibold">
                    {new Date(invoiceData.date).toLocaleDateString()}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Ref No:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.refNo}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Validity:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.validity}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Supplier Offer No.:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.supplierOfferNo}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Delivery Period:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.deliveryPeriod}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Transportation:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.transportation}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Pan No:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.panNo}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold border-r border-black">Purchase Request:</td>
                  <td className="p-1 text-left font-semibold">
                    {invoiceData.purchaseRequest}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-lg font-bold mb-1">
            Invoice and Delivery Information
          </div>
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

        <div className="overflow-x-auto">
          <div className="text-lg font-bold mb-1">Material and Pricing</div>
          <table className="min-w-full border border-black">
            <thead>
              <tr className="">
                <th className="border border-black p-2 w-12">S.No</th>
                <th className="border border-black p-2 w-1/5">Product Name</th>
                <th className="border border-black p-2 w-1/4">Description</th>
                <th className="border border-black p-2 w-32">Units</th>
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
              {invoiceData.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2 text-center font-semibold">
                    {item.productname}
                  </td>
                  <td className="border border-black p-2 text-center font-semibold">
                    {item.description}
                  </td>
                  <td className="border border-black p-2 text-center font-semibold">
                    {item.units}
                  </td>
                  <td className="border border-black p-2 text-center font-semibold">
                    {item.rate.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center font-semibold">
                    {item.quantity}
                  </td>
                  {isDelhiSupplier ? (
                    <>
                      <td className="border border-black p-2 text-center font-semibold">
                        {item.cgst}%
                      </td>
                      <td className="border border-black p-2 text-center font-semibold">
                        {item.sgst}%
                      </td>
                    </>
                  ) : (
                    <td className="border border-black p-2 text-center">
                      {item.igst}%
                    </td>
                  )}
                  <td className="border border-black p-2 text-center font-semibold">
                    {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex justify-start border border-black p-1 -start">
          <div className="font-bold">
            Total Amount: {parseFloat(invoiceData.totalAmount).toFixed(2)}
          </div>
        </div>

        <div className="border border-black flex items-center justify-start gap-4 ">
          <div className="font-semi-bold">Amount in Words:</div>
          <div className="font-bold">{invoiceData.amountInWords}</div>
        </div>

        <div className="border border-black p-4">
          <div className="text-lg font-bold mb-1">Terms and Condition</div>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="p-1 align-top w-8">1</td>
                <td className="p-1 font-semibold">
                  Mandatory Documents : Please provide valid documentation with
                  the delivery.
                </td>
              </tr>
              <tr>
                <td className="p-1 align-top">2</td>
                <td className="p-1 font-semibold">
                  Commercial original invoice is required for payment
                  processing.
                </td>
              </tr>
              <tr>
                <td className="p-1 align-top">3</td>
                <td className="p-1 font-semibold">
                  Guarantee / Warranty certificate is required for delivered
                  products.
                </td>
              </tr>
              <tr>
                <td className="p-1 align-top w-8">4</td>
                <td className="p-1 font-semibold">
                If there is any defect in the Material, Replacement will be done Immediately, Otherwise Payment will be made after debiting the amount of defective Part.
                </td>
              </tr>
              <tr>
                <td className="p-1 align-top w-8">5</td>
                <td className="p-1 font-semibold">
                Courier charges of defective part will be bare by supplier
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="signature-container text-center flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="mb-2 font-bold w-24 text-right">Prepared By:</div>
              <div
                className="signature-image-wrapper border border-none flex items-center justify-center"
                style={{ width: "7cm", height: "3cm" }}
              >
               {invoiceData.preparedBySignature && (
  <img
    src={`${import.meta.env.VITE_API_BASE_URL}/signatures/${invoiceData.preparedBySignature.split('/').pop()}`}
    alt="Prepared By Signature"
    className="w-full h-full object-contain"
    onError={(e) => {
      e.target.onerror = null; 
      e.target.src = '/placeholder-signature.png';
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
    src={`${import.meta.env.VITE_API_BASE_URL}/signatures/${invoiceData.verifiedBySignature.split('/').pop()}`}
    alt="Verified By Signature"
    className="w-full h-full object-contain"
    onError={(e) => {
      e.target.onerror = null; 
      e.target.src = '/placeholder-signature.png';
    }}
  />
)}
              </div>
            </div>
          </div>

          <div className="signature-container text-center flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="mb-2 font-bold w-24 text-right">
                Authorized By:
              </div>
              <div
                className="signature-image-wrapper border border-none flex items-center justify-center"
                style={{ width: "7cm", height: "3cm" }}
              >
              {invoiceData.authorizedSignature && (
  <img
    src={`${import.meta.env.VITE_API_BASE_URL}/signatures/${invoiceData.authorizedSignature.split('/').pop()}`}
    alt="Authorized Signature"
    className="w-full h-full object-contain"
    onError={(e) => {
      e.target.onerror = null; 
      e.target.src = '/placeholder-signature.png';
    }}
  />
)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;