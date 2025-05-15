import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function UpdateProductSales() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const [message, setMessage] = useState(null);
  const [errorFields, setErrorFields] = useState({});

  // Fetch existing data for the company
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ text: "You are not logged in.", type: "error" });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/companies/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const { data } = await response.json();
        
        // Handle contact numbers
        let ContactNumbers = [];
       if (data.contactNumbers) {
  try {
    ContactNumbers = JSON.parse(data.contactNumbers.replace(/\\"/g, '"'));
    ContactNumbers = ContactNumbers
      .map(num => String(num).replace(/\D/g, ''))
      .filter(num => num.length === 10);
  } catch (e) {
    console.error("Error parsing contact numbers:", e);
    ContactNumbers = [""];
  }
}

        if (ContactNumbers.length === 0) {
          ContactNumbers = [""];
        }

        setFormData({
          companyName: data.companyName || "",
          firmType: data.firmType || "",
          natureOfBusiness: data.natureOfBusiness || "",
          gstNo: data.gstNo || "",
          email: data.email || "",
          registeredOfficeAddress: data.registeredOfficeAddress || { 
            address: "", State: "", pinCode: "" 
          },
          billingAddress: data.billingAddress || { 
            address: "", State: "", pinCode: "" 
          },
          shippingAddress: data.shippingAddress || { 
            address: "", State: "", pinCode: "" 
          },
          sameAsBilling: Boolean(data.sameAsBilling),
          ContactNumbers: ContactNumbers,
          products: data.products || [
            {
              name: "",
              modelNumber: "",
              quantity: "",
              price: "",
              totalPrice: 0,
              gstIncluded: "true",
            }
          ],
        });
      } catch (error) {
        setMessage({ 
          text: "Error fetching data: " + error.message, 
          type: "error" 
        });
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch products and models from API
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
          models: item.models || ''
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return formData.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
  }, [formData.products]);

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

    if (
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

      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subField]: value,
        },
      }));

      if (field === "billingAddress" && formData.sameAsBilling) {
        setFormData(prev => ({
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
      return;
    }

    if (name === "gstNo") {
      if (value.length > 15) {
        setErrorFields({ ...errorFields, [name]: "Invalid GST Number" });
        return;
      } else {
        setErrorFields({ ...errorFields, [name]: "" });
      }
    }

    setErrorFields({ ...errorFields, [name]: "" });
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactNumberChange = (index, value) => {
    const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    
    setFormData(prev => {
      const newNumbers = [...prev.ContactNumbers];
      newNumbers[index] = cleanedValue;
      return { ...prev, ContactNumbers: newNumbers };
    });

    setErrorFields(prev => {
      const newErrors = { ...prev };
      if (cleanedValue && cleanedValue.length !== 10) {
        newErrors[`ContactNumbers[${index}]`] = "Must be 10 digits";
      } else {
        delete newErrors[`ContactNumbers[${index}]`];
      }
      return newErrors;
    });
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setFormData(prev => {
      const newState = {
        ...prev,
        sameAsBilling: checked
      };
      
      if (checked) {
        newState.shippingAddress = { ...prev.billingAddress };
        newState.registeredOfficeAddress = { ...prev.billingAddress };
      } else {
        newState.shippingAddress = { address: "", State: "", pinCode: "" };
        newState.registeredOfficeAddress = { address: "", State: "", pinCode: "" };
      }
      
      return newState;
    });
  };

  const addContactNumber = () => {
    setFormData(prev => ({
      ...prev,
      ContactNumbers: [...prev.ContactNumbers, ""]
    }));
  };

  const removeContactNumber = (index) => {
    setFormData(prev => {
      const newNumbers = [...prev.ContactNumbers];
      newNumbers.splice(index, 1);
      
      if (newNumbers.length === 0) {
        newNumbers.push("");
      }
      
      return {
        ...prev,
        ContactNumbers: newNumbers
      };
    });
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [name]: value
      };
      
      if (["quantity", "price", "gstIncluded"].includes(name)) {
        const quantity = parseFloat(updatedProducts[index].quantity) || 0;
        const price = parseFloat(updatedProducts[index].price) || 0;
        const basePrice = quantity * price;
        
        updatedProducts[index].totalPrice = updatedProducts[index].gstIncluded === "true"
          ? parseFloat((basePrice * 1.18).toFixed(2))
          : parseFloat(basePrice.toFixed(2));
      }
      
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          name: "",
          modelNumber: "",
          quantity: "",
          price: "",
          totalPrice: 0,
          gstIncluded: "true",
        },
      ],
    }));
  };

  const removeProduct = (index) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts.splice(index, 1);
      
      if (updatedProducts.length === 0) {
        updatedProducts.push({
          name: "",
          modelNumber: "",
          quantity: "",
          price: "",
          totalPrice: 0,
          gstIncluded: "true",
        });
      }
      
      return {
        ...prev,
        products: updatedProducts
      };
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

      // Clean and validate contact numbers
      const cleanContactNumbers = formData.ContactNumbers
        .map(num => String(num).replace(/\D/g, ''))
        .filter(num => num.length === 10);
        
      if (cleanContactNumbers.length === 0) {
        setMessage({ 
          text: "At least one valid 10-digit contact number is required", 
          type: "error" 
        });
        return;
      }

      // Prepare products with calculated totals
      const updatedProducts = formData.products.map(product => {
        const quantity = parseFloat(product.quantity) || 0;
        const price = parseFloat(product.price) || 0;
        const basePrice = quantity * price;
        const totalPrice = product.gstIncluded === "true" 
          ? parseFloat((basePrice * 1.18).toFixed(2))
          : parseFloat(basePrice.toFixed(2));
        
        return {
          ...product,
          totalPrice
        };
      });

      // Create the payload
      const payload = {
        companyName: formData.companyName,
        firmType: formData.firmType,
        natureOfBusiness: formData.natureOfBusiness,
        email: formData.email,
        registeredOfficeAddress: formData.registeredOfficeAddress,
        billingAddress: formData.billingAddress,
        shippingAddress: formData.shippingAddress,
        sameAsBilling: formData.sameAsBilling,
        ContactNumbers: cleanContactNumbers,
        products: updatedProducts,
        grandTotalPrice: updatedProducts.reduce((sum, p) => sum + p.totalPrice, 0)
      };

      // Only include gstNo if it has a value
      if (formData.gstNo && formData.gstNo.trim() !== "") {
        payload.gstNo = formData.gstNo;
      }

      console.log("Payload being sent:", payload); // Debug log

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/companies/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const fieldErrors = {};
          errorData.errors.forEach(error => {
            fieldErrors[error.field] = error.message;
          });
          setErrorFields(fieldErrors);
        }
        throw new Error(errorData.message || "Failed to update company");
      }

      const result = await response.json();
      setMessage({ 
        text: "Company updated successfully!", 
        type: "success" 
      });
      
      // Send confirmation email
      try {
        const emailResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/send-confirmation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: formData.email,
              companyName: formData.companyName,
              orderId: id
            }),
          }
        );

        if (!emailResponse.ok) {
          console.error("Error sending email:", await emailResponse.json());
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }

      setTimeout(() => navigate("/salesuser/all-products"), 2000);

    } catch (error) {
      console.error("Update error:", error);
      setMessage({ 
        text: error.message || "Error updating company", 
        type: "error" 
      });
    }
  };

  if (isLoading) {
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
            <h2 className="sales-form-title">Update Order (ID: {id})</h2>
          </div>
          <p>Loading order data...</p>
        </div>
      </div>
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
          <h2 className="sales-form-title">Update Order (ID: {id})</h2>
        </div>

        {message && (
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
                  className={errorFields["gstNo"] ? "sales-error-input" : ""}
                />
                {errorFields["gstNo"] && (
                  <div className="sales-error-message">{errorFields["gstNo"]}</div>
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
                <div className={`sales-contact-group ${index > 0 ? 'additional-contact' : ''}`} key={index}>
                  <label>
                    {index === 0
                      ? "Contact No. (Mandatory)"
                      : `Contact Person ${index}`}
                  </label>
                  <div className="sales-contact-input-container">
                    <input
                      type="tel"
                      value={number}
                      onChange={(e) => handleContactNumberChange(index, e.target.value)}
                      placeholder="10 digit mobile number"
                      required={index === 0}
                      maxLength={10}
                      className={errorFields[`ContactNumbers[${index}]`] ? "sales-error-input" : ""}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeContactNumber(index)}
                        className="sales-remove-contact-btn"
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
                        {products.length > 0 ? (
                          products.map((prod) => (
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
                        {product.name && products
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
                        min="0"
                        step="0.01"
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
                        min="1"
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
                        className="sales-remove-product-btn"
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

            <div className="sales-total-section">
              <h4>Grand Total: ₹{grandTotal.toFixed(2)}</h4>
            </div>

            <div className="sales-form-actions">
              <button type="submit" className="sales-submit-btn">
                Update Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProductSales;