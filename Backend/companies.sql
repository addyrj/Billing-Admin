-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 14, 2025 at 01:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `companies`
--

-- --------------------------------------------------------

--
-- Table structure for table `partnerdata`
--

CREATE TABLE `partnerdata` (
  `id` int(11) NOT NULL,
  `companyName` varchar(255) NOT NULL,
  `firmType` varchar(100) NOT NULL,
  `natureOfBusiness` varchar(255) NOT NULL,
  `gstNo` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `registeredOfficeAddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`registeredOfficeAddress`)),
  `billingAddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`billingAddress`)),
  `shippingAddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`shippingAddress`)),
  `sameAsRegistered` tinyint(1) NOT NULL DEFAULT 0,
  `sameAsBilling` tinyint(1) NOT NULL DEFAULT 0,
  `contactNumbers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`contactNumbers`)),
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`products`)),
  `partnerId` int(11) NOT NULL,
  `partnerName` varchar(255) NOT NULL,
  `serialNumber` int(11) NOT NULL,
  `grandTotalPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `partnerdata`
--

INSERT INTO `partnerdata` (`id`, `companyName`, `firmType`, `natureOfBusiness`, `gstNo`, `email`, `registeredOfficeAddress`, `billingAddress`, `shippingAddress`, `sameAsRegistered`, `sameAsBilling`, `contactNumbers`, `products`, `partnerId`, `partnerName`, `serialNumber`, `grandTotalPrice`, `created_at`, `updated_at`) VALUES
(44, 'Aditya for Partner2vvv', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"fd\",\"modelNumber\":\"d - ₹1.00\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Smart Home Hub\",\"modelNumber\":\"Basic Edition - ₹75.00\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 4, 'Sales User 1', 1, 2360.00, '2025-04-22 06:05:52', '2025-04-28 11:59:39'),
(49, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 2, 'Admin Sales', 3, 2360.00, '2025-04-22 08:28:12', '2025-04-22 08:28:12'),
(50, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 2, 'Admin Sales', 4, 2360.00, '2025-04-22 08:29:59', '2025-04-22 08:29:59'),
(52, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 2, 'Admin Sales', 6, 2360.00, '2025-04-22 08:33:26', '2025-04-22 08:33:26'),
(53, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 2, 'Admin Sales', 7, 2360.00, '2025-04-22 09:24:35', '2025-04-22 09:24:35'),
(54, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 2, 'Admin Sales', 8, 2360.00, '2025-04-22 10:37:00', '2025-04-22 10:37:00'),
(61, 'Others 4', 'Partnership', 'Consumer', '09AAACH7409R1ZZ', 'addyrj20@gmail.com', '{\"address\":\"d\",\"State\":\"s\",\"pinCode\":\"234567\"}', '{\"address\":\"BOTENICAL GARDEN\",\"State\":\"Uttar Pradesh\",\"pinCode\":\"201303\"}', '{\"address\":\"sddfs\",\"State\":\"up\",\"pinCode\":\"123456\"}', 0, 0, '[\"9079027974\"]', '[{\"name\":\"dhjadklf\",\"modelNumber\":\"d - ₹100.00\",\"quantity\":\"1\",\"price\":\"1\",\"totalPrice\":1.18,\"gstIncluded\":\"true\"},{\"name\":\"High-Performance Gaming Mouse\",\"modelNumber\":\"Wired - Standard - ₹59.00\",\"quantity\":\"1\",\"price\":\"12\",\"totalPrice\":14.16,\"gstIncluded\":\"false\"}]', 4, 'Sales User 1', 5, 15.34, '2025-04-28 08:00:40', '2025-04-28 08:09:24'),
(79, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 4, 'Sales User 1', 19, 2360.00, '2025-05-01 09:24:54', '2025-05-01 09:24:54'),
(80, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 4, 'Sales User 1', 20, 2360.00, '2025-05-01 09:33:23', '2025-05-01 09:33:23'),
(81, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 4, 'Sales User 1', 21, 2360.00, '2025-05-01 09:34:06', '2025-05-01 09:34:06'),
(82, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 4, 'Sales User 1', 22, 2360.00, '2025-05-01 09:36:26', '2025-05-01 09:36:26'),
(84, 'test sales user', 'Proprietorship', 'Consumer', '07ABCDE1234F2Z5', 'adffs@adad.com', '{\"address\":\"edsdsa\",\"State\":\"Uttar Pradesh\",\"pinCode\":\"201303\"}', '{\"address\":\"dsd\",\"State\":\"sdds\",\"pinCode\":\"121212\"}', '{\"address\":\"hi this is testing\",\"State\":\"Uttar Pradesh\",\"pinCode\":\"201303\"}', 0, 0, '[\"4564564560\"]', '[{\"name\":\"Ergonomic Office Chair\",\"modelNumber\":\"Executive with Headrest - ₹299.00\",\"quantity\":\"1\",\"price\":\"12\",\"totalPrice\":14.16,\"gstIncluded\":\"true\"}]', 2, 'Admin Sales', 13, 14.16, '2025-05-02 06:29:15', '2025-05-02 06:29:15'),
(86, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 4, 'Sales User 1', 24, 2360.00, '2025-05-02 12:35:49', '2025-05-02 12:35:49'),
(87, 'Aditya for Partner2', 'Company', 'Supplier', '09AAACH7409R1ZZ', 'aditya@example.com', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"123 Main St, City, Country\",\"State\":\"State\",\"pinCode\":\"123456\"}', '{\"address\":\"456 Side St, City, Country\",\"State\":\"State\",\"pinCode\":\"654321\"}', 0, 0, '[\"9876543210\",\"9123456789\"]', '[{\"name\":\"Product A\",\"modelNumber\":\"A123\",\"quantity\":10,\"price\":100,\"gstIncluded\":true,\"totalPrice\":1180},{\"name\":\"Product B\",\"modelNumber\":\"B456\",\"quantity\":5,\"price\":200,\"gstIncluded\":true,\"totalPrice\":1180}]', 4, 'Sales User 1', 25, 2360.00, '2025-05-02 12:38:24', '2025-05-02 12:38:24');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `gstIncluded` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `created_at`, `gstIncluded`) VALUES
(33, 'Updated Product Name', '2025-04-28 06:31:20', 0),
(34, 'Smart Home Hub', '2025-04-28 06:33:18', 0),
(35, 'Ergonomic Office Chair', '2025-04-28 06:33:27', 0),
(36, 'Updated Product Name', '2025-04-28 06:33:37', 0),
(43, 'High-Performance Gaming Mouse', '2025-04-28 07:25:16', 0);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `validity` varchar(50) DEFAULT NULL,
  `deliveryPeriod` varchar(50) DEFAULT NULL,
  `transportation` enum('vehicle','courier') DEFAULT NULL,
  `panNo` varchar(10) DEFAULT NULL,
  `purchaseRequest` varchar(100) DEFAULT NULL,
  `supplier` varchar(100) NOT NULL,
  `supplierAddress` text NOT NULL,
  `contactPerson` varchar(50) DEFAULT NULL,
  `contactNo` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `prNo` varchar(50) DEFAULT NULL,
  `supplierOfferDate` date DEFAULT NULL,
  `paymentTerms` enum('Fifteen Days','30-days','45-days') DEFAULT NULL,
  `gstNo` varchar(15) NOT NULL,
  `supplierGST` varchar(15) DEFAULT NULL,
  `invoiceAddress` text NOT NULL,
  `deliveryAddress` text NOT NULL,
  `totalAmount` decimal(12,2) NOT NULL,
  `amountInWords` text NOT NULL,
  `preparedBySignature` varchar(255) DEFAULT NULL,
  `verifiedBySignature` varchar(255) DEFAULT NULL,
  `authorizedSignature` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `poNo` varchar(50) DEFAULT NULL,
  `refNo` varchar(50) DEFAULT NULL,
  `supplierOfferNo` varchar(50) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `date`, `validity`, `deliveryPeriod`, `transportation`, `panNo`, `purchaseRequest`, `supplier`, `supplierAddress`, `contactPerson`, `contactNo`, `email`, `prNo`, `supplierOfferDate`, `paymentTerms`, `gstNo`, `supplierGST`, `invoiceAddress`, `deliveryAddress`, `totalAmount`, `amountInWords`, `preparedBySignature`, `verifiedBySignature`, `authorizedSignature`, `created_at`, `updated_at`, `poNo`, `refNo`, `supplierOfferNo`, `items`) VALUES
(218, '2024-12-14', ' 30-days', '15-days', 'courier', 'BJLPR0228M', ' PR-001', 'Jio compan', ' 123 Supplier Street,new', ' John Doe', '9876543210', 'john@example.com', ' PR-001', '2024-12-09', '30-days', '07AAHCI3643R1ZZ', '22ABCDE1234F2Z5', 'IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075', 'IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075', 18600.00, 'eighteen thousand, six hundred rupees only', '/signatures/preparedBySignature-1747216999225-946647963.jpg', '/signatures/verifiedBySignature-1747216999228-166246585.jpg', '/signatures/authorizedSignature-1747216999223-714876322.jpg', '2025-05-14 10:03:19', '2025-05-14 10:03:19', 'PO-IOTTECH/25-26/218', ' REF-001', ' SUP-001', '[{\"id\":1,\"description\":\"GFSDFGSDFG\",\"productname\":\"SFDGSFDSDF\",\"units\":\"pcs\",\"rate\":120,\"quantity\":120,\"cgst\":0,\"sgst\":0,\"igst\":20,\"total\":17280},{\"id\":2,\"description\":\"AFDADFA\",\"productname\":\"RFEAFDD\",\"units\":\"kg\",\"rate\":120,\"quantity\":10,\"cgst\":0,\"sgst\":0,\"igst\":10,\"total\":1320}]'),
(219, '2025-05-15', 'day-2', '1-month', 'vehicle', 'BJLPR0228L', 'Adity by', 'Harry', 'BOTENICAL GARDEN', 'Aditya Ranjan', '9079027974', 'addyrj20@gmail.com', '32324', '2025-05-15', 'Fifteen Days', '07AAHCI3643R1ZZ', '10AABCU9355J1Z9', 'IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075', 'IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075', 274520.00, 'two hundred seventy four thousand, five hundred twenty rupees only', '/signatures/preparedBySignature-1747219564622-832840676.png', '/signatures/verifiedBySignature-1747219564622-425033780.png', '/signatures/authorizedSignature-1747219564622-131248187.png', '2025-05-14 10:46:04', '2025-05-14 10:46:04', 'PO-IOTTECH/25-26/219', '23313', '12112', '[{\"id\":1,\"description\":\"Wireless rechargeable keyboard with sleek aluminum design 3.\",\"productname\":\"Apple Magic Keyboard\",\"units\":\"kg\",\"rate\":12230,\"quantity\":20,\"cgst\":0,\"sgst\":0,\"igst\":10,\"total\":269060},{\"id\":1747219526332,\"description\":\"Full HD LED monitor with anti-glare display and HDMI input.\",\"productname\":\"Dell Monitor 24-inch\",\"units\":\"kg\",\"rate\":210,\"quantity\":20,\"cgst\":0,\"sgst\":0,\"igst\":30,\"total\":5460}]');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_products`
--

CREATE TABLE `purchase_products` (
  `id` int(11) NOT NULL,
  `productname` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_products`
--

INSERT INTO `purchase_products` (`id`, `productname`, `description`, `created_at`) VALUES
(13, 'Dell Monitor 24-inch', 'Full HD LED monitor with anti-glare display and HDMI input.', '2025-04-18 12:41:40'),
(15, 'Apple Magic Keyboard', 'Wireless rechargeable keyboard with sleek aluminum design.', '2025-04-18 12:42:12'),
(16, 'Apple Magic Keyboard', 'Wireless rechargeable keyboard with sleek aluminum design 3.', '2025-04-29 17:13:21');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(3, 'adminpurchase'),
(2, 'adminsales'),
(5, 'purchaseuser'),
(4, 'salesuser'),
(1, 'superadmin');

-- --------------------------------------------------------

--
-- Table structure for table `sub_products`
--

CREATE TABLE `sub_products` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `model` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_products`
--

INSERT INTO `sub_products` (`id`, `product_id`, `model`, `created_at`, `price`) VALUES
(117, 34, 'Basic Edition', '2025-04-28 06:33:18', 75.00),
(118, 34, 'Premium Edition', '2025-04-28 06:33:18', 150.00),
(119, 34, 'Pro Edition', '2025-04-28 06:33:18', 225.00),
(120, 35, 'Standard with Lumbar Support', '2025-04-28 06:33:27', 199.00),
(121, 35, 'Executive with Headrest', '2025-04-28 06:33:27', 299.00),
(124, 36, 'Updated Model 1', '2025-04-28 06:37:11', 100.00),
(125, 36, 'Updated Model 2', '2025-04-28 06:37:11', 180.00),
(140, 33, 'Updated Model 1', '2025-04-28 07:02:45', 10.00),
(141, 33, 'Updated Model 2', '2025-04-28 07:02:45', 18.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `mobile`, `password`, `role_id`, `created_by`, `created_at`) VALUES
(1, 'Super Admin', 'superadmin@example.com', '9876543210', '$2b$10$mIJT8zybR7w0mBVATtHGFelpahtj9bo5yDC4F5OHh6n7ShL3proei', 1, NULL, '2025-04-18 13:02:36'),
(2, 'Admin Sales', 'adminsales@example.com', '9876543216', '$2b$10$0VuI67jWc2g7GYSK.iAXfenaDuvoDYN7fqleOlk86kOX.AuFKjNyu', 2, 1, '2025-04-18 13:32:25'),
(3, 'Admin Purchase', 'adminpurchase@example.com', '5876543216', '$2b$10$V8k.aft7d7U1iHa0s2pdjOVgtIg6FJ3Dh8kn6S0hxc/kPCSSslsea', 3, 1, '2025-04-18 13:32:51'),
(4, 'Sales User 1', 'salesuser1@example.com', '9876543213', '$2b$10$WVo3GnxXwa63sh4gdPUR7OGDTNCGvrEX5FTYnne2lKEg5oqrLG8ou', 4, 2, '2025-04-21 08:51:20'),
(5, 'Purchase User 1', 'purchaseuser1@example.com', '9876543214', '$2b$10$sYkOiE8C2DqTDZoNYKjTaeF9YiHyf6T4yCZLeB2i0OMcsLmciMclq', 5, 3, '2025-04-21 08:52:23'),
(9, 'Aditya Ranjan', 'addyrj20@gmail.com', '9079027974', '$2b$10$v9fTmt7ogaNS7rhRwTHOwOMLf/K8wO70R4PK4sAllnfxoLqK5BCQW', 4, 2, '2025-04-30 12:40:48'),
(12, 'admin purchaserr', 'adminpurchase@gmail.com', '1010101010', '$2b$10$24DjzqrE8va/ipArgevmHOIbz20.pyjopXgnuY9qKceLYt8pKP6oy', 5, 3, '2025-05-01 05:23:14'),
(14, '1Admin Purchase', '1adminpurchase@example.com', '1876543212', '$2b$10$LbhPWNjPRlyp41qVmaba8.D62BOiziCEJr8GDhSzRuz/ikDAOmbCu', 3, 1, '2025-05-01 07:48:48'),
(24, 'testing', 'dssda@fgrd.com', '1235656556', '$2b$10$00aVHFBeu4xRL19gEifIwe8NJ.pE48jA53f202mS31MdMj3Lqo0tG', 3, 1, '2025-05-07 12:20:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `partnerdata`
--
ALTER TABLE `partnerdata`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `poNO` (`poNo`),
  ADD KEY `date` (`date`),
  ADD KEY `supplier` (`supplier`),
  ADD KEY `supplierGST` (`supplierGST`),
  ADD KEY `created_at` (`created_at`),
  ADD KEY `idx_po_search` (`poNo`,`date`,`supplier`);

--
-- Indexes for table `purchase_products`
--
ALTER TABLE `purchase_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `description` (`description`) USING HASH;

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `sub_products`
--
ALTER TABLE `sub_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `mobile` (`mobile`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `created_by` (`created_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `partnerdata`
--
ALTER TABLE `partnerdata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- AUTO_INCREMENT for table `purchase_products`
--
ALTER TABLE `purchase_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sub_products`
--
ALTER TABLE `sub_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=229;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sub_products`
--
ALTER TABLE `sub_products`
  ADD CONSTRAINT `sub_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
