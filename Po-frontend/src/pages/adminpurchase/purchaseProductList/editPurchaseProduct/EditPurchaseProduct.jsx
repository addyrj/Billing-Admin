import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


const EditPurchaseProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/purchase-products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setProductName(data.productname);
          setDescription(data.description);
        } else {
          throw new Error(data.error || "Failed to fetch product.");
        }
      } catch (err) {
        setMessage(err.message);
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/purchase-products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productname: productName,
            description: description,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage("Purchase Product Updated Successfully!");
        setTimeout(() => navigate("/adminpurchase/get-all-pp"), 1000);
      } else {
        setMessage(data.error || "Failed to update product.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setIsSuccess(false);
    }
  };

  if (loading) {
    return <div className="purchase-product-loading">Loading product data...</div>;
  }

  return (
    <div className="purchase-product-container">
      <div className="purchase-product-card">
        <h2 className="purchase-product-title">Edit Purchase Product</h2>
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
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPurchaseProduct;