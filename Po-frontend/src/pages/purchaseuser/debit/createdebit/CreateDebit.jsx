import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import img1 from "../../../../Assets/logo_01.png";

function CreateDebitNote() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [grnData, setGrnData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [debitNoteNumber, setDebitNoteNumber] = useState("");
  const [grnNumber, setGrnNumber] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [amountInWords, setAmountInWords] = useState("");
  const [freight, setFreight] = useState("");

  const [formData, setFormData] = useState({
    debitNoteDate: "",
    paymentMode: "",
    buyerPoNo: "",
    buyergrnNO: "",
    dispatchThrough: "",
    originalInvoiceNo: "",
    originalInvoiceDate: "",
    consignee: {
      name: "",
      address: "",
      gstin: "",
      state: "",
      code: "",
    },
    buyer: {
      address: "",
    },
    items: [],
  });

  const paymentModes = [
    "Cash",
    "Cheque",
    "Bank Transfer",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
  ];

  const dispatchMethods = [
    "Cargo",
    "Courier",
    "Post",
    "Transport",
    "Self Pickup",
  ];

  useEffect(() => {
    const grnId = new URLSearchParams(location.search).get("grnId");
    if (grnId) {
      fetchGRNData(grnId);
    } else {
      navigate("/purchaseuser/get-grn");
    }
  }, [location.search]);

  const fetchGRNData = async (grnId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/grn/${grnId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch GRN data");

      const data = await response.json();
      setGrnData(data.data);

      const damagedItems = data.data.items
        .filter((item) => item.damage_status === "Damage" && item.damage_quantity > 0)
        .map((item, index) => ({
          ...item,
          sNo: index + 1,
        }));

      setFormData({
        debitNoteDate: "",
        paymentMode: "",
        buyerPoNo: data.data.po_no,
        buyergrnNO: data.data.grn_no,
        dispatchThrough: "",
        originalInvoiceNo: data.data.invoice_no,
        originalInvoiceDate: data.data.invoice_date
          ? new Date(data.data.invoice_date).toISOString().split("T")[0]
          : "",
        consignee: {
          name: "",
          address: "",
          gstin: "",
          state: "",
          code: "",
        },
        buyer: {
          address: data.data.address,
        },
        items: damagedItems.map((item) => ({
          sNo: item.sNo,
          sku: item.sku,
          description: item.goods_description,
          units: item.uom,
          quantity: item.damage_quantity,
          gstRate: data.data.gst_percentage || "18",
          unitCost: item.per_unit_cost,
          amount: item.damage_amount,
        })),
      });
    } catch (error) {
      console.error("Error fetching GRN data:", error);
      alert("Failed to load GRN data: " + error.message);
      navigate("/purchaseuser/get-grn");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.debitNoteDate)
      errors.debitNoteDate = "Debit Note Date is required";
    if (!formData.paymentMode) errors.paymentMode = "Payment Mode is required";
    if (!formData.dispatchThrough)
      errors.dispatchThrough = "Dispatched Through is required";
    if (!formData.consignee.name)
      errors.consigneeName = "Consignee Name is required";
    if (!formData.consignee.address)
      errors.consigneeAddress = "Consignee Address is required";
    
    // GSTIN validation
    if (!formData.consignee.gstin) {
      errors.consigneeGstin = "Consignee GSTIN is required";
    } else if (!/^[0-9A-Z]{15}$/.test(formData.consignee.gstin)) {
      errors.consigneeGstin = "Invalid GSTIN format (15 alphanumeric characters)";
    }
    
    if (!formData.consignee.state)
      errors.consigneeState = "Consignee State is required";
    
    // Pin code validation
    if (!formData.consignee.code) {
      errors.consigneeCode = "Consignee Pin Code is required";
    } else if (!/^\d{6}$/.test(formData.consignee.code)) {
      errors.consigneeCode = "Pin code must be 6 digits";
    }
    
    if (!freight || freight === "0.00")
      errors.freight = "Freight amount is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFreightChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setFreight(value);
    }
    if (validationErrors.freight) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.freight;
        return newErrors;
      });
    }
  };

  const handleConsigneeChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      consignee: {
        ...prev.consignee,
        [field]: value,
      },
    }));

    const errorKey = `consignee${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const freightAmount = parseFloat(freight) || 0;
    return (subtotal + freightAmount).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        debit_note_date: formData.debitNoteDate,
        payment_mode: formData.paymentMode,
        buyer_po_no: formData.buyerPoNo,
        grn_no: formData.buyergrnNO,
        dispatch_through: formData.dispatchThrough,
        original_invoice_no: formData.originalInvoiceNo,
        original_invoice_date: formData.originalInvoiceDate,
        freight: parseFloat(freight) || 0,
        consignee: formData.consignee,
        buyer: formData.buyer,
        items: formData.items.map((item) => ({
          s_no: item.sNo,
          sku: item.sku,
          description: item.description,
          units: item.units,
          quantity: parseFloat(item.quantity) || 0,
          gst_rate: parseFloat(item.gstRate) || 0,
          unit_cost: parseFloat(item.unitCost) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
      };

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/debit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create debit note");
      }

      const data = await response.json();
      setGrnNumber(data.data.grn_no); 
        setDebitNoteNumber(data.data.debit_note_number); // Fix this line
      setAmountInWords(data.data.amount_in_words);
      setSubmissionSuccess(true);
      setTimeout(() => navigate("/purchaseuser/all-debit"), 3000);
    } catch (error) {
      console.error("Submission failed:", error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorModal = () => {
    if (!showErrorModal) return null;

    const fieldErrors = {};
    Object.keys(validationErrors).forEach((key) => {
      const category = key.replace(/^consignee/, "").toLowerCase() || "general";
      if (!fieldErrors[category]) {
        fieldErrors[category] = [];
      }
      fieldErrors[category].push(validationErrors[key]);
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-600">Validation Errors</h3>
            <button
              onClick={() => setShowErrorModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.keys(fieldErrors).map((category) => (
              <div key={category} className="border-b pb-2">
                <h4 className="font-medium capitalize">
                  {category === "general" ? "General" : category}
                </h4>
                <ul className="list-disc pl-5 text-sm text-red-600">
                  {fieldErrors[category].map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!grnData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Failed to load GRN data</p>
          <button
            onClick={() => navigate("/purchaseuser/get-grn")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to GRN List
          </button>
        </div>
      </div>
    );
  }

if (submissionSuccess) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <svg
          className="mx-auto h-12 w-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        <h3 className="mt-3 text-lg font-medium text-gray-900">
          Debit Note Submitted Successfully!
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            {grnNumber && (
              <span className="block">
                Your GRN number is: <strong>{grnNumber}</strong>
              </span>
            )}
            {debitNoteNumber && (
              <span className="block mt-1">
                Your Debit Note number is: <strong>{debitNoteNumber}</strong>
              </span>
            )}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            You will be redirected to the Debit Notes list shortly...
          </p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="flex flex-col items-center mb-4">
        <div className="h-26 flex items-center justify-center mr-4 p-2">
          <img
            src={img1}
            alt="Company Logo"
            className="h-20 object-cover rounded-full"
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">DEBIT NOTE</h2>
          <p className="text-md text-blue-600">New</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Consignee Section */}
          <div className="p-4 border border-gray-300 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consignee (Ship to)
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2 items-center">
                <label className="col-span-2 text-sm text-gray-700">Name *</label>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={formData.consignee.name}
                    onChange={(e) => handleConsigneeChange("name", e.target.value)}
                    className={`w-full p-2 border ${
                      validationErrors.consigneeName ? "border-red-500" : "border-gray-300"
                    } rounded text-sm`}
                  />
                  {validationErrors.consigneeName && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.consigneeName}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 items-center">
                <label className="col-span-2 text-sm text-gray-700">Address *</label>
                <div className="col-span-3">
                  <textarea
                    value={formData.consignee.address}
                    onChange={(e) => handleConsigneeChange("address", e.target.value)}
                    rows="2"
                    className={`w-full p-2 border ${
                      validationErrors.consigneeAddress ? "border-red-500" : "border-gray-300"
                    } rounded text-sm`}
                  />
                  {validationErrors.consigneeAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.consigneeAddress}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 items-center">
                <label className="col-span-2 text-sm text-gray-700">GSTIN *</label>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={formData.consignee.gstin}
                    onChange={(e) => handleConsigneeChange("gstin", e.target.value)}
                    className={`w-full p-2 border ${
                      validationErrors.consigneeGstin ? "border-red-500" : "border-gray-300"
                    } rounded text-sm`}
                  />
                  {validationErrors.consigneeGstin && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.consigneeGstin}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 items-center">
                <label className="col-span-2 text-sm text-gray-700">State *</label>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={formData.consignee.state}
                    onChange={(e) => handleConsigneeChange("state", e.target.value)}
                    className={`w-full p-2 border ${
                      validationErrors.consigneeState ? "border-red-500" : "border-gray-300"
                    } rounded text-sm`}
                  />
                  {validationErrors.consigneeState && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.consigneeState}
                    </p>
                  )}
                </div>
              </div>
            <div className="grid grid-cols-5 gap-2 items-center">
        <label className="col-span-2 text-sm text-gray-700">Pin Code *</label>
        <div className="col-span-3">
          <input
            type="text"
            value={formData.consignee.code}
            onChange={(e) => handleConsigneeChange("code", e.target.value)}
            className={`w-full p-2 border ${
              validationErrors.consigneeCode ? "border-red-500" : "border-gray-300"
            } rounded text-sm`}
            maxLength="6"
            pattern="\d*"
            inputMode="numeric"
          />
          {validationErrors.consigneeCode && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.consigneeCode}
            </p>
          )}
        </div>
      </div>
            </div>
          </div>

          {/* Buyer Section */}
          <div className="p-4 border border-gray-300 rounded space-y-4">
            <div className="grid grid-cols-5 gap-2 items-start">
              <label className="col-span-2 text-sm text-gray-700 pt-1">
                Buyer-Billing-Address
              </label>
              <div className="col-span-3">
                <textarea
                  value={formData.buyer.address}
                  readOnly
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 items-center">
              <label className="col-span-2 text-sm font-medium text-gray-700">
                Buyer's Po No. *
              </label>
              <div className="col-span-3">
                <input
                  type="text"
                  name="buyerPoNo"
                  value={formData.buyerPoNo}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 items-center">
              <label className="col-span-2 text-sm font-medium text-gray-700">
                GRN No
              </label>
              <div className="col-span-3">
                <input
                  type="text"
                  name="buyergrnNO"
                  value={formData.buyergrnNO}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 items-center">
              <label className="col-span-2 text-sm font-medium text-gray-700">
                Original Invoice No. *
              </label>
              <div className="col-span-3">
                <input
                  type="text"
                  name="originalInvoiceNo"
                  value={formData.originalInvoiceNo}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 items-center">
              <label className="col-span-2 text-sm font-medium text-gray-700">
                Original Invoice Date
              </label>
              <div className="col-span-3">
                <input
                  type="date"
                  name="originalInvoiceDate"
                  value={formData.originalInvoiceDate}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Debit Note Details */}
        <div className="p-4 border border-gray-300 rounded">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debit Note Date *
              </label>
              <input
                type="date"
                name="debitNoteDate"
                value={formData.debitNoteDate}
                onChange={handleInputChange}
                className={`w-full p-2 border ${
                  validationErrors.debitNoteDate ? "border-red-500" : "border-gray-300"
                } rounded focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.debitNoteDate && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.debitNoteDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode of Payment *
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleInputChange}
                className={`w-full p-2 border ${
                  validationErrors.paymentMode ? "border-red-500" : "border-gray-300"
                } rounded focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Payment Mode</option>
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              {validationErrors.paymentMode && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.paymentMode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispatched Through *
              </label>
              <select
                name="dispatchThrough"
                value={formData.dispatchThrough}
                onChange={handleInputChange}
                className={`w-full p-2 border ${
                  validationErrors.dispatchThrough ? "border-red-500" : "border-gray-300"
                } rounded focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Dispatch Method</option>
                {dispatchMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              {validationErrors.dispatchThrough && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.dispatchThrough}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <div className="bg-gray-50 p-3 flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Damaged Items Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-12">
                    S.NO
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-20">
                    SKU
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-64">
                    Description
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-16">
                    Units
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-28">
                    Quantity
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-20">
                    GST Rate
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-20">
                    Unit Cost
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-20">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        value={item.sNo}
                        readOnly
                        className="w-full p-1 text-center bg-gray-50 border-0 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={item.sku}
                        readOnly
                        className="w-full p-1 bg-gray-50 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={item.description}
                        readOnly
                        className="w-full p-1 bg-gray-50 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={item.units}
                        readOnly
                        className="w-full p-1 bg-gray-50 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        value={item.quantity}
                        readOnly
                        className="w-full p-1 bg-gray-50 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={`${item.gstRate}%`}
                        readOnly
                        className="w-full p-1 bg-gray-50 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitCost}
                        readOnly
                        className="w-full p-1 bg-gray-50 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        readOnly
                        className="w-full p-1 bg-gray-50 border border-gray-300 rounded text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 p-4 flex justify-end">
            <div className="w-1/3 space-y-4">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border font-medium">Subtotal</td>
                    <td className="px-2 py-1 border text-right">
                      ₹ {calculateSubtotal().toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border font-medium">Freight *</td>
                    <td className="px-2 py-1 border">
                      <input
                        type="text"
                        value={freight}
                        onChange={handleFreightChange}
                        className={`w-full p-1 border ${
                          validationErrors.freight ? "border-red-500" : "border-gray-300"
                        } rounded text-sm text-right`}
                        placeholder="Enter freight amount"
                      />
                      {validationErrors.freight && (
                        <p className="text-red-500 text-xs mt-1 text-right">
                          {validationErrors.freight}
                        </p>
                      )}
                    </td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="px-2 py-1 border font-bold">Total</td>
                    <td className="px-2 py-1 border font-bold text-right">
                      ₹ {calculateTotal()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <button
                type="button"
                onClick={handleSubmit}
                className={`w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Submit Debit Note"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ErrorModal />
    </div>
  );
}

export default CreateDebitNote;