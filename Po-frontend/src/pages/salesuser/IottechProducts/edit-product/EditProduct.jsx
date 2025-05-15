import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const EditProductSales = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [models, setModels] = useState([]);
  const [modelInput, setModelInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch product");
        
        const { data } = await response.json();
        
        // Parse models from API response
        const parsedModels = data.models.split(',').map(item => {
          const cleanedItem = item.trim();
          // More robust price extraction
          const priceMatch = cleanedItem.match(/(?:₹|Rs\.?)\s*(\d+\.?\d*)/);
          const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
          // More robust model name extraction
          const modelName = cleanedItem.replace(/(?:₹|Rs\.?)\s*\d+\.?\d*.*$/, '').replace(/-+$/, '').trim();
          
          return `${modelName} - ₹${price.toFixed(2)}`;
        });

        setName(data.name.trim());
        setModels(parsedModels);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setMessage(`Error: ${error.message}`);
        setIsSuccess(false);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Updated handleEditModel function
const handleEditModel = (index) => {
  const model = models[index];

  const priceSeparator = model.includes(' - ₹') ? ' - ₹' : ' - Rs.';
  const parts = model.split(priceSeparator);

  if (parts.length === 2) {
    // Remove trailing dash if somehow included in model name
    setModelInput(parts[0].replace(/-\s*$/, '').trim());

    // Extract numeric price
    const priceValue = parts[1].replace(/[^0-9.]/g, '');
    setPriceInput(priceValue || "0");
  } else {
    setModelInput(model);
    setPriceInput("0");
  }

  setEditingIndex(index);
};



  // Rest of the component remains the same...
  const handleAddOrUpdateModel = () => {
    if (modelInput.trim() !== "" && priceInput.trim() !== "") {
      const price = parseFloat(priceInput.trim());
      const modelDescription = `${modelInput.trim()} - ₹${price.toFixed(2)}`;

      if (editingIndex !== null) {
        const updatedModels = [...models];
        updatedModels[editingIndex] = modelDescription;
        setModels(updatedModels);
        setEditingIndex(null);
      } else {
        setModels([...models, modelDescription]);
      }

      setModelInput("");
      setPriceInput("");
    }
  };

  const removeModel = (index) => {
    setModels(models.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setModelInput("");
      setPriceInput("");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Unauthorized: Please login first.");
      setIsSuccess(false);
      return;
    }

    try {
      const modelsForAPI = models.map((model) => {
        const [modelName, modelPrice] = model.split(" - ₹");
        return { name: modelName, price: parseFloat(modelPrice) };
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, models: modelsForAPI }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Product Updated Successfully!");
        setIsSuccess(true);
        setTimeout(() => {
       navigate("/salesuser/get-iot-product");
        }, 1500);
      } else {
        setMessage(data.error || "Failed to update product.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setIsSuccess(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sales-container2">
        <div className="sales-form-container2">
          <div className="sales-form-header2">
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowBackIcon />
            </button>
            <h2 className="sales-form-title">Edit Product (ID: {id})</h2>
          </div>
          <p>Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-container2">
      <div className="sales-form-container2">
        <div className="sales-form-header2">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </button>
          <h2 className="sales-form-title">Edit Product (ID: {id})</h2>
        </div>

        {message && (
          <div className={`message ${isSuccess ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateProduct} className="sales-form">
          <div className="form-group21">
            <label htmlFor="product-name">Product Name</label>
            <input
              id="product-name"
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group21">
            <label>Edit Models</label>
            <div className="model-input-group">
              <input
                type="text"
                placeholder="Model name"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                className="model-input"
              />
              <input
                type="number"
                placeholder="Price"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="price-input"
                min="0"
                step="0.01"
              />
              <button 
                type="button" 
                className="add-model-button"
                onClick={handleAddOrUpdateModel}
                disabled={!modelInput || !priceInput}
              >
                <AddIcon />
                {editingIndex !== null ? "Update Model" : "Add Model"}
              </button>
            </div>
          </div>

          {models.length > 0 && (
            <div className="models-list-container">
              <h3 className="models-list-title">Current Models</h3>
              <ul className="models-list">
                {models.map((model, index) => (
                  <li key={index} className="model-item">
                    <span className="model-text">{model}</span>
                    <div className="model-actions">
                      <button
                        type="button"
                        className="edit-model-button"
                        onClick={() => handleEditModel(index)}
                        aria-label="Edit model"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        type="button"
                        className="delete-model-button"
                        onClick={() => removeModel(index)}
                        aria-label="Delete model"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={!name || models.length === 0}
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductSales;