import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./login/Login";

// SalesUser all pages
import Home from "./pages/salesuser/home/Home.jsx";
import CreateProducts from "./pages/salesuser/salesorder/createproduct/Createproducts.jsx";
import AllProducts from "./pages/salesuser/salesorder/allproducts/AllProducts.jsx";
import UpdateProducts from "./pages/salesuser/salesorder/updateproduct/UpdateProducts.jsx";
import Products from "./pages/salesuser/IottechProducts/create-product/Products.jsx";
import GetAllProducts from "./pages/salesuser/IottechProducts/get-all-product/GetAllProducts.jsx";
import EditProduct from "./pages/salesuser/IottechProducts/edit-product/EditProduct.jsx";

// Admin sales all pages
import HomeSalesAdmin from "./pages/adminsales/home/Home.jsx";
import CreateproductsSales from "./pages/adminsales/salesorder/createproduct/Createproducts.jsx";
import AllProductsSales from "./pages/adminsales/salesorder/allproducts/AllProducts.jsx";
import UpdateProductSales from "./pages/adminsales/salesorder/updateproduct/UpdateProducts.jsx";
import ProductsSales from "./pages/adminsales/IottechProducts/create-product/Products.jsx";
import AllProductsAdminSales from "./pages/adminsales/IottechProducts/get-all-product/GetAllProducts.jsx";
import EditProductSales from "./pages/adminsales/IottechProducts/edit-product/EditProduct.jsx";
import Createpartner from "./pages/adminsales/partner/createpartner/Createpartner.jsx";
import EditPartner from "./pages/adminsales/partner/editpartner/EditPartner.jsx";
import GetPartner from "./pages/adminsales/partner/get-all-partner/GetPartner.jsx";
import ProductsAll from "./pages/adminsales/productsall/ProductsAll.jsx";

// Admin Purchase all pages
import HomePurchaseAdmin from "./pages/adminpurchase/home/Home.jsx";
import InvoiceCreate from "./pages/adminpurchase/invoice/invoicecreate/InvoiceCreate.jsx";
import GetInvoice from "./pages/adminpurchase/invoice/getInvoice/GetInvoice.jsx";
import ViewInvoice from "./pages/adminpurchase/invoice/viewinvoice/ViewInvoice.jsx";
import EditInvoice from "./pages/adminpurchase/invoice/editInvoice/EditInvoice.jsx";
import CreatepartnerP from "./pages/adminpurchase/partner/createpartner/Createpartner.jsx";
import EditPartnerP from "./pages/adminpurchase/partner/editpartner/EditPartner.jsx";
import GetPartnerP from "./pages/adminpurchase/partner/get-all-partner/GetPartner.jsx";
import CreatePurchaseProduct from "./pages/adminpurchase/purchaseProductList/createPurchaseProduct/createPurchaseProduct.jsx";
import AllPurchaseProducts from "./pages/adminpurchase/purchaseProductList/allPurchaseProducts/AllPurchaseProducts.jsx";
import EditPurchaseProduct from "./pages/adminpurchase/purchaseProductList/editPurchaseProduct/EditPurchaseProduct.jsx";

// User Purchase all pages
import HomePurchaseUser from "./pages/purchaseuser/home/Home.jsx";
// import InvoiceCreateU from "./pages/purchaseuser/invoice/invoicecreate/InvoiceCreate.jsx";
import GetInvoiceU from "./pages/purchaseuser/invoice/getInvoice/GetInvoice.jsx";
import ViewInvoiceU from "./pages/purchaseuser/invoice/viewinvoice/ViewInvoice.jsx";
import EditInvoiceU from "./pages/purchaseuser/invoice/editInvoice/EditInvoice.jsx";
import CreatePurchaseProductU from "./pages/purchaseuser/purchaseProductList/createPurchaseProduct/createPurchaseProduct.jsx";
import AllPurchaseProductsU from "./pages/purchaseuser/purchaseProductList/allPurchaseProducts/AllPurchaseProducts.jsx";
import EditPurchaseProductU from "./pages/purchaseuser/purchaseProductList/editPurchaseProduct/EditPurchaseProduct.jsx";


// Super Admin All Pages..

import HomeSuperAdmin from "./pages/superadmin/home/Home.jsx";
import GetAllUsers from "./pages/superadmin/AllUsers/AllUsers.jsx";
import CreatepartnerS from "./pages/superadmin/partner/createpartner/Createpartner.jsx";
import EditPartnerS from "./pages/superadmin/partner/editpartner/EditPartner.jsx";
import GetPartnerS from "./pages/superadmin/partner/get-all-partner/GetPartner.jsx";
import GetInvoiceS from "./pages/superadmin/getInvoice/GetInvoice.jsx";
import ViewInvoiceS from "./pages/superadmin/viewinvoice/ViewInvoice.jsx";
import AllProductsSalesS from "./pages/superadmin/productsall/ProductsAll.jsx";


// Page not found
import NotFound from "./pagesNotFound.jsx";

const ProtectedRoute = ({ children, allowedRoles, redirectPath = "/" }) => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to={redirectPath} replace />;
  }

  let user;
  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleDashboard = {
      superadmin: "/superadmin",
      adminsales: "/adminsales",
      adminpurchase: "/admin/purchase",
      salesuser: "/salesuser",
      purchaseuser: "/purchase",
      partner: "/client",
    };

    return <Navigate to={roleDashboard[user.role] || redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      {/* You can add common layout components here like header, sidebar */}
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Sales User Routes */}
        <Route
          path="/salesuser"
          element={
            <ProtectedRoute allowedRoles={["salesuser"]}>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<AllProducts />} />
          <Route path="all-products" element={<AllProducts />} />
          <Route path="create-product" element={<CreateProducts />} />
          <Route path="update-product/:id" element={<UpdateProducts />} />
          <Route path="create-iot-product" element={<Products />} />
          <Route path="get-iot-product" element={<GetAllProducts />} />
          <Route path="edit-iot-product/:id" element={<EditProduct />} />
        </Route>
        {/* Admin sales Routes */}

        <Route
          path="/adminsales"
          element={
            <ProtectedRoute allowedRoles={["adminsales"]}>
              <AppLayout>
                <HomeSalesAdmin />
              </AppLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<AllProductsSales />} />
          <Route path="all-products" element={<AllProductsSales />} />
          <Route path="create-product" element={<CreateproductsSales />} />
          <Route path="update-product/:id" element={<UpdateProductSales />} />
          <Route path="create-iot-product" element={<ProductsSales />} />
          <Route path="get-iot-product" element={<AllProductsAdminSales />} />
          <Route path="edit-iot-product/:id" element={<EditProductSales />} />
          <Route path="create-partner" element={<Createpartner />} />
          <Route path="edit-partner/:id" element={<EditPartner />} />
          <Route path="get-all-partner" element={<GetPartner />} />
          <Route path="sales-all-product" element={<ProductsAll />} />
        </Route>
        {/* Purchase Admin  Routes */}
        <Route
          path="/adminpurchase"
          element={
            <ProtectedRoute allowedRoles={["adminpurchase"]}>
              <AppLayout>
                <HomePurchaseAdmin />
              </AppLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<GetInvoice />} />
          <Route path="all-invoice" element={<GetInvoice />} />
          <Route path="create-invoice" element={<InvoiceCreate />} />
          <Route path="view-invoice/:id" element={<ViewInvoice />} />
          <Route path="edit-invoice/:id" element={<EditInvoice />} />
          <Route path="create-partner" element={<CreatepartnerP />} />
          <Route path="edit-partner/:id" element={<EditPartnerP />} />
          <Route path="get-all-partner" element={<GetPartnerP />} />
          <Route path="create-pp" element={<CreatePurchaseProduct />} />
          <Route path="get-all-pp" element={<AllPurchaseProducts />} />
          <Route path="edit-all-pp/:id" element={<EditPurchaseProduct />} />
        </Route>
        {/* Purchase Users  Routes */}
        <Route
          path="/purchaseuser"
          element={
            <ProtectedRoute allowedRoles={["purchaseuser"]}>
              <AppLayout>
                <HomePurchaseUser />
              </AppLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<GetInvoiceU />} />
          <Route path="all-products" element={<AllProductsSales />} />
          <Route path="all-invoice" element={<GetInvoiceU />} />
          {/* <Route path="create-invoice" element={<InvoiceCreateU />} /> */}
          <Route path="view-invoice/:id" element={<ViewInvoiceU />} />
          <Route path="edit-invoice/:id" element={<EditInvoiceU />} />
          <Route path="create-pp" element={<CreatePurchaseProductU />} />
          <Route path="get-all-pp" element={<AllPurchaseProductsU />} />
          <Route path="edit-all-pp/:id" element={<EditPurchaseProductU />} />
        </Route>

             {/* Super Admin  Routes */}
             <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <AppLayout>
                <HomeSuperAdmin />
              </AppLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<GetAllUsers />} />
          <Route path="all-user" element={<GetAllUsers />} />
          <Route path="create-partner" element={<CreatepartnerS />} />
          <Route path="edit-partner/:id" element={<EditPartnerS />} />
          <Route path="get-all-partner" element={<GetPartnerS/>} />
              <Route path="view-invoice/:id" element={<ViewInvoiceS />} />
              <Route path="all-invoice" element={<GetInvoiceS />} />
              <Route path="all-products" element={<AllProductsSalesS />} />
    
     
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
