import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePurchaseProduct.css";

const CreatePurchaseProduct = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
  
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Unauthorized: Please login first.");
      setIsSuccess(false);
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchase-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productname: productName,
          description: description
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setIsSuccess(true);
        setMessage("Purchase Product Created Successfully!");
        setTimeout(() => navigate("/adminpurchase/get-all-pp"), 1000);
      } else {
        setMessage(data.error || "Failed to create product.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="purchase-product-container">
      <div className="purchase-product-card">
        <h2 className="purchase-product-title">Create Purchase Product</h2>
        {message && (
          <div className={`purchase-product-message ${isSuccess ? "success" : "error"}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="purchase-product-form">
          <div className="purchase-product-form-group">
            <input
              type="text"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="purchase-product-input"
            />
          </div>

          <div className="purchase-product-form-group">
            <textarea
              placeholder="Product Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
              className="purchase-product-textarea"
            />
          </div>

          <div className="purchase-product-button-container">
            <button type="submit" className="purchase-product-submit-button">
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseProduct;