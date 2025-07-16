import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import img1 from "../../../../Assets/logo_01.png";
import { useNavigate } from "react-router-dom";

const ViewDebit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debitData, setDebitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDebitData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication failed. Please log in.");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/debit/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch debit note data.");
        }

        setDebitData(data.data);
      } catch (err) {
        setError(err.message || "Failed to load debit note data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDebitData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const downloadDebitNote = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageElement = document.querySelector(".debit-page-content");

      if (!pageElement) {
        console.error("No page found");
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

      pageElement.style.display = "block";
      pageElement.style.margin = "0";
      pageElement.style.padding = "0";

      const canvas = await html2canvas(pageElement, options);
      const imgData = canvas.toDataURL("image/png", 1.0);

      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        10,
        10,
        imgWidth,
        Math.min(imgHeight, pageHeight)
      );

      pdf.save(`Debit_Note_${debitData.debit_note_number}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const ManualSignatureSection = () => (
    <div className="grid grid-cols-3 gap-4 mt-8">
      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">Prepared By:</div>
          <div
            className="signature-line border-b border-black"
            style={{ width: "7cm", height: "2cm" }}
          ></div>
        </div>
        <div className="text-xs mt-1">(Signature with Date)</div>
      </div>

      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">Checked By:</div>
          <div
            className="signature-line border-b border-black"
            style={{ width: "7cm", height: "2cm" }}
          ></div>
        </div>
        <div className="text-xs mt-1">(Signature with Date)</div>
      </div>

      <div className="signature-container text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="mb-2 font-bold w-24 text-right">
            Authorized Signature:
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;
  if (!debitData) return <div className="p-8">No debit note found</div>;

  return (
    <div className="p-8" style={{ backgroundColor: "gray" }}>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">View Debit Note</h1>
        <button
          onClick={downloadDebitNote}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Download as PDF
        </button>
      </div>

      <div
        className="w-full p-4 relative"
        style={{ backgroundColor: "white", color: "black" }}
        id="printable-debit"
      >
        <div
          className="debit-page-content flex flex-col"
          style={{ minHeight: "297mm" }}
        >
          <div className="flex items-center justify-center p-2">
            <img
              src={img1}
              alt="Company Logo"
              className="h-20 object-cover rounded-full"
            />
          </div>
          {/* </div> */}

          <div className="flex-grow">
            <div className="flex flex-col items-center mb-4">
              <h2 className="text-xl font-bold text-black"  style={{ color: '#11599c', borderBottom: '1px solid #11599c' }}>
                DEBIT NOTE - IOTTECH
            
              </h2>
            </div>

          <div className="grid grid-cols-2 gap-0 mb-4 text-[15px]">
  {/* Left Section – IOTTECH Details & Debit Note Info */}
  <div className="border border-black rounded overflow-hidden">
    <div className="p-3">
      <div className="text-lg font-bold mb-2">
        IOTTECH SMART PRODUCTS PRIVATE LIMITED
      </div>
      <div className="text-sm">Plot No. 13, 3rd Floor, Pocket B, Sector 17, Dwarka</div>
      <div className="text-sm">Dwarka Sec 17, New Delhi 110075</div>
      <div className="text-sm">GST : 07AAHCI3643R1ZZ</div>
      <div className="text-sm">State Name : Delhi, Code : 07</div>
      <div className="text-sm">Contact : 9691893, 9267087511</div>
      <div className="text-sm">
        E-Mail : account@iottechsmart.com, Purchase@iottechsmart.com
      </div>
    </div>

 <table className="w-full text-[15px] border-t border-black">
  <tbody>
    {[
      ["Debit Note No:", debitData.debit_note_number],
      ["Debit Note Date:", formatDate(debitData.debit_note_date)],
      ["Invoice No:", debitData.original_invoice_no],
      ["Invoice Date:", formatDate(debitData.original_invoice_date)],
      ["Payment Mode:", debitData.payment_mode],
    ].map(([label, value], i, arr) => (
      <tr
        key={label}
        className={`${i !== arr.length - 1 ? "border-b border-black" : ""}`}
      >
        <td className="px-3 py-1 font-semibold border-r border-black w-1/2">{label}</td>
        <td className="px-3 py-1 text-gray-900 font-medium">{value}</td>
      </tr>
    ))}
  </tbody>
</table>

  </div>

  {/* Right Section – Consignee, Buyer Info, and GRN/PO Details */}
  <div className="border border-black rounded overflow-hidden">
    <div className="p-3">
      {/* Consignee */}
      <div className="mb-3">
        <div className="text-lg font-bold mb-1">Consignee (Ship to)</div>
        <div className="text-sm font-bold">Name: {debitData.consignee.name}</div>
        <div className="text-sm font-bold">Address: {debitData.consignee_address}</div>
        <div className="text-sm font-bold">GSTIN/UIN: {debitData.consignee_gstin}</div>
        <div className="text-sm font-bold">
          State Name: {debitData.consignee.state}, Pin Code: {debitData.consignee.code}
        </div>
      </div>

      {/* Buyer */}
      <div className="mb-3 border-t border-black pt-2">
        <div className="text-lg font-bold mb-1">Buyer (Bill to)</div>
        <div className="text-sm font-medium">{debitData.buyer_address}</div>
      </div>
    </div>

 <table className="w-full text-[15px] border-t border-black">
  <tbody>
    {[
      ["GRN No:", debitData.grn_no],
      ["Buyer PO No:", debitData.buyer_po_no],
      ["Dispatch Through:", debitData.dispatch_through],

    ].map(([label, value], i, arr) => (
      <tr key={label} className={`${i !== arr.length - 1 ? "border-b border-black" : ""}`}>
        <td className="px-3 py-1 font-semibold border-r border-black w-1/2">{label}</td>
        <td className="px-3 py-1 text-gray-900 font-medium">{value}</td>
      </tr>
    ))}
  </tbody>
</table>

  </div>
</div>


       <div className="overflow-x-auto mb-4">
  <div className="text-xl font-bold text-gray-800 mb-2">Items Details</div>

  <table className="min-w-full border border-black text-sm text-gray-900">
    <thead>
      <tr className="bg-[#355f75] text-white">
        <th className="border border-black px-2 py-1 w-12">S.No</th>
        <th className="border border-black px-2 py-1">SKU</th>
        <th className="border border-black px-2 py-1 w-1/3">Description</th>
        <th className="border border-black px-2 py-1">Units</th>
        <th className="border border-black px-2 py-1">Quantity</th>
        <th className="border border-black px-2 py-1">Unit Cost</th>
        <th className="border border-black px-2 py-1">GST Rate</th>
        <th className="border border-black px-2 py-1">Amount</th>
      </tr>
    </thead>

    <tbody>
      {debitData.items?.map((item, index) => (
        <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
          <td className="border border-black px-2 py-1 text-center">
            {item.s_no}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.sku}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.description}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.units}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.quantity}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            ₹{parseFloat(item.unit_cost).toFixed(2)}
          </td>
          <td className="border border-black px-2 py-1 text-center">
            {item.gst_rate}%
          </td>
          <td className="border border-black px-2 py-1 text-center font-semibold">
            ₹{parseFloat(item.amount).toFixed(2)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

            {/* Financial Summary Section */}
            <div className="grid grid-cols-2 gap-0 mt-4 border border-black rounded overflow-hidden text-sm">
              {/* Left side - Amount in Words and Tax Words */}
              <div className="flex flex-col border-r border-black">
                <div className="border-b border-black px-2 py-1 h-20 flex items-center bg-gray-50">
                  <div className="font-semibold leading-snug">
                    Amount Payable (in Words):-
                    <span className="text-[#11599c] font-semibold leading-snug">
                      {debitData.amount_in_words}
                    </span>
                  </div>
                </div>
                <div className="px-2 py-1 h-20 flex items-center">
                  <div className="font-semibold leading-snug">
                    Tax Amount (in Words):-
                    <span className="text-[#11599c] font-semibold leading-snug">
                      {debitData.amount_in_words_gst}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Financial Summary Table */}
              <div className="p-0">
                <table className="w-full h-full text-sm">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-semibold border-r border-black bg-gray-50">
                        Subtotal
                      </td>
                      <td className="px-2 py-1 text-right font-semibold bg-gray-50">
                        ₹{debitData.subtotal}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-semibold border-r border-black">
                        Freight
                      </td>
                      <td className="px-2 py-1 text-right font-semibold">
                        ₹{debitData.freight}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-semibold border-r border-black">
                        GST Amount{" "}
                        <span className="text-xs text-gray-600">
                          ({debitData.gst_percentage}%)
                        </span>
                      </td>
                      <td className="px-2 py-1 text-right font-semibold">
                        ₹{debitData.gst_amount}
                      </td>
                    </tr>
                    <tr className="bg-[#f5f7fa] text-base">
                      <td className="px-2 py-1 font-bold border-r border-black">
                        PAYABLE AMOUNT
                      </td>
                      <td className="px-2 py-1 text-right font-bold">
                        ₹{debitData.payable_amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bank and Remarks Section */}
            <div className="w-full mt-4 text-sm border border-black">
              <div className="flex w-full h-full">
                {/* Left Half - Remarks */}
                <div className="w-1/2 p-2 border-r border-black">
                  <div className="font-semibold text-lg mb-2">Remarks:</div>
                  <div className="h-full">
                    {/* Empty space for manual remarks */}
                  </div>
                </div>

                {/* Right Half - Bank Details */}
                <div className="w-1/2 p-2">
                  <div className="font-bold text-lg mb-2">
                    Company's Bank Details
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">A/c Holder's Name:</span>{" "}
                    IOTTECH SMART PRODUCTS PRIVATE LIMITED 24-25 FINAL
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Bank Name:</span> HDFC Bank
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">A/c No.:</span>{" "}
                    50200089347941
                  </div>
                  <div>
                    <span className="font-semibold">Branch & IFS Code:</span>{" "}
                    DWARKA SECTOR 17 & HDFC0004751
                  </div>
                </div>
              </div>
            </div>

            <ManualSignatureSection />
          </div>
        </div>
      </div>
    <div className="mt-3 flex justify-center">
  <button
    onClick={downloadDebitNote}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  >
    Download as PDF
  </button>
</div>

    </div>
  );
};

export default ViewDebit;
