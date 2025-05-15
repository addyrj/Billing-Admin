import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


const EditPurchaseProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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
        setMessage("❌ " + err.message);
        setIsSuccess(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Unauthorized: Please login first.");
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
        setMessage("✅ Purchase Product Updated Successfully!");
        setTimeout(() => navigate("/purchaseuser/get-all-pp"), 1000);
      } else {
        setMessage("❌ " + (data.error || "Failed to update product."));
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
        <h2 className="purchaseuser-title">Edit Purchase Product</h2>
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
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPurchaseProduct;
