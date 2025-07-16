import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import img1 from "../../../../Assets/logo_01.png";

const EditGrn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [formData, setFormData] = useState({
    grnNo: "",
    grnDate: "",
    preparedBy: "",
    vendorName: "",
    contactPerson: "",
    address: "",
    invoiceNo: "",
    invoiceDate: "",
    poNo: "",
    items: [
      {
        sNo: 1,
        sku: "",
        goodsDescription: "",
        uom: "",
        receivedQuantity: "",
        goodQuantity: "",
        damageQuantity: "",
        perUnitCost: "",
        amount: "",
        damageStatus: "No Damage",
        damageAmount: 0,
      },
    ],
    freight: "0",
    gst_percentage: "0",
    payableInWords: "",
  });

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Fetch products when component mounts
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
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchGrnData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/grn/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          const grnData = result.data;
          setFormData({
            grnNo: grnData.grn_no || "",
            grnDate: formatDateForInput(grnData.grn_date),
            preparedBy: grnData.prepared_by || "",
            vendorName: grnData.vendor_name || "",
            address: grnData.address || "",
            invoiceNo: grnData.invoice_no || "",
            invoiceDate: formatDateForInput(grnData.invoice_date),
            poNo: grnData.po_no || "",
            items: grnData.items.map((item, index) => ({
              sNo: index + 1,
              sku: item.sku || "",
              goodsDescription: item.goods_description || "",
              uom: item.uom || "",
              receivedQuantity: item.received_quantity?.toString() || "",
              goodQuantity: item.good_quantity?.toString() || "",
              damageQuantity: item.damage_quantity?.toString() || "",
              perUnitCost: item.per_unit_cost?.toString() || "",
              amount: (item.received_quantity * item.per_unit_cost).toFixed(2),
              damageStatus: item.damage_status || "No Damage",
              damageAmount: (item.damage_quantity * item.per_unit_cost).toFixed(
                2
              ),
            })),
            freight: grnData.freight?.toString() || "0",
            gst_percentage: grnData.gst_percentage?.toString() || "0",
          });
        }
      } catch (error) {
        console.error("Failed to fetch GRN data:", error);
        alert(`Failed to load GRN: ${error.message}`);
      } finally {
        setIsFetching(false);
      }
    };

    fetchGrnData();
  }, [id]);

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.grnDate) errors.grnDate = "GRN Date is required";
    if (!formData.preparedBy.trim())
      errors.preparedBy = "Prepared By is required";
    if (!formData.vendorName.trim())
      errors.vendorName = "Vendor Name is required";
    if (!formData.address.trim()) errors.address = "Vendor Address is required";
    if (!formData.invoiceNo.trim()) errors.invoiceNo = "Invoice No is required";
    if (!formData.invoiceDate) errors.invoiceDate = "Invoice Date is required";
    if (!formData.poNo.trim()) errors.poNo = "PO No is required";

    // Items validation
    formData.items.forEach((item, index) => {
      if (!item.sku.trim()) errors[`items[${index}].sku`] = "SKU is required";
      if (!item.goodsDescription.trim())
        errors[`items[${index}].goodsDescription`] = "Description is required";
      if (!item.uom) errors[`items[${index}].uom`] = "UOM is required";
      if (!item.receivedQuantity || parseFloat(item.receivedQuantity) <= 0)
        errors[`items[${index}].receivedQuantity`] =
          "Valid quantity is required";
      if (!item.perUnitCost || parseFloat(item.perUnitCost) <= 0)
        errors[`items[${index}].perUnitCost`] = "Valid unit cost is required";

      // Validation for damage quantities
      if (item.damageStatus === "Damage") {
        if (!item.goodQuantity || parseFloat(item.goodQuantity) < 0)
          errors[`items[${index}].goodQuantity`] =
            "Valid good quantity is required";
        if (!item.damageQuantity || parseFloat(item.damageQuantity) <= 0)
          errors[`items[${index}].damageQuantity`] =
            "Valid damage quantity is required";

        const totalQty =
          (parseFloat(item.goodQuantity) || 0) +
          (parseFloat(item.damageQuantity) || 0);
        if (totalQty !== parseFloat(item.receivedQuantity)) {
          errors[`items[${index}].quantities`] =
            "Good + Damage quantities must equal Received quantity";
        }
      }
    });

    if (formData.freight === "" || isNaN(parseFloat(formData.freight))) {
      errors.freight = "Freight amount is required";
    } else if (parseFloat(formData.freight) < 0) {
      errors.freight = "Freight cannot be negative";
    }

    if (
      formData.gst_percentage === "" ||
      isNaN(parseFloat(formData.gst_percentage))
    ) {
      errors.gst_percentage = "GST percentage is required";
    }

    setValidationErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "freight" || name === "gst_percentage") {
      processedValue = Math.max(
        0,
        isNaN(parseFloat(value)) ? "" : parseFloat(value)
      );
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
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
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === "receivedQuantity" || field === "perUnitCost") {
      const quantity = parseFloat(updatedItems[index].receivedQuantity) || 0;
      const cost = parseFloat(updatedItems[index].perUnitCost) || 0;
      updatedItems[index].amount = (quantity * cost).toFixed(2);
    }

    if (field === "damageStatus") {
      if (value === "Damage") {
        const totalQty = parseFloat(updatedItems[index].receivedQuantity) || 0;
        updatedItems[index].goodQuantity = totalQty.toString();
        updatedItems[index].damageQuantity = "0";
      } else {
        updatedItems[index].goodQuantity = "";
        updatedItems[index].damageQuantity = "";
      }
    }

    if (field === "goodQuantity" || field === "damageQuantity") {
      const goodQty = parseFloat(updatedItems[index].goodQuantity) || 0;
      const damageQty = parseFloat(updatedItems[index].damageQuantity) || 0;
      updatedItems[index].receivedQuantity = (goodQty + damageQty).toString();

      const cost = parseFloat(updatedItems[index].perUnitCost) || 0;
      updatedItems[index].amount = ((goodQty + damageQty) * cost).toFixed(2);
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    const errorKey = `items[${index}].${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Fix the addItem function
  const addItem = () => {
    setFormData((prev) => {
      const newItem = {
        sNo: prev.items.length + 1,
        sku: "",
        goodsDescription: "",
        uom: "",
        receivedQuantity: "",
        goodQuantity: "",
        damageQuantity: "",
        perUnitCost: "",
        amount: "",
        damageStatus: "No Damage",
        damageAmount: 0,
      };

      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      updatedItems.forEach((item, i) => {
        item.sNo = i + 1;
      });
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const receivedQty = parseFloat(item.receivedQuantity) || 0;
      const cost = parseFloat(item.perUnitCost) || 0;
      return sum + receivedQty * cost;
    }, 0);
  };

  const calculateDamageAmount = () => {
    return formData.items.reduce((sum, item) => {
      if (item.damageStatus === "Damage") {
        const damageQty = parseFloat(item.damageQuantity) || 0;
        const cost = parseFloat(item.perUnitCost) || 0;
        return sum + damageQty * cost;
      }
      return sum;
    }, 0);
  };

  const calculatePayableAmount = () => {
    const total = calculateTotal();
    const damageAmount = calculateDamageAmount();
    const subtotal = total - damageAmount;
    const freight = parseFloat(formData.freight) || 0;
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;

    const gstAmount = (subtotal + freight) * (gstPercentage / 100);

    return subtotal + freight + gstAmount;
  };

  const handleSubmit = async () => {
    const { isValid } = validateForm();

    if (!isValid) {
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        grn_date: formData.grnDate,
        prepared_by: formData.preparedBy,
        vendor_name: formData.vendorName,
        address: formData.address,
        invoice_no: formData.invoiceNo,
        invoice_date: formData.invoiceDate,
        po_no: formData.poNo,
        freight: parseFloat(formData.freight) || 0,
        gst_percentage: parseFloat(formData.gst_percentage) || 0,
        items: formData.items.map((item) => ({
          s_no: item.sNo,
          sku: item.sku,
          goods_description: item.goodsDescription,
          uom: item.uom,
          received_quantity: parseFloat(item.receivedQuantity) || 0,
          good_quantity:
            item.damageStatus === "Damage"
              ? parseFloat(item.goodQuantity) || 0
              : parseFloat(item.receivedQuantity) || 0,
          damage_quantity:
            item.damageStatus === "Damage"
              ? parseFloat(item.damageQuantity) || 0
              : 0,
          per_unit_cost: parseFloat(item.perUnitCost) || 0,
          damage_status: item.damageStatus,
        })),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/grn/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSubmissionSuccess(true);
        setTimeout(() => navigate("/purchaseuser/all-grn"), 3000);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorModal = () => {
    if (!showErrorModal) return null;

    const fieldErrors = {};
    Object.keys(validationErrors).forEach((key) => {
      const category = key.split(/[.[]/)[0];
      if (!fieldErrors[category]) {
        fieldErrors[category] = [];
      }
      fieldErrors[category].push(validationErrors[key]);
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-600">
              Validation Errors
            </h3>
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
                  {category.replace(/([A-Z])/g, " $1").trim()}
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
            GRN Updated Successfully!
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {formData.grnNo && (
                <>
                  GRN number: <strong>{formData.grnNo}</strong>
                </>
              )}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              You will be redirected to the GRN list shortly...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fix the loading state check
  if (isFetching || isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
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
          <h2 className="text-xl font-bold text-black">
            EDIT GOODS RECEIPT NOTE
          </h2>
          <p className="text-md text-blue-600">
            <span className="font-semibold">GRN No:</span>{" "}
            {formData.grnNo || ""}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-300 rounded">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleInputChange}
                  placeholder="Vendor Name"
                  className={`w-full p-2 border ${
                    validationErrors.vendorName
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-blue-500`}
                />
                {validationErrors.vendorName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.vendorName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice No *
                </label>
                <input
                  type="text"
                  name="invoiceNo"
                  placeholder="Invoice No"
                  value={formData.invoiceNo}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    validationErrors.invoiceNo
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-blue-500`}
                />
                {validationErrors.invoiceNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.invoiceNo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    validationErrors.invoiceDate
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-blue-500`}
                />
                {validationErrors.invoiceDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.invoiceDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO No *
                </label>
                <input
                  type="text"
                  name="poNo"
                  placeholder="PO No"
                  value={formData.poNo}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    validationErrors.poNo ? "border-red-500" : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-blue-500`}
                />
                {validationErrors.poNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.poNo}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-300 rounded">
            <div className="space-y-3">
              <div>
                <textarea
                  name="address"
                  placeholder="Vendor Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full p-2 border ${
                    validationErrors.address
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-blue-500`}
                />
                {validationErrors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GRN Date *
                </label>
                <input
                  type="date"
                  name="grnDate"
                  value={formData.grnDate}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    validationErrors.grnDate
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-blue-500`}
                />
                {validationErrors.grnDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.grnDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prepared By *
                </label>
                <input
                  type="text"
                  placeholder="Prepared By"
                  name="preparedBy"
                  value={formData.preparedBy}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    validationErrors.preparedBy
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-blue-500`}
                />
                {validationErrors.preparedBy && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.preparedBy}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded overflow-hidden">
          <div className="bg-gray-50 p-3 flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Items Details</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Add Item
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.items.length > 1) {
                    removeItem(formData.items.length - 1);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                disabled={formData.items.length === 1}
              >
                Remove Item
              </button>
            </div>
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
                    GOODS DESCRIPTION
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-16">
                    Unites
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-28">
                    Received Quantity
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-20">
                    Cost
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-20">
                    Amount
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border w-24">
                    Damage Status
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
                      <div className="relative">
                        <div className="flex items-center">
                          <span className="bg-gray-100 px-2 py-1">RM00</span>
                          <input
                            type="text"
                            value={item.sku.replace("RM00", "")}
                            onChange={(e) => {
                              const newCode = `RM00${e.target.value}`;
                              handleItemChange(index, "sku", newCode);

                              // Auto-fill description when exact match found
                              if (e.target.value.length >= 2) {
                                const foundProduct = products.find(
                                  (p) =>
                                    p.itemcode.toLowerCase() ===
                                    newCode.toLowerCase()
                                );
                                if (foundProduct) {
                                  handleItemChange(
                                    index,
                                    "goodsDescription",
                                    foundProduct.description
                                  );
                                }
                              }
                            }}
                            placeholder="00"
                            className={`w-full p-1 border ${
                              validationErrors[`items[${index}].sku`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded text-sm`}
                          />
                        </div>
                        {validationErrors[`items[${index}].sku`] && (
                          <p className="text-red-500 text-xs">
                            {validationErrors[`items[${index}].sku`]}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 border">
                      <textarea
                        value={item.goodsDescription}
                        readOnly
                        rows="2"
                        className="w-full p-1 border border-gray-300 rounded text-sm resize-none bg-gray-50"
                        placeholder="Description will auto-fill from SKU"
                      />
                      {validationErrors[`items[${index}].goodsDescription`] && (
                        <p className="text-red-500 text-xs">
                          {validationErrors[`items[${index}].goodsDescription`]}
                        </p>
                      )}
                    </td>
                    <td className="px-2 py-2 border">
                      <select
                        value={item.uom}
                        onChange={(e) =>
                          handleItemChange(index, "uom", e.target.value)
                        }
                        className={`w-full p-1 border ${
                          validationErrors[`items[${index}].uom`]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded text-sm`}
                      >
                        <option value="">Select</option>
                        <option value="PCS">PCS</option>
                        <option value="KG">KG</option>
                        <option value="Number">Number</option>
                      </select>
                      {validationErrors[`items[${index}].uom`] && (
                        <p className="text-red-500 text-xs">
                          {validationErrors[`items[${index}].uom`]}
                        </p>
                      )}
                    </td>
                    <td className="px-2 py-2 border">
                      {item.damageStatus === "Damage" ? (
                        <div className="space-y-1">
                          <input
                            type="number"
                            value={item.goodQuantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "goodQuantity",
                                e.target.value
                              )
                            }
                            placeholder="Good Qty"
                            className="w-full p-1 border border-green-300 bg-green-50 rounded text-sm"
                          />
                          <input
                            type="number"
                            value={item.damageQuantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "damageQuantity",
                                e.target.value
                              )
                            }
                            placeholder="Damage Qty"
                            className="w-full p-1 border border-red-300 bg-red-50 rounded text-sm"
                          />
                          <div className="text-xs text-gray-600">
                            Total:{" "}
                            {(parseFloat(item.goodQuantity) || 0) +
                              (parseFloat(item.damageQuantity) || 0)}
                          </div>
                          {validationErrors[`items[${index}].quantities`] && (
                            <p className="text-red-500 text-xs">
                              {validationErrors[`items[${index}].quantities`]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={item.receivedQuantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "receivedQuantity",
                              e.target.value
                            )
                          }
                          className={`w-full p-1 border ${
                            validationErrors[`items[${index}].receivedQuantity`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded text-sm`}
                        />
                      )}
                      {item.damageStatus === "No Damage" &&
                        validationErrors[
                          `items[${index}].receivedQuantity`
                        ] && (
                          <p className="text-red-500 text-xs">
                            {
                              validationErrors[
                                `items[${index}].receivedQuantity`
                              ]
                            }
                          </p>
                        )}
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        value={item.perUnitCost}
                        onChange={(e) =>
                          handleItemChange(index, "perUnitCost", e.target.value)
                        }
                        className={`w-full p-1 border ${
                          validationErrors[`items[${index}].perUnitCost`]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded text-sm`}
                      />
                      {validationErrors[`items[${index}].perUnitCost`] && (
                        <p className="text-red-500 text-xs">
                          {validationErrors[`items[${index}].perUnitCost`]}
                        </p>
                      )}
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
                    <td className="px-2 py-2 border">
                      <select
                        value={item.damageStatus}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "damageStatus",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="No Damage">No Damage</option>
                        <option value="Damage">Damage</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="border border-gray-300 rounded p-4">
              <div className="">
                <h1 className="font-medium text-gray-700 mb-2">
                  Grand total Calculation:
                </h1>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-medium text-red-600">TOTAL DEBIT:</span>
                  <span className="text-red-600">
                    ₹{calculateDamageAmount().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SUB TOTAL + FREIGHT:</span>
                  <span>
                    ₹
                    {(
                      calculateTotal() -
                      calculateDamageAmount() +
                      parseFloat(formData.freight || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({formData.gst_percentage}%):</span>
                  <span>
                    ₹
                    {(
                      (calculateTotal() -
                        calculateDamageAmount() +
                        parseFloat(formData.freight || 0)) *
                      (parseFloat(formData.gst_percentage || 0) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>PAYABLE AMOUNT:</span>
                  <span className="text-green-600">
                    ₹{calculatePayableAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium ${
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
                "Update Goods Receipt Note"
              )}
            </button>
          </div>

          <div className="border border-gray-300 rounded p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">TOTAL:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>DAMAGE AMOUNT:</span>
                <span>-₹{calculateDamageAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-medium">SUB TOTAL:</span>
                <span>
                  ₹{(calculateTotal() - calculateDamageAmount()).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span>FREIGHT *</span>
                <div className="flex flex-col items-end">
                  <input
                    type="number"
                    step="0.01"
                    name="freight"
                    value={formData.freight}
                    onChange={handleInputChange}
                    className={`w-24 p-1 border ${
                      validationErrors.freight
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded text-right`}
                  />
                  {validationErrors.freight && (
                    <p className="text-red-500 text-xs mt-1 text-right">
                      {validationErrors.freight}
                    </p>
                  )}
                </div>
              </div>
              {/* Fix the GST percentage select input */}
              <div className="flex justify-between items-start">
                <span>GST % *</span>
            <select
  name="gst_percentage"
  value={parseFloat(formData.gst_percentage).toString()}
  onChange={handleInputChange}
  className={`w-24 p-1 border rounded text-right ${
    validationErrors.gst_percentage ? "border-red-500" : "border-gray-300"
  }`}
  required
>
  <option value="">Select</option>
  <option value="0">0%</option>
  <option value="5">5%</option>
  <option value="12">12%</option>
  <option value="18">18%</option>
  <option value="28">28%</option>
</select>

              </div>
            </div>
          </div>
        </div>
      </div>

      <ErrorModal />
    </div>
  );
};

export default EditGrn;
