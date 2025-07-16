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
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
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
    if (pageIndex === 0 && (totalPages === 1 || itemsOnCurrentPage <= 10))
      return true;

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
        backgroundColor: "#FFFFFF",
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

        pageElement.style.display = "block";
        pageElement.style.margin = "0";
        pageElement.style.padding = "0";

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

  // Flexible Page Number Component
  const PageNumber = ({ currentPage, totalPages }) => (
    <div className="flex justify-end w-full mt-auto pt-4">
      <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );

  // Signature component for reusability
  const SignatureSection = () => (
    <div className="flex justify-between items-start space-x-3 mt-10 text-[15px]">
      {[
        { label: "Prepared By", src: invoiceData.preparedBySignature },
        { label: "Verified By", src: invoiceData.verifiedBySignature },
        { label: "Authorized By", src: invoiceData.authorizedSignature },
      ].map(({ label, src }, index) => (
        <div key={index} className="text-center">
          {/* Bigger, bolder label */}
          <div className="text-[16px] font-bold mb-2">{label}</div>

          {/* Signature box without border */}
          <div className="w-[6.5cm] h-[2.7cm] flex items-center justify-center">
            {src ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/signatures/${src
                  .split("/")
                  .pop()}`}
                alt={`${label} Signature`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-signature.png";
                }}
              />
            ) : (
              <span className="text-sm text-gray-400 italic">No Signature</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Terms and conditions component
  const TermsAndConditions = () => (
    <div className="border border-black p-5 mt-10 rounded">
      <div className="text-xl font-bold mb-4">Terms and Conditions</div>
      <table className="w-full text-[15px]">
        <tbody>
          {[
            "Mandatory Documents: Please provide valid documentation with the delivery.",
            "Commercial original invoice is required for payment processing.",
            "Guarantee / Warranty certificate is required for delivered products.",
            "If there is any defect in the Material, Replacement will be done immediately, otherwise payment will be made after debiting the amount of defective part.",
            "Courier charges of defective part will be borne by supplier.",
          ].map((text, i) => (
            <tr key={i}>
              <td className="align-top pr-2 font-bold text-gray-700 w-6">
                {i + 1}.
              </td>
              <td className="py-1 text-gray-800 font-medium">{text}</td>
            </tr>
          ))}
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
        <div
          className="page-content flex flex-col"
          style={{
            minHeight: "297mm",
            pageBreakAfter: totalPages > 1 ? "always" : "auto",
          }}
        >
          {/* Main content */}
          <div className="flex-grow">
            <div className="flex flex-col items-center mb-4">
              <div className="h-26 flex items-center justify-center mr-4 p-2">
                <img
                  src={img1}
                  alt="Company Logo"
                  className="h-20 object-cover rounded-full"
                />
              </div>
              <div className="flex flex-center">
                <h2 className="text-xl font-bold text-black" style={{ color: '#11599c', borderBottom: '1px solid #11599c' }}>Purchase Order - IOTTECH</h2>
                {/* <div className="text-xl font-bold" style={{ color: '#11599c', borderBottom: '1px solid #11599c' }}>
                  PO Number: {invoiceData.poNo}
                </div> */}
              </div>
            </div>
            {/* To Address Section */}
            <div className="grid grid-cols-2 gap-4 mb-2 text-base">
              <div className="border border-black rounded p-3">
                <h3 className="font-semibold mb-1">To,</h3>
                <div className="text-gray-900 whitespace-pre-line font-medium leading-relaxed">
                  {invoiceData.supplierAddress}
                </div>
              </div>
              <div></div>
            </div>

            {/* Supplier Info & PO Info - Tighter Padding & No Gap Between Tables */}
            <div className="grid grid-cols-2 gap-0 mb-4 text-[15px]">
              {/* Supplier Info */}
            <div className="border border-black rounded overflow-hidden">
  <table className="w-full text-[15px]">
    <tbody>
      {[
        ["Supplier:", invoiceData.supplier],
        ["Contact Person:", invoiceData.contactPerson],
        ["Contact No:", invoiceData.contactNo],
        ["WhatsApp No:", invoiceData.whatsappNo],
        ["Email:", invoiceData.email],
        ["PR NO:", invoiceData.prNo],
        ["Payment Terms:", invoiceData.paymentTerms],
        ["GST No:", invoiceData.gstNo],
        ["Supplier GST:", invoiceData.supplierGST],
      ].map(([label, value], i, arr) => (
        <tr
          key={label}
          className={`${i !== arr.length - 1 ? "border-b border-black" : ""}`}
        >
          <td className="px-3 py-1 font-semibold border-r border-black w-1/2">
            {label}
          </td>
          <td className="px-3 py-1 text-gray-900 whitespace-pre-line font-medium leading-relaxed">
            {value}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


              {/* Purchase Order Info */}
              <div className="border border-black rounded overflow-hidden">
                <table className="w-full text-[15px]">
                  <tbody>
                    {[
                      ["Purchase Order", invoiceData.poNo],
                      [
                        "Supplier Offer Date:",
                        formatDate(invoiceData.supplierOfferDate),
                      ],
                      ["Date:", formatDate(invoiceData.date)],
                      ["Ref No:", invoiceData.refNo],
                      ["Validity:", invoiceData.validity],
                      ["Supplier Offer No.:", invoiceData.supplierOfferNo],
                      ["Delivery Period:", invoiceData.deliveryPeriod],
                      ["Transportation:", invoiceData.transportation],
                      ["Pan No:", invoiceData.panNo],
                      ["Purchase Request:", invoiceData.purchaseRequest],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-black">
                        <td className="px-3 py-1 font-semibold border-r border-black w-1/2">
                          {label}
                        </td>
                        <td className="px-3 py-1 text-gray-900 whitespace-pre-line font-medium leading-relaxed">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4 border border-black rounded overflow-hidden">
              {/* Section Header */}
              <div className="bg-[#f5f7fa] px-4 py-2 border-b border-black">
                <h2 className="text-lg font-bold text-gray-800">
                  Invoice and Delivery Information
                </h2>
              </div>

              {/* Address Grid */}
              <div className="grid grid-cols-2 divide-x divide-black">
                {/* Invoice Address */}
                <div className="p-4">
                  <h3 className="font-semibold text-base text-gray-700 mb-2">
                    Invoice Address:
                  </h3>
                  <p className="text-base font-medium text-gray-900 whitespace-pre-line">
                    {invoiceData.invoiceAddress}
                  </p>
                </div>

                {/* Delivery Address */}
                <div className="p-4">
                  <h3 className="font-semibold text-base text-gray-700 mb-2">
                    Delivery Address:
                  </h3>
                  <p className="text-base font-medium text-gray-900 whitespace-pre-line">
                    {invoiceData.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Material and Pricing - First Page */}
            <div className="overflow-x-auto mb-4">
              <div className="text-xl font-bold text-gray-800 mb-2">
                Material and Pricing
              </div>

              <table className="min-w-full border border-black text-sm text-gray-900">
                <thead>
                  <tr className="bg-[#355f75] text-white">
                    <th className="border border-black px-2 py-1 w-12">S.No</th>
                    <th className="border border-black px-2 py-1 w-24">
                      Item Code
                    </th>
                    <th className="border border-black px-2 py-1 w-1/4">
                      Product Name
                    </th>
                    <th className="border border-black px-2 py-1 w-1/3">
                      Description
                    </th>
                    <th className="border border-black px-2 py-1 w-20">
                      Units
                    </th>
                    <th className="border border-black px-2 py-1 w-20">Rate</th>
                    <th className="border border-black px-2 py-1 w-20">
                      Quantity
                    </th>
                    {isDelhiSupplier ? (
                      <>
                        <th className="border border-black px-2 py-1 w-20">
                          CGST (%)
                        </th>
                        <th className="border border-black px-2 py-1 w-20">
                          SGST (%)
                        </th>
                      </>
                    ) : (
                      <th className="border border-black px-2 py-1 w-20">
                        IGST (%)
                      </th>
                    )}
                    <th className="border border-black px-2 py-1 w-32">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {itemChunks[0]?.map((item, index) => (
                    <tr key={item.id} className="even:bg-gray-50">
                      <td className="border border-black px-2 py-1 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.itemcode}
                      </td>
                      <td className="border border-black px-2 py-1 font-medium text-center">
                        {item.productname}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.description}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.units}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.rate.toFixed(2)}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.quantity}
                      </td>
                      {isDelhiSupplier ? (
                        <>
                          <td className="border border-black px-2 py-1 text-center">
                            {item.cgst}%
                          </td>
                          <td className="border border-black px-2 py-1 text-center">
                            {item.sgst}%
                          </td>
                        </>
                      ) : (
                        <td className="border border-black px-2 py-1 text-center">
                          {item.igst}%
                        </td>
                      )}
                      <td className="border border-black px-2 py-1 text-center font-semibold">
                        ₹{item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Show totals, terms and signatures on first page if conditions are met */}
            {shouldShowSignatures(
              0,
              totalPages,
              itemChunks[0]?.length || 0
            ) && (
              <>
                <div className="flex flex justify-start border border-black p-1 mt-4">
                  <div className="font-bold">
                    Total Amount:{" "}
                    {parseFloat(invoiceData.totalAmount).toFixed(2)}
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

          {/* Page Number */}
          <PageNumber currentPage={1} totalPages={totalPages} />
        </div>

        {/* Additional Pages for Items */}
        {itemChunks.slice(1).map((chunk, pageIndex) => (
          <div
            key={pageIndex + 1}
            className="page-break page-content flex flex-col"
            style={{
              minHeight: "297mm",
              pageBreakAfter:
                pageIndex === itemChunks.length - 2 ? "auto" : "always",
            }}
          >
            {/* Main content */}
            <div className="flex-grow">
              {/* Material Table Continuation */}
              <div className="overflow-x-auto mb-4">
                <div className="text-xl font-bold text-gray-800 mb-2">
                  Material and Pricing (Continued)
                </div>

              
              <table className="min-w-full border border-black text-sm text-gray-900">
                <thead>
                  <tr className="bg-[#355f75] text-white">
                    <th className="border border-black px-2 py-1 w-12">S.No</th>
                    <th className="border border-black px-2 py-1 w-24">
                      Item Code
                    </th>
                    <th className="border border-black px-2 py-1 w-1/4">
                      Product Name
                    </th>
                    <th className="border border-black px-2 py-1 w-1/3">
                      Description
                    </th>
                    <th className="border border-black px-2 py-1 w-20">
                      Units
                    </th>
                    <th className="border border-black px-2 py-1 w-20">Rate</th>
                    <th className="border border-black px-2 py-1 w-20">
                      Quantity
                    </th>
                    {isDelhiSupplier ? (
                      <>
                        <th className="border border-black px-2 py-1 w-20">
                          CGST (%)
                        </th>
                        <th className="border border-black px-2 py-1 w-20">
                          SGST (%)
                        </th>
                      </>
                    ) : (
                      <th className="border border-black px-2 py-1 w-20">
                        IGST (%)
                      </th>
                    )}
                    <th className="border border-black px-2 py-1 w-32">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {itemChunks[0]?.map((item, index) => (
                    <tr key={item.id} className="even:bg-gray-50">
                      <td className="border border-black px-2 py-1 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.itemcode}
                      </td>
                      <td className="border border-black px-2 py-1 font-medium text-center">
                        {item.productname}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.description}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.units}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.rate.toFixed(2)}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {item.quantity}
                      </td>
                      {isDelhiSupplier ? (
                        <>
                          <td className="border border-black px-2 py-1 text-center">
                            {item.cgst}%
                          </td>
                          <td className="border border-black px-2 py-1 text-center">
                            {item.sgst}%
                          </td>
                        </>
                      ) : (
                        <td className="border border-black px-2 py-1 text-center">
                          {item.igst}%
                        </td>
                      )}
                      <td className="border border-black px-2 py-1 text-center font-semibold">
                        ₹{item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Show totals, terms and signatures only on the last page */}
              {shouldShowSignatures(
                pageIndex + 1,
                totalPages,
                chunk.length
              ) && (
                <>
                  {/* Total Amount */}
                  <div className="flex items-center border border-black px-3 py-2 mt-4 text-sm">
                    <span className="font-bold mr-2">Total Amount:</span>
                    <span className="font-semibold text-[#11599c]">
                      ₹{parseFloat(invoiceData.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  {/* Amount in Words */}
                  <div className="flex items-start border border-black px-3 py-2 mt-2 text-sm">
                    <span className="font-semibold mr-2 whitespace-nowrap">
                      Amount in Words:
                    </span>
                    <span className="font-bold text-gray-800">
                      {invoiceData.amountInWords}
                    </span>
                  </div>

                  <TermsAndConditions />
                  <SignatureSection />
                </>
              )}
            </div>

            {/* Page Number */}
            <PageNumber currentPage={pageIndex + 2} totalPages={totalPages} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center">
        <button
          onClick={downloadInvoice}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default ViewInvoice;
