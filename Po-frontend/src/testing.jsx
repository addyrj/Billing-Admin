import "./createSales.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Loader from "../../../../loader/Loader";

function CreateproductsSales() {
  const [availableProducts, setAvailableProducts] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    firmType: "",
    natureOfBusiness: "",
    gstNo: "",
    email: "",
    registeredOfficeAddress: { address: "", State: "", pinCode: "" },
    billingAddress: { address: "", State: "", pinCode: "" },
    shippingAddress: { address: "", State: "", pinCode: "" },
    sameAsBilling: false,
    ContactNumbers: [""],
    products: [
      {
        name: "",
        modelNumber: "",
        quantity: "",
        price: "",
        totalPrice: 0,
        gstIncluded: true,
      },
    ],
    paymentMethod: "cod",
    paymentReference: "",
    paymentImages: [],
    paymentStatus: "pending", // Added payment status field
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [errorFields, setErrorFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Display Razorpay payment dialog
  const displayRazorpay = async (amount, orderId, userDetails, onSuccess, onFailure) => {
    const res = await loadRazorpayScript();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Your Company Name',
      description: 'Payment for Order',
      image: 'https://your-company-logo-url.com/logo.png',
      order_id: orderId,
      handler: function (response) {
        onSuccess(response);
      },
      prefill: {
        name: userDetails.companyName,
        email: userDetails.email || 'customer@example.com',
        contact: userDetails.ContactNumbers[0] || '9999999999'
      },
      notes: {
        address: userDetails.billingAddress.address
      },
      theme: {
        color: '#3399cc'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      onFailure(response);
    });
    paymentObject.open();
  };

  // Separate function to submit the full order
  const submitFullOrder = async (orderData) => {
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Add all simple fields
      formDataToSend.append("companyName", orderData.companyName);
      formDataToSend.append("firmType", orderData.firmType);
      formDataToSend.append("natureOfBusiness", orderData.natureOfBusiness);
      formDataToSend.append("gstNo", orderData.gstNo || "");
      formDataToSend.append("email", orderData.email || "");
      formDataToSend.append("sameAsBilling", orderData.sameAsBilling);
      formDataToSend.append("paymentMethod", orderData.paymentMethod || "cod");
      formDataToSend.append("paymentReference", orderData.paymentReference || "");
      formDataToSend.append("paymentStatus", orderData.paymentStatus || "pending");
      formDataToSend.append("grandTotalPrice", orderData.grandTotalPrice);

      // Add address objects as separate fields
      Object.entries(orderData.registeredOfficeAddress).forEach(([key, value]) => {
        formDataToSend.append(`registeredOfficeAddress[${key}]`, value);
      });

      Object.entries(orderData.billingAddress).forEach(([key, value]) => {
        formDataToSend.append(`billingAddress[${key}]`, value);
      });

      Object.entries(orderData.shippingAddress).forEach(([key, value]) => {
        formDataToSend.append(`shippingAddress[${key}]`, value);
      });

      // Add ContactNumbers as multiple fields
      orderData.ContactNumbers.forEach((number, index) => {
        formDataToSend.append(`ContactNumbers[${index}]`, number);
      });

      // Add products as multiple fields
      orderData.products.forEach((product, index) => {
        formDataToSend.append(`products[${index}][name]`, product.name);
        formDataToSend.append(`products[${index}][modelNumber]`, product.modelNumber);
        formDataToSend.append(`products[${index}][quantity]`, product.quantity);
        formDataToSend.append(`products[${index}][price]`, product.price);
        formDataToSend.append(`products[${index}][gstIncluded]`, product.gstIncluded);
        formDataToSend.append(`products[${index}][totalPrice]`, product.totalPrice);
      });

      // Add payment images
      orderData.paymentImages.forEach((file) => {
        formDataToSend.append("paymentImages", file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/companies`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      setMessage({ text: "Order created successfully!", type: "success" });
      setTimeout(() => {
        navigate("/all-products");
      }, 2000);
    } catch (error) {
      console.error("Order Submission Error:", error);
      setMessage({
        text: error.message || "Failed to create order",
        type: "error",
      });
      throw error; // Re-throw to handle in calling function
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/products`
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const responseData = await response.json();
        const productsData = responseData.data || [];
        const transformedProducts = productsData.map((item) => ({
          id: item.id,
          name: item.name?.trim() || "",
          models: item.models || "",
        }));
        setAvailableProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setMessage({ text: "Failed to load products", type: "error" });
        setAvailableProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const validateField = (name, value) => {
    // Common required field validation
    const requiredFields = [
      "companyName",
      "firmType",
      "natureOfBusiness",
      "billingAddress.address",
      "billingAddress.State",
      "billingAddress.pinCode",
      "shippingAddress.address",
      "shippingAddress.State",
      "shippingAddress.pinCode",
      "registeredOfficeAddress.address",
      "registeredOfficeAddress.State",
      "registeredOfficeAddress.pinCode",
      "ContactNumbers[0]",
      "paymentMethod",
    ];

    // Check if this is a required field
    if (requiredFields.includes(name) && !value) {
      // Return human-readable field names
      const fieldNames = {
        companyName: "Company Name",
        firmType: "Firm Type",
        natureOfBusiness: "Nature of Business",
        "billingAddress.address": "Billing Address",
        "billingAddress.State": "Billing State",
        "billingAddress.pinCode": "Billing PIN Code",
        "shippingAddress.address": "Shipping Address",
        "shippingAddress.State": "Shipping State",
        "shippingAddress.pinCode": "Shipping PIN Code",
        "registeredOfficeAddress.address": "Registered Office Address",
        "registeredOfficeAddress.State": "Registered Office State",
        "registeredOfficeAddress.pinCode": "Registered Office PIN Code",
        "ContactNumbers[0]": "Primary Contact Number",
        paymentMethod: "Payment Method",
      };

      return `${fieldNames[name] || name} is required`;
    }

    // Specific field validations
    switch (name) {
      case "gstNo":
        if (
          value &&
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(
            value
          )
        )
          return "Invalid GST format (e.g., 12ABCDE3456F7G8)";
        return "";
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return "";
      case "ContactNumbers[0]":
        if (!/^\d{10}$/.test(value)) return "Must be 10 digits";
        return "";
      case "billingAddress.pinCode":
      case "shippingAddress.pinCode":
      case "registeredOfficeAddress.pinCode":
        if (!/^\d{6}$/.test(value)) return "Must be 6 digits";
        return "";
      case "paymentReference":
        if (formData.paymentMethod !== "cod" && !value)
          return "Payment reference is required for this payment method";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate field immediately
    const error = validateField(name, value);
    if (error) {
      setErrorFields({ ...errorFields, [name]: error });
    } else {
      const newErrors = { ...errorFields };
      delete newErrors[name];
      setErrorFields(newErrors);
    }

    if (name.startsWith("ContactNumbers")) {
      const index = parseInt(name.match(/\d+/)[0]);
      const updatedContactNumbers = [...formData.ContactNumbers];
      updatedContactNumbers[index] = value;

      setFormData({
        ...formData,
        ContactNumbers: updatedContactNumbers,
      });
    } else if (
      name.startsWith("billingAddress.") ||
      name.startsWith("shippingAddress.") ||
      name.startsWith("registeredOfficeAddress.")
    ) {
      const [field, subField] = name.split(".");

      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subField]: value,
        },
      }));

      if (field === "billingAddress" && formData.sameAsBilling) {
        setFormData((prev) => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            [subField]: value,
          },
          registeredOfficeAddress: {
            ...prev.registeredOfficeAddress,
            [subField]: value,
          },
        }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsBilling: checked,
      shippingAddress: checked
        ? prev.billingAddress
        : { address: "", State: "", pinCode: "" },
      registeredOfficeAddress: checked
        ? prev.billingAddress
        : { address: "", State: "", pinCode: "" },
    }));
  };

  const addContactNumber = () => {
    setFormData({
      ...formData,
      ContactNumbers: [...formData.ContactNumbers, ""],
    });
  };

  const removeContactNumber = (index) => {
    const updatedContactNumbers = [...formData.ContactNumbers];
    updatedContactNumbers.splice(index, 1);
    setFormData({
      ...formData,
      ContactNumbers: updatedContactNumbers,
    });
  };

  const handleProductChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedProducts = [...formData.products];

    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: type === "checkbox" ? checked : value,
    };

    // Calculate total price
    const quantity = parseFloat(updatedProducts[index].quantity) || 0;
    const price = parseFloat(updatedProducts[index].price) || 0;
    let basePrice = quantity * price;

    if (updatedProducts[index].gstIncluded) {
      updatedProducts[index].totalPrice = (basePrice * 1.18).toFixed(2);
    } else {
      updatedProducts[index].totalPrice = basePrice.toFixed(2);
    }

    setFormData({ ...formData, products: updatedProducts });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          name: "",
          modelNumber: "",
          quantity: "",
          price: "",
          totalPrice: 0,
          gstIncluded: false,
        },
      ],
    });
  };

  const removeProduct = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData({
      ...formData,
      products: updatedProducts,
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    const validImages = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );

    if (validImages.length === 0) {
      setMessage({
        text: "Please upload valid image files (max 5MB each)",
        type: "error",
      });
      return;
    }

    const newFiles = [...formData.paymentImages, ...validImages].slice(0, 5);

    setFormData((prev) => ({
      ...prev,
      paymentImages: newFiles,
    }));

    e.target.value = "";
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      paymentImages: prev.paymentImages.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate all required fields
    const requiredFields = [
      "companyName",
      "firmType",
      "natureOfBusiness",
      "billingAddress.address",
      "billingAddress.State",
      "billingAddress.pinCode",
      "shippingAddress.address",
      "shippingAddress.State",
      "shippingAddress.pinCode",
      "registeredOfficeAddress.address",
      "registeredOfficeAddress.State",
      "registeredOfficeAddress.pinCode",
      "ContactNumbers[0]",
      "paymentMethod",
    ];

    requiredFields.forEach((field) => {
      let value;
      if (field.includes(".")) {
        const [obj, prop] = field.split(".");
        value = formData[obj][prop];
      } else if (field.includes("[")) {
        const match = field.match(/(\w+)\[(\d+)\]/);
        value = formData[match[1]][match[2]];
      } else {
        value = formData[field];
      }

      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Validate products
    if (formData.products.length === 0) {
      newErrors.products = "At least one product is required";
      isValid = false;
    } else {
      formData.products.forEach((product, index) => {
        if (!product.name) {
          newErrors[`products[${index}].name`] = "Product name is required";
          isValid = false;
        }
        if (!product.modelNumber) {
          newErrors[`products[${index}].modelNumber`] = "Model number is required";
          isValid = false;
        }
        if (!product.quantity || product.quantity <= 0) {
          newErrors[`products[${index}].quantity`] = "Valid quantity is required";
          isValid = false;
        }
        if (!product.price || product.price <= 0) {
          newErrors[`products[${index}].price`] = "Valid price is required";
          isValid = false;
        }
      });
    }

    setErrorFields(newErrors);
    return isValid;
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!validateForm()) {
      setShowValidationModal(true);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ text: "You are not logged in.", type: "error" });
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      // Add all simple fields
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("firmType", formData.firmType);
      formDataToSend.append("natureOfBusiness", formData.natureOfBusiness);
      formDataToSend.append("gstNo", formData.gstNo || "");
      formDataToSend.append("email", formData.email || "");
      formDataToSend.append("sameAsBilling", formData.sameAsBilling);
      formDataToSend.append("paymentMethod", formData.paymentMethod || "cod");
      formDataToSend.append(
        "paymentReference",
        formData.paymentReference || ""
      );

      // Add address objects as separate fields
      Object.entries(formData.registeredOfficeAddress).forEach(
        ([key, value]) => {
          formDataToSend.append(`registeredOfficeAddress[${key}]`, value);
        }
      );

      Object.entries(formData.billingAddress).forEach(([key, value]) => {
        formDataToSend.append(`billingAddress[${key}]`, value);
      });

      Object.entries(formData.shippingAddress).forEach(([key, value]) => {
        formDataToSend.append(`shippingAddress[${key}]`, value);
      });

      // Add ContactNumbers as multiple fields
      formData.ContactNumbers.forEach((number, index) => {
        formDataToSend.append(`ContactNumbers[${index}]`, number);
      });

      // Add products as multiple fields
      formData.products.forEach((product, index) => {
        formDataToSend.append(`products[${index}][name]`, product.name);
        formDataToSend.append(
          `products[${index}][modelNumber]`,
          product.modelNumber
        );
        formDataToSend.append(`products[${index}][quantity]`, product.quantity);
        formDataToSend.append(`products[${index}][price]`, product.price);
        formDataToSend.append(
          `products[${index}][gstIncluded]`,
          product.gstIncluded
        );
        formDataToSend.append(
          `products[${index}][totalPrice]`,
          product.totalPrice
        );
      });

// Calculate grand total
    const grandTotalPrice = formData.products.reduce((total, product) => {
      return total + parseFloat(product.totalPrice || 0);
    }, 0);
      formDataToSend.append("grandTotalPrice", grandTotalPrice);

      // Add payment images
      formData.paymentImages.forEach((file) => {
        formDataToSend.append("paymentImages", file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/companies`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      setMessage({ text: "Order created successfully!", type: "success" });
      setTimeout(() => {
        navigate("/all-products");
      }, 2000);
    } catch (error) {
      console.error("Submission Error:", error);
      setMessage({
        text: error.message || "Failed to create order",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeValidationModal = () => {
    setShowValidationModal(false);
  };

  const ErrorModal = () => {
    if (!showValidationModal) return null;

    const fieldErrors = {};
    Object.keys(errorFields).forEach((key) => {
      const category = key.split('.')[0] || "general";
      if (!fieldErrors[category]) {
        fieldErrors[category] = [];
      }
      fieldErrors[category].push(errorFields[key]);
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-600">Validation Errors</h3>
            <button
              onClick={closeValidationModal}
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
                  {category === "general" ? "General" : category.replace(/([A-Z])/g, ' $1').trim()}
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
              onClick={closeValidationModal}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Loader
        message="Processing your order..."
        color="#00a3c6"
        background="rgba(255, 255, 255, 0.95)"
        blurBackground={true}
      />
    );
  }

  return (
 <div className="sales-container3">
      <div className="sales-form-container">
        <div className="sales-form-header">
          <button
            className="sales-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </button>
          <h2 className="sales-form-title">Create New Order</h2>
        </div>

        {message.text && (
          <div className={`sales-message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="sales-form-scroll">
          <div className="sales-form-content">
            <div className="sales-form-group-main">
              <div className="sales-form-group">
                <label>Name of Company/Firm</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Enter company/firm name"
                  className={errorFields.companyName ? "sales-error-input" : ""}
                />
                {errorFields.companyName && (
                  <div className="sales-error-message">
                    {errorFields.companyName}
                  </div>
                )}
              </div>

              <div className="sales-form-group">
                <label>Firm Type</label>
                <select
                  name="firmType"
                  value={formData.firmType}
                  onChange={handleChange}
                  required
                  className={errorFields.firmType ? "sales-error-input" : ""}
                >
                  <option value="">Select Firm Type</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Company">Company</option>
                </select>
                {errorFields.firmType && (
                  <div className="sales-error-message">
                    {errorFields.firmType}
                  </div>
                )}
              </div>

              <div className="sales-form-group">
                <label>Nature of Business</label>
                <select
                  name="natureOfBusiness"
                  value={formData.natureOfBusiness}
                  onChange={handleChange}
                  required
                  className={
                    errorFields.natureOfBusiness ? "sales-error-input" : ""
                  }
                >
                  <option value="">Select Nature of Business</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Manufacturer">Manufacturer</option>
                </select>
                {errorFields.natureOfBusiness && (
                  <div className="sales-error-message">
                    {errorFields.natureOfBusiness}
                  </div>
                )}
              </div>
            </div>

            <div className="sales-form-group-main">
              <div className="sales-form-group">
                <label>GST No.</label>
                <input
                  type="text"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                  className={errorFields.gstNo ? "sales-error-input" : ""}
                />
                {errorFields.gstNo && (
                  <div className="sales-error-message">{errorFields.gstNo}</div>
                )}
              </div>

              <div className="sales-form-group">
                <label>Email Id</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email id"
                  className={errorFields.email ? "sales-error-input" : ""}
                />
                {errorFields.email && (
                  <div className="sales-error-message">{errorFields.email}</div>
                )}
              </div>
            </div>

            <div className="sales-address-section">
              <div className="sales-address-group">
                <h4>Billing Address</h4>
                <input
                  type="text"
                  name="billingAddress.address"
                  value={formData.billingAddress.address}
                  onChange={handleChange}
                  required
                  placeholder="Address"
                  className={
                    errorFields["billingAddress.address"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["billingAddress.address"] && (
                  <div className="sales-error-message">
                    {errorFields["billingAddress.address"]}
                  </div>
                )}
                <input
                  type="text"
                  name="billingAddress.State"
                  value={formData.billingAddress.State}
                  onChange={handleChange}
                  required
                  placeholder="State"
                  className={
                    errorFields["billingAddress.State"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["billingAddress.State"] && (
                  <div className="sales-error-message">
                    {errorFields["billingAddress.State"]}
                  </div>
                )}
                <input
                  type="text"
                  name="billingAddress.pinCode"
                  value={formData.billingAddress.pinCode}
                  onChange={handleChange}
                  required
                  placeholder="Pin Code"
                  className={
                    errorFields["billingAddress.pinCode"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["billingAddress.pinCode"] && (
                  <div className="sales-error-message">
                    {errorFields["billingAddress.pinCode"]}
                  </div>
                )}
              </div>

              <div className="sales-address-group">
                <h4>Shipping Address</h4>
                <input
                  type="text"
                  name="shippingAddress.address"
                  value={formData.shippingAddress.address}
                  onChange={handleChange}
                  required
                  placeholder="Address"
                  disabled={formData.sameAsBilling}
                  className={
                    errorFields["shippingAddress.address"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["shippingAddress.address"] && (
                  <div className="sales-error-message">
                    {errorFields["shippingAddress.address"]}
                  </div>
                )}
                <input
                  type="text"
                  name="shippingAddress.State"
                  value={formData.shippingAddress.State}
                  onChange={handleChange}
                  required
                  placeholder="State"
                  disabled={formData.sameAsBilling}
                  className={
                    errorFields["shippingAddress.State"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["shippingAddress.State"] && (
                  <div className="sales-error-message">
                    {errorFields["shippingAddress.State"]}
                  </div>
                )}
                <input
                  type="text"
                  name="shippingAddress.pinCode"
                  value={formData.shippingAddress.pinCode}
                  onChange={handleChange}
                  required
                  placeholder="Pin Code"
                  disabled={formData.sameAsBilling}
                  className={
                    errorFields["shippingAddress.pinCode"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["shippingAddress.pinCode"] && (
                  <div className="sales-error-message">
                    {errorFields["shippingAddress.pinCode"]}
                  </div>
                )}
              </div>

              <div className="sales-address-group">
                <h4>Registered Office Address</h4>
                <input
                  type="text"
                  name="registeredOfficeAddress.address"
                  value={formData.registeredOfficeAddress.address}
                  onChange={handleChange}
                  required
                  placeholder="Address"
                  disabled={formData.sameAsBilling}
                  className={
                    errorFields["registeredOfficeAddress.address"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["registeredOfficeAddress.address"] && (
                  <div className="sales-error-message">
                    {errorFields["registeredOfficeAddress.address"]}
                  </div>
                )}
                <input
                  type="text"
                  name="registeredOfficeAddress.State"
                  value={formData.registeredOfficeAddress.State}
                  onChange={handleChange}
                  required
                  placeholder="State"
                  disabled={formData.sameAsBilling}
                  className={
                    errorFields["registeredOfficeAddress.State"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["registeredOfficeAddress.State"] && (
                  <div className="sales-error-message">
                    {errorFields["registeredOfficeAddress.State"]}
                  </div>
                )}
                <input
                  type="text"
                  name="registeredOfficeAddress.pinCode"
                  value={formData.registeredOfficeAddress.pinCode}
                  onChange={handleChange}
                  required
                  placeholder="Pin Code"
                  disabled={formData.sameAsBilling}
                  className={
                    errorFields["registeredOfficeAddress.pinCode"]
                      ? "sales-error-input"
                      : ""
                  }
                />
                {errorFields["registeredOfficeAddress.pinCode"] && (
                  <div className="sales-error-message">
                    {errorFields["registeredOfficeAddress.pinCode"]}
                  </div>
                )}
              </div>
            </div>

            <div className="sales-checkbox-group">
              <label htmlFor="sameAsBilling">
                <input
                  type="checkbox"
                  id="sameAsBilling"
                  checked={formData.sameAsBilling}
                  onChange={handleCheckboxChange}
                />
                Billing Address, Shipping Address & Registered Office Address
                are the same
              </label>
            </div>

            <div className="sales-contact-section">
              {formData.ContactNumbers.map((number, index) => (
                <div className="sales-contact-group" key={index}>
                  <label>
                    {index === 0
                      ? "Contact No. (Mandatory)"
                      : `Contact Person ${index + 1}`}
                  </label>
                  <div className="sales-contact-input-container">
                    <input
                      type="number"
                      name={`ContactNumbers[${index}]`}
                      value={number}
                      onChange={handleChange}
                      placeholder={
                        index === 0
                          ? "Contact Number "
                          : "Contact Number (Optional)"
                      }
                      required={index === 0}
                      className={
                        errorFields[`ContactNumbers[${index}]`]
                          ? "sales-error-input"
                          : ""
                      }
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeContactNumber(index)}
                        className="sales-remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {errorFields[`ContactNumbers[${index}]`] && (
                    <div className="sales-error-message">
                      {errorFields[`ContactNumbers[${index}]`]}
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addContactNumber}
                className="sales-add-btn3"
              >
                Add More Contact
              </button>
            </div>

            <div className="sales-products-section">
              <h3>Products</h3>
              {errorFields.products && (
                <div className="sales-error-message">
                  {errorFields.products}
                </div>
              )}
              {formData.products.map((product, index) => (
                <div key={index} className="sales-product-item">
                  <div className="sales-product-row">
                    <div className="sales-product-field">
                      <label>Product Name</label>
                      <select
                        name="name"
                        value={product.name}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                        className={
                          errorFields[`products[${index}].name`]
                            ? "sales-error-input"
                            : ""
                        }
                      >
                        <option value="">Select Product</option>
                        {availableProducts.length > 0 ? (
                          availableProducts.map((prod) => (
                            <option key={prod.id} value={prod.name}>
                              {prod.name}
                            </option>
                          ))
                        ) : (
                          <option disabled>No products available</option>
                        )}
                      </select>
                      {errorFields[`products[${index}].name`] && (
                        <div className="sales-error-message">
                          {errorFields[`products[${index}].name`]}
                        </div>
                      )}
                    </div>

                    <div className="sales-product-field">
                      <label>Model Number</label>
                      <select
                        name="modelNumber"
                        value={product.modelNumber}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                        disabled={!product.name}
                        className={
                          errorFields[`products[${index}].modelNumber`]
                            ? "sales-error-input"
                            : ""
                        }
                      >
                        <option value="">Select Model</option>
                        {product.name &&
                          availableProducts
                            .find((prod) => prod.name === product.name)
                            ?.models?.split(",")
                            ?.map((model, idx) => (
                              <option key={idx} value={model.trim()}>
                                {model.trim()}
                              </option>
                            ))}
                      </select>
                      {errorFields[`products[${index}].modelNumber`] && (
                        <div className="sales-error-message">
                          {errorFields[`products[${index}].modelNumber`]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sales-product-row">
                    <div className="sales-product-field">
                      <label>Price</label>
                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={(e) => handleProductChange(index, e)}
                        placeholder="Price"
                        required
                        className={
                          errorFields[`products[${index}].price`]
                            ? "sales-error-input"
                            : ""
                        }
                      />
                      {errorFields[`products[${index}].price`] && (
                        <div className="sales-error-message">
                          {errorFields[`products[${index}].price`]}
                        </div>
                      )}
                    </div>

                    <div className="sales-product-field">
                      <label>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, e)}
                        placeholder="Quantity"
                        required
                        className={
                          errorFields[`products[${index}].quantity`]
                            ? "sales-error-input"
                            : ""
                        }
                      />
                      {errorFields[`products[${index}].quantity`] && (
                        <div className="sales-error-message">
                          {errorFields[`products[${index}].quantity`]}
                        </div>
                      )}
                    </div>

                    <div className="sales-product-field">
                      <label>GST</label>
                      <select
                        name="gstIncluded"
                        value={product.gstIncluded}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                      >
                        <option value="true">GST Included</option>
                        <option value="false">Without GST</option>
                      </select>
                    </div>

                    <div className="sales-product-field">
                      <label>Total Price</label>
                      <input
                        type="text"
                        name="totalPrice"
                        value={product.totalPrice || ""}
                        placeholder="Total Price"
                        readOnly
                      />
                    </div>

                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="sales-remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProduct}
                className="sales-add-btn3"
              >
                Add Product
              </button>
            </div>

            <div className="sales-payment-section">
              <h3>Payment Method</h3>

              <div className="sales-payment-methods">
                {["cod", "cheque", "online"].map((method) => (
                  <label key={method} className="sales-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={formData.paymentMethod === method}
                      onChange={handleChange}
                    />
                    <span>
                      {method === "cod"
                        ? "Cash on Delivery (COD)"
                        : method === "cheque"
                        ? "Cheque"
                        : "Online Payment"}
                    </span>
                  </label>
                ))}
              </div>
              {errorFields.paymentMethod && (
                <div className="sales-error-message">
                  {errorFields.paymentMethod}
                </div>
              )}

              <div className="sales-form-group">
                <label>Payment Reference</label>
                <input
                  type="text"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="Enter payment reference (e.g., cheque no, UTR, etc.)"
                  className={
                    errorFields.paymentReference ? "sales-error-input" : ""
                  }
                />
                {errorFields.paymentReference && (
                  <div className="sales-error-message">
                    {errorFields.paymentReference}
                  </div>
                )}
              </div>

              <div className="sales-form-group">
                <div className="sales-upload-header">
                  <p className="sales-upload-text">
                    Upload Payment Proof (min 1, max 5 images)
                  </p>

                  <div className="sales-upload-button-wrapper">
                    <input
                      id="payment-file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={formData.paymentImages.length >= 5}
                      className="sales-file-input"
                      style={{ display: "none" }} // ensure hidden
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("payment-file-upload").click()
                      }
                      disabled={formData.paymentImages.length >= 5}
                      className="sales-add-btn3"
                    >
                      Add Payment Image
                    </button>
                  </div>
                </div>

                {formData.paymentImages.length < 5 && (
                  <p className="sales-file-hint">
                    {formData.paymentImages.length} of 5 files selected
                  </p>
                )}

                {formData.paymentImages.length >= 5 && (
                  <p className="sales-file-limit">Maximum 5 files reached</p>
                )}

                {errorFields.paymentImages && (
                  <p className="sales-error-text">
                    {errorFields.paymentImages}
                  </p>
                )}

                {formData.paymentImages.length > 0 && (
                  <div className="sales-file-preview-container">
                    <div className="sales-file-preview-grid">
                      {formData.paymentImages.map((file, index) => (
                        <div key={index} className="sales-file-preview-item">
                          <div className="sales-file-thumbnail">
                            {file.type.startsWith("image/") && (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index}`}
                                onLoad={() => URL.revokeObjectURL(file)}
                              />
                            )}
                          </div>
                          <div className="sales-file-info">
                            <span className="sales-file-name">
                              {file.name.length > 20
                                ? `${file.name.substring(0, 15)}...${file.name
                                    .split(".")
                                    .pop()}`
                                : file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="sales-remove-btn"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sales-form-actions">
              <button type="submit" className="sales-submit-btn">
                Submit Order
              </button>
            </div>
          </div>
        </form>
      </div>
      <ErrorModal />
    </div>
  );
}

export default CreateproductsSales;
