import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import img1 from "../../../../Assets/logo_01.png";
import { useNavigate } from "react-router-dom";

const ViewGRN = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grnData, setGrnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination constants
  const ITEMS_PER_PAGE = 26;
  const ITEMS_ON_FIRST_PAGE = 26;

  useEffect(() => {
    const fetchGrnData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication failed. Please log in.");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/grn/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch GRN data.");
        }

        setGrnData(data.data);
      } catch (err) {
        setError(err.message || "Failed to load GRN data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrnData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const chunkItems = (items) => {
    if (!items || items.length === 0) return [[]];

    if (items.length <= ITEMS_ON_FIRST_PAGE) {
      return [items];
    }

    const firstChunk = items.slice(0, ITEMS_ON_FIRST_PAGE);
    const remainingChunks = [];

    for (let i = ITEMS_ON_FIRST_PAGE; i < items.length; i += ITEMS_PER_PAGE) {
      remainingChunks.push(items.slice(i, i + ITEMS_PER_PAGE));
    }

    return [firstChunk, ...remainingChunks];
  };

  const shouldShowSignatures = (pageIndex, totalPages, itemsOnCurrentPage) => {
    if (pageIndex === totalPages - 1) return true;
    if (pageIndex === 0 && (totalPages === 1 || itemsOnCurrentPage <= 10))
      return true;
    return false;
  };

  const downloadGRN = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageElements = document.querySelectorAll(".grn-page-content");

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

      pdf.save(`GRN_${grnData.grn_no}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const ManualSignatureSection = () => (
    <div className="grid grid-cols-3 gap-4 mt-8">
      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">Received By:</div>
          <div
            className="signature-line border-b border-black"
            style={{ width: "7cm", height: "2cm" }}
          ></div>
        </div>
        <div className="text-xs mt-1">(Person Name)</div>
      </div>

      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">Department:</div>
          <div
            className="signature-line border-b border-black"
            style={{ width: "7cm", height: "2cm" }}
          ></div>
        </div>
        <div className="text-xs mt-1">(Department Name)</div>
      </div>

      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">
            Authorized Signature Iottech:
          </div>
          <div
            className="signature-line border-b border-black"
            style={{ width: "7cm", height: "2cm" }}
          ></div>
        </div>
        <div className="text-xs mt-1">(Signature with Date)</div>
      </div>
    </div>
  );

  const PageNumber = ({ currentPage, totalPages }) => (
    <div className="w-full flex justify-end mt-auto pt-4">
      <span className="text-sm font-semibold">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;
  if (!grnData) return <div className="p-8">No GRN found</div>;

  const itemChunks = chunkItems(grnData.items);
  const totalPages = itemChunks.length;

  return (
    <div className="p-8" style={{ backgroundColor: "gray" }}>

      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">View Goods Received Note</h1>
        <button
          onClick={downloadGRN}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Download as PDF
        </button>
      </div>

      <div
        className="w-full p-4 relative"
        style={{ backgroundColor: "white", color: "black" }}
        id="printable-grn"
      >
        {/* Page 1 - Header and GRN Info */}
        <div
          className="grn-page-content flex flex-col"
          style={{
            minHeight: "297mm",
            pageBreakAfter: totalPages > 1 ? "always" : "auto",
          }}
        >
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
                <h2 className="text-xl font-bold text-black"  style={{ color: '#11599c', borderBottom: '1px solid #11599c' }}>
                  Goods Received Note - IOTTECH
                </h2>
                {/* <div
                  className="text-xl font-bold"
                  style={{
                    color: "#11599c",
                    borderBottom: "1px solid #11599c",
                  }}
                >
                  GRN Number: {grnData.grn_no}
                </div> */}
              </div>
            </div>

        <div className="grid grid-cols-2 gap-0 mb-4 text-[15px]">
  {/* Left Side – Vendor Info */}
 <div className="border border-black rounded overflow-hidden">
  <table className="w-full text-[15px]">
    <tbody>
      {[
        ["Vendor Name:", grnData.vendor_name],
        ["Invoice No:", grnData.invoice_no],
        ["Invoice Date:", formatDate(grnData.invoice_date)],
        ["PO No:", grnData.po_no],
        ["Prepared By:", grnData.prepared_by],
      ].map(([label, value], i, arr) => (
        <tr
          key={label}
          className={`${i !== arr.length - 1 ? "border-b border-black" : ""}`}
        >
          <td className="px-3 py-1 font-semibold border-r border-black w-1/2">
            {label}
          </td>
          <td className="px-3 py-1 text-gray-900 font-medium leading-relaxed">
            {value}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


  {/* Right Side – GRN Info */}
  <div className="border border-black rounded overflow-hidden">
    <table className="w-full text-[15px]">
      <tbody>
        {[
          ["GRN Number:", grnData.grn_no],
          ["GRN Date:", formatDate(grnData.grn_date)],
          ["Vendor Address:", grnData.address],
        ].map(([label, value], i) => (
          <tr key={label} className="border-b border-black">
            <td className="px-3 py-1 font-semibold border-r border-black w-1/2">
              {label}
            </td>
            <td className="px-3 py-1 text-gray-900 font-medium leading-relaxed whitespace-pre-line">
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


         <div className="overflow-x-auto mb-4">
  <div className="text-xl font-bold text-gray-800 mb-2">Received Items</div>

  <table className="min-w-full border border-black text-sm text-gray-900">
    <thead>
      <tr className="bg-[#355f75] text-white">
        <th className="border border-black px-2 py-1 w-12">S.No</th>
        <th className="border border-black px-2 py-1">SKU</th>
        <th className="border border-black px-2 py-1 w-1/3">Description</th>
        <th className="border border-black px-2 py-1">Units</th>
        <th className="border border-black px-2 py-1">Received Qty</th>
        <th className="border border-black px-2 py-1">Good Qty</th>
        <th className="border border-black px-2 py-1">Damage Qty</th>
        <th className="border border-black px-2 py-1">Unit Cost</th>
        <th className="border border-black px-2 py-1">Amount</th>
        <th className="border border-black px-2 py-1 w-20">Damage Amount</th>
      </tr>
    </thead>

    <tbody>
      {itemChunks[0]?.map((item, index) => (
        <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
          <td className="border border-black px-2 py-1 text-center">
            {item.s_no}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.sku}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.goods_description}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.uom}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.received_quantity}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.good_quantity}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.damage_quantity}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            ₹{parseFloat(item.per_unit_cost).toFixed(2)}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            ₹{parseFloat(item.amount).toFixed(2)}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            ₹{parseFloat(item.damage_amount).toFixed(2)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


            {totalPages === 1 && (
              <>
                {/* Financial Summary Section */}
                <div className="grid grid-cols-2 gap-0 mt-4 border border-black rounded overflow-hidden text-sm">
                  {/* Left side - Payable in Words and Remarks */}
                  <div className="flex flex-col border-r border-black">
                    {/* Payable in Words */}
                    <div className="px-2 py-1 h-20 flex items-center bg-gray-50 border-b border-black">
                      <div className="font-semibold leading-snug">
                        Payable in Words:-
                        <span className="text-[#11599c] font-medium text-base">
                          {grnData.payable_in_words}
                        </span>
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="px-2 py-1 flex-grow">
                      <div className="font-semibold mb-1">Remarks:</div>
                      <div className="text-sm italic text-gray-700 h-full">
                        {/* Optional: Add default or entered remarks here */}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Financial Summary (Left aligned) */}
                  <div className="p-0">
                    <table className="w-full h-full text-sm">
                      <tbody>
                        <tr className="border-b border-black bg-gray-50">
                          <td className="px-2 py-1 font-semibold border-r border-black">
                            Total
                          </td>
                          <td className="px-2 py-1 text-left font-semibold">
                            ₹{grnData.total_amount}
                          </td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="px-2 py-1 font-semibold border-r border-black">
                            Damage Amount
                          </td>
                          <td className="px-2 py-1 text-left font-semibold">
                            ₹{grnData.damage_amount}
                          </td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="px-2 py-1 font-semibold border-r border-black">
                            Grand Total
                          </td>
                          <td className="px-2 py-1 text-left font-semibold">
                            ₹{grnData.grand_total}
                          </td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="px-2 py-1 font-semibold border-r border-black">
                            Freight
                          </td>
                          <td className="px-2 py-1 text-left font-semibold">
                            ₹{grnData.freight}
                          </td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="px-2 py-1 font-semibold border-r border-black">
                            GST Percentage
                          </td>
                          <td className="px-2 py-1 text-left font-semibold">
                            {grnData.gst_percentage}%
                          </td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="px-2 py-1 font-semibold border-r border-black">
                            GST Amount
                          </td>
                          <td className="px-2 py-1 text-left font-semibold">
                            ₹
                            {grnData.gst_amount ||
                              (
                                ((parseFloat(grnData.total_amount || 0) +
                                  parseFloat(grnData.freight || 0)) *
                                  parseFloat(grnData.gst_percentage || 0)) /
                                100
                              ).toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-[#f5f7fa] text-base">
                          <td className="px-2 py-1 font-bold border-r border-black">
                            PAYABLE AMOUNT
                          </td>
                          <td className="px-2 py-1 text-left font-bold">
                            ₹{grnData.payable_amount}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <ManualSignatureSection />
              </>
            )}
          </div>

          <PageNumber currentPage={1} totalPages={totalPages} />
        </div>

        {itemChunks.slice(1).map((chunk, pageIndex) => (
          <div
            key={pageIndex + 1}
            className="grn-page-content flex flex-col"
            style={{
              minHeight: "297mm",
              pageBreakAfter:
                pageIndex === itemChunks.length - 2 ? "auto" : "always",
            }}
          >
       <div className="flex-grow">
  <div className="overflow-x-auto mb-4">
    <div className="text-xl font-bold text-gray-800 mb-2">
      Received Items (Continued)
    </div>

    <table className="min-w-full border border-black text-sm text-gray-900">
      <thead>
        <tr className="bg-[#355f75] text-white">
          <th className="border border-black px-2 py-1 w-12">S.No</th>
          <th className="border border-black px-2 py-1">SKU</th>
          <th className="border border-black px-2 py-1 w-1/3">Description</th>
          <th className="border border-black px-2 py-1">UOM</th>
          <th className="border border-black px-2 py-1">Received Qty</th>
          <th className="border border-black px-2 py-1">Good Qty</th>
          <th className="border border-black px-2 py-1">Damage Qty</th>
          <th className="border border-black px-2 py-1">Unit Cost</th>
          <th className="border border-black px-2 py-1">Amount</th>
          <th className="border border-black px-2 py-1 w-20">Damage Amount</th>
        </tr>
      </thead>

      <tbody>
        {chunk.map((item, index) => {
          const globalIndex =
            ITEMS_ON_FIRST_PAGE + pageIndex * ITEMS_PER_PAGE + index + 1;

          return (
            <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-black px-2 py-1 text-center">
                {globalIndex}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {item.sku}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {item.goods_description}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {item.uom}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {item.received_quantity}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {item.good_quantity}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {item.damage_quantity}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                ₹{parseFloat(item.per_unit_cost).toFixed(2)}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                ₹{parseFloat(item.amount).toFixed(2)}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                ₹{parseFloat(item.damage_amount).toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {/* Conditional Footer (Signatures, Financials, etc.) */}
  {shouldShowSignatures(pageIndex + 1, totalPages, chunk.length) && (
    <>
      {/* Financial Summary Section */}
      <div className="grid grid-cols-2 gap-0 mt-4 text-sm text-gray-900">
        {/* Left - Payable in Words + Remarks */}
        <div className="flex flex-col">
          <div className="border border-black p-2 h-20">
            <div className="font-semibold">
              Payable in Words:{" "}
              <span className="text-[#11599c] font-normal">
                {grnData.payable_in_words}
              </span>
            </div>
          </div>
          <div className="border border-black p-2 flex-grow h-24">
            <div className="font-semibold mb-1">Remarks:</div>
            <div className="text-sm text-gray-700">
              {/* Empty for manual input */}
            </div>
          </div>
        </div>

        {/* Right - Financial Summary Table */}
        <div className="border border-black">
          <table className="w-full h-full text-sm">
            <tbody>
              <tr className="border-b border-black">
                <td className="p-2 font-semibold border-r border-black">Total</td>
                <td className="p-2 text-right font-semibold">
                  ₹{parseFloat(grnData.total_amount).toFixed(2)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-semibold border-r border-black">Damage Amount</td>
                <td className="p-2 text-right font-semibold">
                  ₹{parseFloat(grnData.damage_amount).toFixed(2)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-semibold border-r border-black">GRAND TOTAL</td>
                <td className="p-2 text-right font-semibold">
                  ₹{parseFloat(grnData.grand_total).toFixed(2)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-semibold border-r border-black">FREIGHT</td>
                <td className="p-2 text-right font-semibold">
                  ₹{parseFloat(grnData.freight).toFixed(2)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-semibold border-r border-black">GST Percentage</td>
                <td className="p-2 text-right font-semibold">
                  {parseFloat(grnData.gst_percentage)}%
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-semibold border-r border-black">GST Amount</td>
                <td className="p-2 text-right font-semibold">
                  ₹
                  {grnData.gst_amount ||
                    (
                      ((parseFloat(grnData.total_amount) +
                        parseFloat(grnData.freight)) *
                        parseFloat(grnData.gst_percentage)) /
                      100
                    ).toFixed(2)}
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="p-2 font-bold border-r border-black">PAYABLE AMOUNT</td>
                <td className="p-2 text-right font-bold">
                  ₹{parseFloat(grnData.payable_amount).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature Section */}
      <ManualSignatureSection />
    </>
  )}
</div>


            <PageNumber currentPage={pageIndex + 2} totalPages={totalPages} />
          </div>
        ))}
      </div>
     <div className="mt-3 flex justify-center">
   
        <button
          onClick={downloadGRN}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default ViewGRN;
