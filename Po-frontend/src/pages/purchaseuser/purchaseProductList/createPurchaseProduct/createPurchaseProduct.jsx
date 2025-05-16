import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./createPurchaseProduct.css";

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
          description: description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage("✅ Purchase Product Created Successfully!");
        setTimeout(() => navigate("/purchaseuser/get-all-pp"), 1000);
      } else {
        setMessage(data.error || "❌ Failed to create product.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("❌ Something went wrong. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="purchaseuser-container">
      <div className="purchaseuser-card">
        <h2 className="purchaseuser-title">Create Purchase Product</h2>
        {message && (
          <div className={`purchaseuser-message ${isSuccess ? "success" : "error"}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="purchaseuser-form-group">
            <input
              type="text"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="purchaseuser-input"
            />
          </div>

          <div className="purchaseuser-form-group">
            <textarea
              placeholder="Product Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="purchaseuser-textarea"
              rows="4"
            />
          </div>

          <div className="purchaseuser-button-container">
            <button type="submit" className="purchaseuser-submit-button">
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseProduct;
