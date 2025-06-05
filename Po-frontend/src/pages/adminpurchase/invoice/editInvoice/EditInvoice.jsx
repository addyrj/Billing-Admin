import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import img1 from "../../../../Assets/logo_01.png";

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDelhiSupplier, setIsDelhiSupplier] = useState(true);
  const [preparedBySignature, setPreparedBySignature] = useState(null);
  const [verifiedBySignature, setVerifiedBySignature] = useState(null);
  const [authorizedSignature, setAuthorizedSignature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });

  const [invoiceData, setInvoiceData] = useState({
    date: "",
    refNo: "",
    validity: "",
    supplierOfferNo: "",
    deliveryPeriod: "",
    transportation: "",
    panNo: "",
    purchaseRequest: "",
    supplier: "",
    supplierAddress: "",
    contactPerson: "",
    contactNo: "",
    whatsappNo: "",
    email: "",
    prNo: "",
    supplierOfferDate: "",
    paymentTerms: "",
    gstNo: "07AAHCI3643R1ZZ",
    supplierGST: "",
    items: [],
    totalAmount: 0,
    amountInWords: "",
    invoiceAddress:
      "IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075",
    deliveryAddress:
      "IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075",
  });

  // Fetch existing PO data
  useEffect(() => {
    const fetchPOData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/get-pobyid/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch PO data");
        }

        const data = await response.json();
        const poData = data.data || data;

        const formattedData = {
          ...poData,
          date: poData.date ? poData.date.split("T")[0] : "",
          supplierOfferDate: poData.supplierOfferDate
            ? poData.supplierOfferDate.split("T")[0]
            : "",
          items: Array.isArray(poData.items)
            ? poData.items
            : JSON.parse(poData.items || "[]"),
        };

        setInvoiceData(formattedData);

        // Set existing signatures with full URLs
        if (poData.preparedBySignature) {
          setPreparedBySignature(
            poData.preparedBySignature.startsWith("data:")
              ? poData.preparedBySignature
              : `${import.meta.env.VITE_API_BASE_URL}${
                  poData.preparedBySignature
                }`
          );
        }
        if (poData.verifiedBySignature) {
          setVerifiedBySignature(
            poData.verifiedBySignature.startsWith("data:")
              ? poData.verifiedBySignature
              : `${import.meta.env.VITE_API_BASE_URL}${
                  poData.verifiedBySignature
                }`
          );
        }
        if (poData.authorizedSignature) {
          setAuthorizedSignature(
            poData.authorizedSignature.startsWith("data:")
              ? poData.authorizedSignature
              : `${import.meta.env.VITE_API_BASE_URL}${
                  poData.authorizedSignature
                }`
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching PO data:", error);
        setMessage({ text: "Failed to load PO data", type: "error" });
        setIsLoading(false);
      }
    };

    fetchPOData();
  }, [id]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/purchase-products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setMessage({ text: "Failed to load products", type: "error" });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Address change handler
  useEffect(() => {
    const address = (invoiceData.supplierAddress || "").toLowerCase();
    setIsDelhiSupplier(address.includes("delhi"));
  }, [invoiceData.supplierAddress]);

  // Amount in words converter
  const convertToWords = (num) => {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero Rupees Only";

    const convertLessThanThousand = (n) => {
      if (n === 0) return "";
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      return tens[ten] + (unit !== 0 ? " " + units[unit] : "");
    };

    const formatNumber = (n) => {
      let result = "";
      let remainder = n;

      if (remainder >= 10000000) {
        result +=
          convertLessThanThousand(Math.floor(remainder / 10000000)) + " Crore ";
        remainder %= 10000000;
      }

      if (remainder >= 100000) {
        result +=
          convertLessThanThousand(Math.floor(remainder / 100000)) + " Lakh ";
        remainder %= 100000;
      }

      if (remainder >= 1000) {
        result +=
          convertLessThanThousand(Math.floor(remainder / 1000)) + " Thousand ";
        remainder %= 1000;
      }

      if (remainder >= 100) {
        result +=
          convertLessThanThousand(Math.floor(remainder / 100)) + " Hundred ";
        remainder %= 100;
      }

      if (remainder > 0) {
        result += convertLessThanThousand(remainder);
      }

      return result;
    };

    const [whole, decimal] = num.toString().split(".");
    let result = formatNumber(parseInt(whole)) + " Rupees";

    if (decimal) {
      result += " and " + formatNumber(parseInt(decimal)) + " Paise";
    }

    return result + " Only";
  };

  // Amount in words effect
  useEffect(() => {
    setInvoiceData((prev) => ({
      ...prev,
      amountInWords:
        invoiceData.totalAmount > 0
          ? convertToWords(invoiceData.totalAmount)
          : "",
    }));
  }, [invoiceData.totalAmount]);

  // Validation
  const validateForm = () => {
    const errors = {};

    // Required fields validation
    const requiredFields = [
      "supplier",
      "date",
      "supplierAddress",
      "contactPerson",
      "contactNo",
      "whatsappNo",
      "email",
      "paymentTerms",
      "deliveryPeriod",
      "supplierOfferNo",
      "validity",
      "transportation",
      "panNo",
      "purchaseRequest",
      "prNo",
      "supplierOfferDate",
      "supplierGST",
    ];

    requiredFields.forEach((field) => {
      if (!invoiceData[field]) {
        errors[field] = `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required`;
      }
    });

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoiceData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone number validation
    if (!/^\d{10,15}$/.test(invoiceData.contactNo)) {
      errors.contactNo = "Please enter a valid phone number (10-15 digits)";
    }

    // Date validation
    if (invoiceData.date && invoiceData.supplierOfferDate) {
      const poDate = new Date(invoiceData.date);
      const offerDate = new Date(invoiceData.supplierOfferDate);
      if (offerDate > poDate) {
        errors.supplierOfferDate =
          "Supplier offer date cannot be after PO date";
      }
    }

    // Items validation
    invoiceData.items.forEach((item, index) => {
      if (!item.productname) {
        errors[`items[${index}].productname`] = "Product name is required";
      }
      if (!item.units) {
        errors[`items[${index}].units`] = "Unit is required";
      }
      if (!item.rate || item.rate <= 0) {
        errors[`items[${index}].rate`] = "Valid rate is required";
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items[${index}].quantity`] = "Valid quantity is required";
      }
      if (isDelhiSupplier) {
        if (!item.cgst || item.cgst < 0)
          errors[`items[${index}].cgst`] = "Valid CGST is required";
        if (!item.sgst || item.sgst < 0)
          errors[`items[${index}].sgst`] = "Valid SGST is required";
      } else if (!item.igst || item.igst < 0) {
        errors[`items[${index}].igst`] = "Valid IGST is required";
      }
    });

    if (invoiceData.items.length === 0) {
      errors.items = "At least one item is required";
    }

    // GST validation
    if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        invoiceData.supplierGST
      )
    ) {
      errors.supplierGST = "Please enter a valid GST number";
    }

    // PAN validation
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(invoiceData.panNo)) {
      errors.panNo = "Please enter a valid PAN number";
    }

    // Signature validation
    if (!preparedBySignature)
      errors.preparedBySignature = "Prepared by signature is required";
    if (!verifiedBySignature)
      errors.verifiedBySignature = "Verified by signature is required";
    if (!authorizedSignature)
      errors.authorizedSignature = "Authorized signature is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({
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

const handleItemChange = (index, field, value) => {
  const updatedItems = [...invoiceData.items];
  updatedItems[index][field] = value;

  // Recalculate total whenever rate, quantity, or tax rates change
  if (['rate', 'quantity', 'cgst', 'sgst', 'igst'].includes(field)) {
    const item = updatedItems[index];
    const subtotal = item.rate * item.quantity;
    
    let taxAmount = 0;
    if (isDelhiSupplier) {
      // For Delhi suppliers: CGST + SGST
      taxAmount = subtotal * (item.cgst / 100) + subtotal * (item.sgst / 100);
    } else {
      // For non-Delhi suppliers: IGST
      taxAmount = subtotal * (item.igst / 100);
    }

    updatedItems[index].total = subtotal + taxAmount;
  }

  const totalAmount = updatedItems.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );

  setInvoiceData((prev) => ({
    ...prev,
    items: updatedItems,
    totalAmount,
  }));

  // Clear validation error if it exists
  if (validationErrors[`items[${index}].${field}`]) {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`items[${index}].${field}`];
      return newErrors;
    });
  }
  
  // Clear total validation error if it exists
  if (validationErrors[`items[${index}].total`]) {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`items[${index}].total`];
      return newErrors;
    });
  }
};

  // Item management
  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: "",
          productname: "",
          units: "",
          rate: 0,
          quantity: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (invoiceData.items.length <= 1) {
      setValidationErrors((prev) => ({
        ...prev,
        items: "At least one item must remain in the PO",
      }));
      return;
    }

    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    setInvoiceData((prev) => ({
      ...prev,
      items: updatedItems,
      totalAmount,
    }));
  };

  const updatePO = async () => {
    setIsLoading(true);
    setValidationErrors({});
    setMessage({ text: "", type: "" });

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Prepare the update payload
      const payload = {
        // Copy all invoice data
        ...invoiceData,

        // Explicitly exclude fields we never want to update
        id: undefined,
        poNo: undefined,
        created_at: undefined,
        updated_at: undefined,

        // Handle signatures - only include if they're new uploads (data URLs)
        preparedBySignature: preparedBySignature?.startsWith("data:")
          ? preparedBySignature
          : undefined,
        verifiedBySignature: verifiedBySignature?.startsWith("data:")
          ? verifiedBySignature
          : undefined,
        authorizedSignature: authorizedSignature?.startsWith("data:")
          ? authorizedSignature
          : undefined,
      };

      // Remove undefined values to clean up the payload
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
      );

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/update-po/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanPayload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (result.errors) {
          const backendErrors = {};
          result.errors.forEach((error) => {
            backendErrors[error.field] = error.message;
          });
          setValidationErrors(backendErrors);
          throw new Error("Validation failed on server");
        }
        throw new Error(result.message || "Failed to update PO");
      }

      setMessage({
        text: `PO ${invoiceData.poNo} updated successfully!`,
        type: "success",
      });

      // Redirect after successful update
      setTimeout(() => navigate("/admin/get-invoice"), 2000);
    } catch (error) {
      console.error("Error updating PO:", error);
      setMessage({
        text:
          error.message || "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading PO data...</div>;
  }

  return (
    <div className="p-8" style={{ backgroundColor: "gray" }}>
      {/* Header */}
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Edit Purchase Order</h1>
        <div className="text-xl font-bold">PO Number: {invoiceData.poNo}</div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Validation Errors Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="error-summary mb-4">
          <strong className="font-bold">
            Please fix the following Errors:
          </strong>
          <ul className="list-disc pl-5 mt-1">
            {Object.entries(validationErrors)
              .filter(([key]) => !key.startsWith("items["))
              .map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
          </ul>
        </div>
      )}

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
               <div className="text-xl font-bold">PO Number: {invoiceData.poNo}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-black p-2">
            <h3 className="font-semibold">To,</h3>
            <textarea
              name="supplierAddress"
              value={invoiceData.supplierAddress}
              onChange={handleInputChange}
              className={`w-full border-none focus:outline-none resize-none h-8 text-black ${
                validationErrors.supplierAddress ? "error-input" : ""
              }`}
              placeholder="Supplier Address"
              required
            ></textarea>
            {validationErrors.supplierAddress && (
              <div className="error-message">
                {validationErrors.supplierAddress}
              </div>
            )}
          </div>
          <div></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-black">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Supplier:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="text"
                      name="supplier"
                      value={invoiceData.supplier}
                      // value={invoiceData.data?.supplier || invoiceData.supplier}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.supplier ? "error-input" : ""
                      }`}
                      placeholder="Supplier Name"
                      required
                    />
                    {validationErrors.supplier && (
                      <div className="error-message text-center">
                        {validationErrors.supplier}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Contact Person:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="text"
                      name="contactPerson"
                      value={invoiceData.contactPerson}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.contactPerson ? "error-input" : ""
                      }`}
                      placeholder="Contact Person"
                      required
                    />
                    {validationErrors.contactPerson && (
                      <div className="error-message text-center">
                        {validationErrors.contactPerson}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Contact No:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="number"
                      name="contactNo"
                      value={invoiceData.contactNo}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.contactNo ? "error-input" : ""
                      }`}
                      placeholder="Contact Number"
                      required
                    />
                    {validationErrors.contactNo && (
                      <div className="error-message text-center">
                        {validationErrors.contactNo}
                      </div>
                    )}
                  </td>
                </tr>
                   <tr className="border-b border-black">
                  <td className="p-1 font-semibold">WhatsApp No:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="number"
                      name="whatsappNo"
                      value={invoiceData.whatsappNo}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.whatsappNo ? "error-input" : ""
                      }`}
                      placeholder="WhatsApp Number"
                    />
                    {validationErrors.whatsappNo && (
                      <div className="error-message text-center">
                        {validationErrors.whatsappNo}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Email:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="email"
                      name="email"
                      value={invoiceData.email}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.email ? "error-input" : ""
                      }`}
                      placeholder="Email"
                      required
                    />
                    {validationErrors.email && (
                      <div className="error-message text-center">
                        {validationErrors.email}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">PR NO:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="number"
                      name="prNo"
                      value={invoiceData.prNo}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.prNo ? "error-input" : ""
                      }`}
                      placeholder="PR Number"
                      required
                    />
                    {validationErrors.prNo && (
                      <div className="error-message text-center">
                        {validationErrors.prNo}
                      </div>
                    )}
                  </td>
                </tr>
            
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Payment Terms:</td>
                  <td className="p-1 font-semibold">
                    <select
                      name="paymentTerms"
                      value={invoiceData.paymentTerms}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.paymentTerms ? "error-input" : ""
                      }`}
                      required
                    >
                      <option value="" disabled>
                        Select Payment Terms
                      </option>
                      <option value="Fifteen Days">15-Days</option>
                      <option value="30-days">30-days</option>
                      <option value="45-days">45-days</option>
                    </select>
                    {validationErrors.paymentTerms && (
                      <div className="error-message text-center">
                        {validationErrors.paymentTerms}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">GST No:</td>
                  <td className="p-1 font-semibold">
                    <div className="w-full text-center text-black">
                      {invoiceData.gstNo}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-1 font-semibold">Supplier GST:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="text"
                      name="supplierGST"
                      value={invoiceData.supplierGST}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.supplierGST ? "error-input" : ""
                      }`}
                      placeholder="Supplier GST"
                      required
                    />
                    {validationErrors.supplierGST && (
                      <div className="error-message text-center">
                        {validationErrors.supplierGST}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-black">
            <table className="w-full">
              <tbody>
              
                    <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Supplier Offer Date:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="date"
                      name="supplierOfferDate"
                      value={invoiceData.supplierOfferDate}
                      onChange={handleInputChange}
                      max={invoiceData.date}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.supplierOfferDate ? "error-input" : ""
                      }`}
                      required
                    />
                    {validationErrors.supplierOfferDate && (
                      <div className="error-message text-center">
                        {validationErrors.supplierOfferDate}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Date:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="date"
                      name="date"
                      value={invoiceData.date}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.date ? "error-input" : ""
                      }`}
                      required
                    />
                    {validationErrors.date && (
                      <div className="error-message text-center">
                        {validationErrors.date}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Ref No:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="number"
                      name="refNo"
                      value={invoiceData.refNo}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.refNo ? "error-input" : ""
                      }`}
                      placeholder="Reference Number"
                      required
                    />
                    {validationErrors.refNo && (
                      <div className="error-message text-center">
                        {validationErrors.refNo}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Validity:</td>
                  <td className="p-1 font-semibold">
                    <select
                      name="validity"
                      value={invoiceData.validity}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.validity ? "error-input" : ""
                      }`}
                      required
                    >
                      <option value="" disabled>
                        Select Validity
                      </option>
                      <option value="day-1">Day-1</option>
                      <option value="day-2">Day-2</option>
                      <option value="day-3">Day-3</option>
                      <option value="day-4">Day-4</option>
                      <option value="day-5">Day-5</option>
                      <option value="1-week">1 Week</option>
                    </select>
                    {validationErrors.validity && (
                      <div className="error-message text-center">
                        {validationErrors.validity}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Supplier Offer No.:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="number"
                      name="supplierOfferNo"
                      value={invoiceData.supplierOfferNo}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.supplierOfferNo ? "error-input" : ""
                      }`}
                      placeholder="Supplier Offer Number"
                      required
                    />
                    {validationErrors.supplierOfferNo && (
                      <div className="error-message text-center">
                        {validationErrors.supplierOfferNo}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Delivery Period:</td>
                  <td className="p-1 font-semibold">
                    <select
                      name="deliveryPeriod"
                      value={invoiceData.deliveryPeriod}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.deliveryPeriod ? "error-input" : ""
                      }`}
                      required
                    >
                      <option value="" disabled>
                        Select Delivery Period
                      </option>
                      <option value="1-day">1 Day</option>
                      <option value="2-days">2 Days</option>
                      <option value="3-days">3 Days</option>
                      <option value="4-days">4 Days</option>
                      <option value="5-days">5 Days</option>
                      <option value="1-week">1 Week</option>
                      <option value="2-weeks">2 Weeks</option>
                      <option value="1-month">1 Month</option>
                    </select>
                    {validationErrors.deliveryPeriod && (
                      <div className="error-message text-center">
                        {validationErrors.deliveryPeriod}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Transportation:</td>
                  <td className="p-1 font-semibold">
                    <select
                      name="transportation"
                      value={invoiceData.transportation}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.transportation ? "error-input" : ""
                      }`}
                      required
                    >
                      <option value="" disabled>
                        Select Transportation
                      </option>
                      <option value="vehicle">Vehicle</option>
                      <option value="courier">Courier</option>
                    </select>
                    {validationErrors.transportation && (
                      <div className="error-message text-center">
                        {validationErrors.transportation}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Pan No:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="text"
                      name="panNo"
                      value={invoiceData.panNo}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.panNo ? "error-input" : ""
                      }`}
                      placeholder="PAN Number"
                      required
                    />
                    {validationErrors.panNo && (
                      <div className="error-message text-center">
                        {validationErrors.panNo}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 font-semibold">Purchase Request:</td>
                  <td className="p-1 font-semibold">
                    <input
                      type="text"
                      name="purchaseRequest"
                      value={invoiceData.purchaseRequest}
                      onChange={handleInputChange}
                      className={`w-full border-none focus:outline-none text-center text-black ${
                        validationErrors.purchaseRequest ? "error-input" : ""
                      }`}
                      placeholder="Purchase Request Person Name"
                      required
                    />
                    {validationErrors.purchaseRequest && (
                      <div className="error-message text-center">
                        {validationErrors.purchaseRequest}
                      </div>
                    )}
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
  <div className="flex justify-between items-center mb-1">
    <div className="text-lg font-bold">Material and Pricing</div>
    <div className="flex gap-2">
      <button
        onClick={addItem}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Material
      </button>
      <button
        onClick={() => removeItem(0)}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Remove Material
      </button>
    </div>
  </div>

  {validationErrors.items && (
    <div className="error-message mb-2">{validationErrors.items}</div>
  )}
  
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
        <th className="border border-black p-2 w-24">Total</th>
      </tr>
    </thead>
    <tbody>
      {invoiceData.items.map((item, index) => {
        // Filter products for this specific row based on search term
        const filteredProducts = products.filter(product =>
          product.productname.toLowerCase().includes(
            (item.productSearchTerm || '').toLowerCase()
          )
        );

        return (
          <tr key={item.id}>
            <td className="border border-black p-2 text-center">{index + 1}</td>
            
            {/* ItemCode with prefix */}
            <td className="border border-black p-2">
              <div className="relative">
                <div className="flex items-center">
                  <span className="bg-gray-100 px-2 py-1">RM00</span>
                  <input
                    type="text"
                    value={item.itemcode.replace('RM00', '')}
                    onChange={(e) => {
                      const newCode = `RM00${e.target.value}`;
                      handleItemChange(index, "itemcode", newCode);
                      
                      // Auto-fill when exact match found
                      if (e.target.value.length >= 2) {
                        const foundProduct = products.find(p => 
                          p.itemcode.toLowerCase() === newCode.toLowerCase()
                        );
                        if (foundProduct) {
                          handleItemChange(index, "productname", foundProduct.productname);
                          handleItemChange(index, "description", foundProduct.description);
                          handleItemChange(index, "productSearchTerm", ""); // Clear search term
                        }
                      }
                    }}
                    placeholder="29"
                    className={`w-full border-none focus:outline-none text-center ${
                      validationErrors[`items[${index}].itemcode`] ? "error-input" : ""
                    }`}
                    required
                  />
                </div>
                {validationErrors[`items[${index}].itemcode`] && (
                  <div className="error-message text-center">
                    {validationErrors[`items[${index}].itemcode`]}
                  </div>
                )}
              </div>
            </td>

            {/* Product Name with search dropdown */}
            <td className="border border-black p-2">
              <div className="relative">
                <input
                  type="text"
                  value={item.productSearchTerm || ''}
                  onChange={(e) => {
                    handleItemChange(index, "productSearchTerm", e.target.value);
                    // Clear product if search term changes
                    if (e.target.value === "") {
                      handleItemChange(index, "productname", "");
                    }
                  }}
                  placeholder="Search by name..."
                  className={`w-full border-none focus:outline-none text-center mb-1 ${
                    validationErrors[`items[${index}].productname`] ? "error-input" : ""
                  }`}
                />
                <select
                  value={item.productname}
                  onChange={(e) => {
                    const selectedProduct = products.find(
                      (p) => p.productname === e.target.value
                    );
                    if (selectedProduct) {
                      handleItemChange(index, "productname", selectedProduct.productname);
                      handleItemChange(index, "description", selectedProduct.description);
                      handleItemChange(index, "itemcode", selectedProduct.itemcode);
                      handleItemChange(index, "productSearchTerm", ""); // Clear search term
                    }
                  }}
                  className={`w-full border-none focus:outline-none text-center ${
                    validationErrors[`items[${index}].productname`] ? "error-input" : ""
                  }`}
                  required
                >
                  <option value="" disabled>
                    {filteredProducts.length === 0 ? "No matching products" : "Select Product"}
                  </option>
                  {filteredProducts.map((product) => (
                    <option key={product.id} value={product.productname}>
                      {product.productname}
                    </option>
                  ))}
                </select>
                {validationErrors[`items[${index}].productname`] && (
                  <div className="error-message">
                    {validationErrors[`items[${index}].productname`]}
                  </div>
                )}
              </div>
            </td>

          {/* Description */}
          <td className="border border-black p-2">
            <input
              type="text"
              value={item.description}
              onChange={(e) => handleItemChange(index, "description", e.target.value)}
              className="w-full border-none focus:outline-none"
            />
          </td>

          {/* Units */}
          <td className="border border-black p-2">
            <select
              value={item.units}
              onChange={(e) => handleItemChange(index, "units", e.target.value)}
              className={`w-full border-none focus:outline-none ${
                validationErrors[`items[${index}].units`] ? "error-input" : ""
              }`}
              required
            >
              <option value="" disabled>Select Unit</option>
              <option value="kg">Kg</option>
              <option value="pcs">Pcs</option>
              <option value="numbers">Numbers</option>
            </select>
            {validationErrors[`items[${index}].units`] && (
              <div className="error-message">
                {validationErrors[`items[${index}].units`]}
              </div>
            )}
          </td>

          {/* Rate */}
          <td className="border border-black p-2">
            <input
              type="number"
              value={item.rate}
              onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value))}
              className={`w-full border-none focus:outline-none text-center ${
                validationErrors[`items[${index}].rate`] ? "error-input" : ""
              }`}
              min="0.01"
              step="0.01"
              required
            />
            {validationErrors[`items[${index}].rate`] && (
              <div className="error-message">
                {validationErrors[`items[${index}].rate`]}
              </div>
            )}
          </td>

          {/* Quantity */}
          <td className="border border-black p-2">
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
              className={`w-full border-none focus:outline-none text-center ${
                validationErrors[`items[${index}].quantity`] ? "error-input" : ""
              }`}
              min="1"
              required
            />
            {validationErrors[`items[${index}].quantity`] && (
              <div className="error-message">
                {validationErrors[`items[${index}].quantity`]}
              </div>
            )}
          </td>

          {/* GST Fields */}
          {isDelhiSupplier ? (
            <>
              <td className="border border-black p-2">
                <input
                  type="number"
                  value={item.cgst}
                  onChange={(e) => handleItemChange(index, "cgst", parseFloat(e.target.value))}
                  className={`w-full border-none focus:outline-none text-center ${
                    validationErrors[`items[${index}].cgst`] ? "error-input" : ""
                  }`}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                {validationErrors[`items[${index}].cgst`] && (
                  <div className="error-message">
                    {validationErrors[`items[${index}].cgst`]}
                  </div>
                )}
              </td>
              <td className="border border-black p-2">
                <input
                  type="number"
                  value={item.sgst}
                  onChange={(e) => handleItemChange(index, "sgst", parseFloat(e.target.value))}
                  className={`w-full border-none focus:outline-none text-center ${
                    validationErrors[`items[${index}].sgst`] ? "error-input" : ""
                  }`}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                {validationErrors[`items[${index}].sgst`] && (
                  <div className="error-message">
                    {validationErrors[`items[${index}].sgst`]}
                  </div>
                )}
              </td>
            </>
          ) : (
            <td className="border border-black p-2">
              <input
                type="number"
                value={item.igst}
                onChange={(e) => handleItemChange(index, "igst", parseFloat(e.target.value))}
                className={`w-full border-none focus:outline-none text-center ${
                  validationErrors[`items[${index}].igst`] ? "error-input" : ""
                }`}
                min="0"
                max="100"
                step="0.01"
                required
              />
              {validationErrors[`items[${index}].igst`] && (
                <div className="error-message">
                  {validationErrors[`items[${index}].igst`]}
                </div>
              )}
            </td>
          )}

          {/* Total */}
          <td className="border border-black p-2 text-center">
            {item.total.toFixed(2)}
          </td>
          
          <td className="border border-black p-2 print:hidden hidden">
            <button
              onClick={() => removeItem(index)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            >
              Remove
            </button>
          </td>
            {/* ... rest of the row fields remain the same ... */}
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
        <div className="flex flex justify-start border border-black p-1 -start">
          <div className="font-bold">
            Total Amount: {Number(invoiceData.totalAmount || 0).toFixed(2)}
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
                  If there is any defect in the Material, Replacement will be
                  done Immediately, Otherwise Payment will be made after
                  debiting the amount of defective Part.
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
          {validationErrors.preparedBySignature && (
            <div className="text-red-500 text-sm text-center mb-2 col-span-3">
              {validationErrors.preparedBySignature}
            </div>
          )}
          {/* Prepared By Signature */}
          <div className="signature-container text-center flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="mb-2 font-bold w-24 text-right">Prepared By:</div>
              <div
                className="signature-image-wrapper border border-none flex items-center justify-center"
                style={{ width: "7cm", height: "3cm" }}
              >
                {invoiceData.preparedBySignature && (
                  <img
                    src={`${
                      import.meta.env.VITE_API_BASE_URL
                    }/signatures/${invoiceData.preparedBySignature
                      .split("/")
                      .pop()}`}
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

          {validationErrors.verifiedBySignature && (
            <div className="text-red-500 text-sm text-center mb-2 col-span-3">
              {validationErrors.verifiedBySignature}
            </div>
          )}
          {/* Verified By Signature */}
          <div className="signature-container text-center flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="mb-2 font-bold w-24 text-right">Verified By:</div>
              <div
                className="signature-image-wrapper border border-none flex items-center justify-center"
                style={{ width: "7cm", height: "3cm" }}
              >
                {invoiceData.verifiedBySignature && (
                  <img
                    src={`${
                      import.meta.env.VITE_API_BASE_URL
                    }/signatures/${invoiceData.verifiedBySignature
                      .split("/")
                      .pop()}`}
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

          {validationErrors.authorizedSignature && (
            <div className="text-red-500 text-sm text-center mb-2 col-span-3">
              {validationErrors.authorizedSignature}
            </div>
          )}
          {/* Authorized Signature */}
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
                    src={`${
                      import.meta.env.VITE_API_BASE_URL
                    }/signatures/${invoiceData.authorizedSignature
                      .split("/")
                      .pop()}`}
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
      </div>
      <div className="all-button flex justify-center items-center mt-4 mb-4 print:hidden">
        <button
          onClick={updatePO}
          disabled={isLoading}
          className={`bg-[rgb(34,197,94)] hover:bg-[rgb(22,163,74)] text-white font-bold py-2 px-6 rounded text-sm transition-all duration-300 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Updating..." : "Update P.O"}
        </button>
      </div>
    </div>
  );
};

export default EditInvoice;
