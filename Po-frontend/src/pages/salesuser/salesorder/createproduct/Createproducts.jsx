import "./createSales.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
        gstIncluded: "true",
      },
    ],
  });
  
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errorFields, setErrorFields] = useState({});
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const responseData = await response.json();
        const productsData = responseData.data || [];
        const transformedProducts = productsData.map(item => ({
          id: item.id,
          name: item.name?.trim() || '',
          models: item.models || '',
        }));
        setAvailableProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setAvailableProducts([]);
      }
    };
    fetchProducts();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrorFields({ ...errorFields, [name]: "Invalid Email Address" });
      } else {
        setErrorFields({ ...errorFields, [name]: "" });
      }
    }
  
    if (name.startsWith("ContactNumbers")) {
      const index = parseInt(name.match(/\d+/)[0]);
      const updatedContactNumbers = [...formData.ContactNumbers];
      updatedContactNumbers[index] = value;
  
      if (index === 0 && (value.length > 10 || !/^\d*$/.test(value))) {
        setErrorFields({
          ...errorFields,
          [`ContactNumbers[${index}]`]: "Invalid Contact Number",
        });
      } else {
        setErrorFields({
          ...errorFields,
          [`ContactNumbers[${index}]`]: "",
        });
      }
  
      setFormData({
        ...formData,
        ContactNumbers: updatedContactNumbers,
      });
    }
    else if (
      name.startsWith("billingAddress.") ||
      name.startsWith("shippingAddress.") ||
      name.startsWith("registeredOfficeAddress.")
    ) {
      const [field, subField] = name.split(".");
  
      if (subField === "pinCode" && (value.length > 6 || !/^\d*$/.test(value))) {
        setErrorFields({ ...errorFields, [name]: "Invalid Pin Code" });
        return;
      } else {
        setErrorFields({ ...errorFields, [name]: "" });
      }
  
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
    }
    else {
      setErrorFields({ ...errorFields, [name]: "" });
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
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];

    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: value,
    };

    const quantity = parseFloat(updatedProducts[index].quantity) || 0;
    const price = parseFloat(updatedProducts[index].price) || 0;
    let basePrice = quantity * price;

    if (updatedProducts[index].gstIncluded === "true") {
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
          gstIncluded: "false",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ text: "You are not logged in.", type: "error" });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message, type: "error" });
        return;
      }

      setMessage({ text: data.message, type: "success" });
      setTimeout(() => {
        navigate("/all-products");
      }, 2000);
    } catch (error) {
      setMessage({ text: "Network error! Check your server.", type: "error" });
    }
  };

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
                />
              </div>

              <div className="sales-form-group">
                <label>Firm Type</label>
                <select
                  name="firmType"
                  value={formData.firmType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Firm Type</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Company">Company</option>
                </select>
              </div>
              
              <div className="sales-form-group">
                <label>Nature of Business</label>
                <select
                  name="natureOfBusiness"
                  value={formData.natureOfBusiness}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Nature of Business</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Manufacturer">Manufacturer</option>
                </select>
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
                />
              </div>
              
              <div className="sales-form-group">
                <label>Email Id</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email id"
                  className={errorFields["email"] ? "sales-error-input" : ""}
                />
                {errorFields["email"] && (
                  <div className="sales-error-message">{errorFields["email"]}</div>
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
                />
                <input
                  type="text"
                  name="billingAddress.State"
                  value={formData.billingAddress.State}
                  onChange={handleChange}
                  required
                  placeholder="State"
                />
                <input
                  type="text"
                  name="billingAddress.pinCode"
                  value={formData.billingAddress.pinCode}
                  onChange={handleChange}
                  required
                  placeholder="Pin Code"
                />
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
                />
                <input
                  type="text"
                  name="shippingAddress.State"
                  value={formData.shippingAddress.State}
                  onChange={handleChange}
                  required
                  placeholder="State"
                  disabled={formData.sameAsBilling}
                />
                <input
                  type="text"
                  name="shippingAddress.pinCode"
                  value={formData.shippingAddress.pinCode}
                  onChange={handleChange}
                  required
                  placeholder="Pin Code"
                  disabled={formData.sameAsBilling}
                />
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
                />
                <input
                  type="text"
                  name="registeredOfficeAddress.State"
                  value={formData.registeredOfficeAddress.State}
                  onChange={handleChange}
                  required
                  placeholder="State"
                  disabled={formData.sameAsBilling}
                />
                <input
                  type="text"
                  name="registeredOfficeAddress.pinCode"
                  value={formData.registeredOfficeAddress.pinCode}
                  onChange={handleChange}
                  required
                  placeholder="Pin Code"
                  disabled={formData.sameAsBilling}
                />
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
                Billing Address, Shipping Address & Registered Office Address are the same
              </label>
            </div>

            <div className="sales-contact-section">
              {formData.ContactNumbers.map((number, index) => (
                <div className="sales-contact-group" key={index}>
                  <label>
                    {index === 0
                      ? "Contact No. (Mandatory)"
                      : `Contact Person ${index}`}
                  </label>
                  <div className="sales-contact-input-container">
                    <input
                      type="number"
                      name={`ContactNumbers[${index}]`}
                      value={number}
                      onChange={handleChange}
                      placeholder={
                        index === 0 ? "Contact Number " : "Contact Number (Optional)"
                      }
                      required={index === 0}
                      className={errorFields[`ContactNumbers[${index}]`] ? "sales-error-input" : ""}
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
                    </div>

                    <div className="sales-product-field">
                      <label>Model Number</label>
                      <select
                        name="modelNumber"
                        value={product.modelNumber}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                        disabled={!product.name}
                      >
                        <option value="">Select Model</option>
                        {product.name && availableProducts
                          .find(prod => prod.name === product.name)
                          ?.models
                          ?.split(',')
                          ?.map((model, idx) => (
                            <option key={idx} value={model.trim()}>
                              {model.trim()}
                            </option>
                          ))}
                      </select>
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
                      />
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
                      />
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

            <div className="sales-form-actions">
              <button type="submit" className="sales-submit-btn">
                Submit Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateproductsSales;