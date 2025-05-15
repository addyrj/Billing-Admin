const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a professional PDF invoice document from invoice data
 * @param {Object} invoiceData - The invoice/purchase order data
 * @param {string|null} outputPath - Optional file path to save the PDF (if null, returns buffer)
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
const generateInvoicePDF = async (invoiceData, outputPath = null) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate input data
      if (!invoiceData || typeof invoiceData !== 'object') {
        throw new Error('Invalid invoice data: must be an object');
      }

      // Create a new PDF document with optimized margins for single-page layout if possible
      const doc = new PDFDocument({
        margin: 20,
        size: 'A4',
        bufferPages: true
      });

      // Set up buffers to collect PDF data
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        if (outputPath) {
          fs.writeFile(outputPath, pdfBuffer, (err) => {
            if (err) {
              console.error('Error saving PDF file:', err);
              reject(new Error('Failed to save PDF file'));
            } else {
              resolve(pdfBuffer);
            }
          });
        } else {
          resolve(pdfBuffer);
        }
      });

      // Error handler
      doc.on('error', (err) => {
        console.error('PDF generation error:', err);
        reject(new Error('PDF generation failed during streaming'));
      });

      // --- Document Content Starts Here ---
      // Define measurements
      const pageWidth = doc.page.width;
      const margin = 25; // Balanced margin for readability and space efficiency
      const contentWidth = pageWidth - (margin * 2);
      
      // HEADER SECTION - Company logo and title
      addHeader(doc, invoiceData, margin, contentWidth);

      // CLIENT AND SUPPLIER DETAILS
      addClientAndSupplierDetails(doc, invoiceData, margin, contentWidth);

      // INVOICE AND DELIVERY INFO
      addDeliveryInfo(doc, invoiceData, margin, contentWidth);

      // ITEMS TABLE - Products, quantities, prices
      addItemsTable(doc, invoiceData, margin, contentWidth);

      // TOTALS SECTION - Final amounts
      addTotalsSection(doc, invoiceData, margin, contentWidth);

      // TERMS AND SIGNATURES
      addTermsAndSignatures(doc, invoiceData, margin, contentWidth);

      // Finalize the PDF
      doc.end();

    } catch (err) {
      console.error('PDF generation failed:', err);
      reject(new Error('PDF generation failed: ' + err.message));
    }
  });
};

/**
 * Adds header with company logo and title
 */
function addHeader(doc, invoiceData, margin, contentWidth) {
  try {
    const pageWidth = doc.page.width;
    const centerX = pageWidth / 2;
    
    // Add logo in center
    const logoPath = path.join(__dirname, '../assets/logo_01.png');
    
    try {
      if (fs.existsSync(logoPath)) {
        // Calculate logo dimensions - keeping it proportional
        const logoWidth = 440; // Adjust this width as needed
        const logoX = centerX - (logoWidth / 2);
        
        doc.image(logoPath, logoX, 20, {
          width: logoWidth,
          align: 'center'
        });
      } else {
        console.warn('Logo file not found at:', logoPath);
      }
    } catch (err) {
      console.error('Error loading logo:', err);
    }
    
    // Add some spacing after logo
    doc.y = 60; // Adjust this value based on your logo height
    
    // Purchase Order Title with line separator - CENTERED
    doc.fontSize(14) // Slightly larger font size
      .fillColor('black')
      .font('Helvetica-Bold')
      .text('PURCHASE ORDER', { 
        width: pageWidth,
        align: 'center'
      });
    
    doc.y += 15; // Add some space after the title
  } catch (err) {
    console.error('Error in header:', err);
    throw err;
  }
}

/**
 * Adds client and supplier details in a compact format
 */
function addClientAndSupplierDetails(doc, invoiceData, margin, contentWidth) {
  try {
    const startY = doc.y;
    const halfWidth = contentWidth / 2 - 5;
    
    // "To" section at the top with supplier info - width now matches left field table
    const toSectionHeight = 45;
    drawSection(doc, margin, startY, halfWidth, toSectionHeight, 'To:');
    doc.font('Helvetica').fontSize(9);
    doc.text(invoiceData.supplierAddress || '', margin + 15, startY + 15);
    
    // Supplier and PO details below the "To" section
    const detailsY = startY + toSectionHeight + 8;
    
    // Left side: Supplier details
    const leftFields = [
      { label: 'Supplier Name:', value: invoiceData.supplier || '' },
      { label: 'Contact No:', value: invoiceData.contactNo || '' },
      { label: 'Email:', value: invoiceData.email || '' },
      { label: 'PR NO:', value: invoiceData.prNo || '' },
      { label: 'Supplier Offer Date:', value: formatDate(invoiceData.supplierOfferDate) || '' },
      { label: 'Payment Terms:', value: invoiceData.paymentTerms || '' },
      { label: 'GST No:', value: invoiceData.gstNo || '' },
      { label: 'Supplier GST:', value: invoiceData.supplierGST || '' },
    ];
    
    // Right side: PO details
    const rightFields = [
      { label: 'PO NO.:', value: invoiceData.poNo || '' },
      { label: 'Date:', value: formatDate(invoiceData.date) || '' },
      { label: 'REF No:', value: invoiceData.refNo || '' },
      { label: 'Validity:', value: invoiceData.validity || '' },
      { label: 'Supplier Offer No.:', value: invoiceData.supplierOfferNo || '' },
      { label: 'Delivery Period:', value: invoiceData.deliveryPeriod || '' },
      { label: 'Transportation:', value: invoiceData.transportation || '' },
      { label: 'Pan No:', value: invoiceData.panNo || '' }
    ];
    
    // Draw tables side by side
    const tableHeight = 130;
    drawDetailTable(doc, margin, detailsY, halfWidth, tableHeight, leftFields);
    drawDetailTable(doc, margin + halfWidth + 10, detailsY, halfWidth, tableHeight, rightFields);
    
    doc.y = detailsY + tableHeight + 8; // Update position for next section
  } catch (err) {
    console.error('Error in client and supplier details:', err);
    throw err;
  }
}

/**
 * Adds delivery information section
 */
function addDeliveryInfo(doc, invoiceData, margin, contentWidth) {
  try {
    const pageWidth = doc.page.width;
    const startY = doc.y;
    
    // Section title
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text('Invoice and Delivery Information', margin, startY);
    
    // Draw two address boxes side by side
    const boxWidth = contentWidth / 2 - 5;
    const boxHeight = 45; // Compact height
    
    // Invoice Address box
    doc.rect(margin, startY + 20, boxWidth, boxHeight).stroke();
    doc.fontSize(9)
      .font('Helvetica-Bold')
      .text('Invoice Address:', margin + 5, startY + 24);
    
    doc.font('Helvetica')
      .fontSize(8)
      .text(invoiceData.invoiceAddress || '', margin + 5, startY + 35, {
        width: boxWidth - 10
      });
    
    // Delivery Address box
    doc.rect(margin + boxWidth + 10, startY + 20, boxWidth, boxHeight).stroke();
    doc.fontSize(9)
      .font('Helvetica-Bold')
      .text('Delivery Address:', margin + boxWidth + 15, startY + 24);
    
    doc.font('Helvetica')
      .fontSize(8)
      .text(invoiceData.deliveryAddress || '', margin + boxWidth + 15, startY + 35, {
        width: boxWidth - 20
      });
    
    doc.y = startY + boxHeight + 25; // Position for next section with compact spacing
  } catch (err) {
    console.error('Error in delivery info:', err);
    throw err;
  }
}

/**
 * Adds items table with products, quantities, and prices
 */
/**
 * Adds items table with products, quantities, and prices
 */
function addItemsTable(doc, invoiceData, margin, contentWidth) {
  try {
    if (!invoiceData.items || !Array.isArray(invoiceData.items)) {
      invoiceData.items = [];
      console.warn('No items provided for invoice');
    }

    const isDelhiSupplier = invoiceData.supplierAddress && 
                          invoiceData.supplierAddress.toLowerCase().includes("delhi");
    
    const pageWidth = doc.page.width;
    const startY = doc.y;
    
    // Material and Pricing title
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text('Material and Pricing', margin, startY);
    
    // Table setup
    const tableTop = startY + 20;
    const rowHeight = 24; // Slightly reduced for compactness
    
    // Define columns with proportional widths - conditionally include GST columns
    const baseColumns = [
      { header: 'S.No', width: 0.05 },
      { header: 'Product Name', width: 0.2 },
      { header: 'Description', width: 0.3 },
      { header: 'Units', width: 0.05 },
      { header: 'Rate', width: 0.08 },
      { header: 'Quantity', width: 0.08 }
    ];
    
    // Add tax columns based on supplier location
    const taxColumns = isDelhiSupplier
      ? [
          { header: 'CGST (%)', width: 0.06 },
          { header: 'SGST (%)', width: 0.06 }
        ]
      : [
          { header: 'IGST (%)', width: 0.07 }
        ];
    
    const totalColumn = { header: 'Total', width: 0.1 };
    
    const columns = [...baseColumns, ...taxColumns, totalColumn];
    
    // Calculate actual column widths
    let currentX = margin;
    columns.forEach(col => {
      col.x = currentX;
      col.actualWidth = contentWidth * col.width;
      currentX += col.actualWidth;
    });
    
    // Draw table header
    doc.rect(margin, tableTop, contentWidth, rowHeight).stroke();
    columns.forEach(col => {
      doc.fontSize(8)
        .font('Helvetica-Bold')
        .text(col.header, col.x + 2, tableTop + 7, {
          width: col.actualWidth - 4,
          align: 'center'
        });
        
      // Draw vertical line for column
      if (col !== columns[0]) {
        doc.moveTo(col.x, tableTop)
          .lineTo(col.x, tableTop + rowHeight)
          .stroke();
      }
    });
    
    // Draw rows
    doc.font('Helvetica');
    
    const items = invoiceData.items;
    items.forEach((item, index) => {
      const rowY = tableTop + (index + 1) * rowHeight;
      
      // Draw row rectangle
      doc.rect(margin, rowY, contentWidth, rowHeight).stroke();
      
      // Prepare row data - conditionally include tax values
      const baseData = [
        index + 1,
        item.productname || '',
        item.description || '',
        item.units || '',
        item.rate?.toFixed(2) || '0.00',
        item.quantity || 0
      ];
      
      const taxData = isDelhiSupplier
        ? [
            item.cgst || 0,
            item.sgst || 0
          ]
        : [
            item.igst || 0
          ];
      
      const totalData = [
        item.total?.toFixed(2) || '0.00'
      ];
      
      const rowData = [...baseData, ...taxData, ...totalData];
      
      columns.forEach((col, colIndex) => {
        // Draw vertical line for column
        if (colIndex > 0) {
          doc.moveTo(col.x, rowY)
            .lineTo(col.x, rowY + rowHeight)
            .stroke();
        }
        
        // Different alignment based on column content
        let align = 'left';
        if ([0, 3, 4, 5, 6, 7, 8].includes(colIndex)) {
          align = 'center'; // Center align for numbers and short text
        }
        if (colIndex === 1 || colIndex === 2) {
          align = 'left'; // Left align for product name and description
        }
        
        doc.fontSize(7)
          .text(
            rowData[colIndex].toString(), 
            col.x + 3,
            rowY + 7,
            { width: col.actualWidth - 6, align }
          );
      });
    });
    
    doc.y = tableTop + ((items.length + 1) * rowHeight) + 5;
  } catch (err) {
    console.error('Error in items table:', err);
    throw err;
  }
}

/**
 * Adds totals section with amount in words
 */
function addTotalsSection(doc, invoiceData, margin, contentWidth) {
  try {
    const startY = doc.y;
    
    // Draw total amount box
    doc.rect(margin, startY, contentWidth, 20).stroke();
    
    // Add total amount
    doc.fontSize(9)
      .font('Helvetica-Bold')
      .text('Total Amount:', margin + 5, startY + 6);
    
    const totalAmount = invoiceData.totalAmount || '0.00';
    // Check if the amount already includes the rupee symbol
    const formattedTotal = totalAmount.toString() ? totalAmount : `₹${totalAmount}`;
    
    doc.fontSize(9)
      .font('Helvetica')
      .text(formattedTotal, margin + 70, startY + 6);
    
    // Draw amount in words box
    doc.rect(margin, startY + 20, contentWidth, 20).stroke();
    
    // Add amount in words WITH GAP BEFORE DATA
    doc.fontSize(9)
      .font('Helvetica-Bold')
      .text('Amount in Words:', margin + 5, startY + 26);
    
    doc.font('Helvetica')
      .fontSize(9)
      .text(invoiceData.amountInWords ? `  ${invoiceData.amountInWords}` : '', margin + 80, startY + 26);
    
    doc.y = startY + 45;
  } catch (err) {
    console.error('Error in totals section:', err);
    throw err;
  }
}

/**
 * Adds terms and signatures section with improved signature image handling
 */
/**
 * Adds terms and signatures section with improved signature image handling
 */
/**
 * Adds terms and signatures section with improved signature image handling
 */
/**
 * Adds terms and signatures section with improved signature image handling
 */
function addTermsAndSignatures(doc, invoiceData, margin, contentWidth) {
  try {
    const startY = doc.y;
    const pageWidth = doc.page.width;
    
    // Terms and conditions title
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text('Terms and Condition', margin, startY);
    
    // Terms and conditions content
    doc.font('Helvetica').fontSize(8);
    const terms = [
      { text: 'Mandatory Documents : Please provide valid documentation with the delivery.', highlight: true },
      { text: 'Commercial original invoice is required for payment processing.', highlight: true },
      { text: 'Guarantee / Warranty certificate is required for delivered products.', highlight: true },
      { text: 'If there is any defect in the Material, Replacement will be done Immediately, Otherwise Payment will be made after debiting the amount of defective Part.', highlight: true },
      { text: 'Courier charges of defective part will be bare by supplier', highlight: true }
    ];
    
    // Calculate width for terms content
    const termsContentWidth = contentWidth - 20; // Subtract some padding
    
    let termsY = startY + 18;
    terms.forEach((term, i) => {
      // Term number
      doc.text(`${i + 1}`, margin, termsY);
      
      // Term text - with blue highlight if needed
      if (term.highlight) {
        doc.fillColor('#0000FF');
      } else {
        doc.fillColor('black');
      }
      
      // Add term text with improved wrapping for longer terms
      const termText = term.text;
      const termTextWidth = termsContentWidth - 12;
      
      // Special handling for term #4 which is longer
      if (i === 3) {
        // Use text with height calculation for proper wrapping
        const textHeight = doc.heightOfString(termText, {
          width: termTextWidth,
          align: 'left'
        });
        
        doc.text(termText, margin + 12, termsY, { 
          width: termTextWidth,
          align: 'left'
        });
        
        // Adjust Y position based on actual text height
        termsY += Math.max(textHeight, 12);
      } else {
        // Normal terms
        doc.text(termText, margin + 12, termsY, { 
          width: termTextWidth,
          align: 'left'
        });
        termsY += 12;
      }
    });
    
    doc.fillColor('black');
    
    // Add signature sections
    const signaturesY = termsY + 40;
    const signatureSectionHeight = 80;
    const signatureWidth = contentWidth / 3;
    
    // Add signature labels and images
    const signatures = [
      { label: 'Prepared by', image: invoiceData.preparedBySignature },
      { label: 'Verified by', image: invoiceData.verifiedBySignature },
      { label: 'Authorized by', image: invoiceData.authorizedSignature }
    ];
    
    signatures.forEach((sig, i) => {
      const x = margin + (i * signatureWidth);
      const centerX = x + (signatureWidth / 2);
      
      // Add label centered above the signature area
      doc.fontSize(9)
        .font('Helvetica-Bold')
        .text(sig.label, x, signaturesY + 10, {
          width: signatureWidth,
          align: 'center'
        });
      
      // Add signature image if available
      const imageY = signaturesY + 30;
      const imageWidth = 150;
      const imageHeight = 70;
      
      if (sig.image && typeof sig.image === 'string') {
        try {
          const signaturePath = path.join(__dirname, '../public', sig.image);
          if (fs.existsSync(signaturePath)) {
            // Center the image horizontally
            doc.image(signaturePath, centerX - (imageWidth/2), imageY, { 
              width: imageWidth, 
              height: imageHeight 
            });
          }
        } catch (err) {
          console.error('Error loading signature image:', err);
        }
      }
    });
    
    // Update the document's Y position after this section
    doc.y = signaturesY + signatureSectionHeight + 20;
  } catch (err) {
    console.error('Error in terms/signatures section:', err);
    throw err;
  }
}


// ==================== UTILITY FUNCTIONS ====================

/**
 * Draw a section with border and title
 */
function drawSection(doc, x, y, width, height, title) {
  doc.rect(x, y, width, height).stroke();
  if (title) {
    doc.fontSize(9).font('Helvetica-Bold').text(title, x + 5, y + 5);
  }
}

/**
 * Draws a detail table with key-value pairs
 */
function drawDetailTable(doc, x, y, width, height, fields) {
  // Draw outer rectangle
  doc.rect(x, y, width, height).stroke();
  
  const rowHeight = height / fields.length;
  
  // Draw rows and add content
  fields.forEach((field, index) => {
    const rowY = y + (index * rowHeight);
    
    // Draw horizontal line for rows after the first
    if (index > 0) {
      doc.moveTo(x, rowY)
        .lineTo(x + width, rowY)
        .stroke();
    }
    
    // Calculate column width - 40% for label, 60% for value
    const labelWidth = width * 0.4;
    
    // Draw vertical line between label and value
    doc.moveTo(x + labelWidth, rowY)
      .lineTo(x + labelWidth, rowY + rowHeight)
      .stroke();
    
    // Add label
    doc.fontSize(8)
      .font('Helvetica-Bold')
      .text(field.label, x + 3, rowY + 5, {
        width: labelWidth - 6
      });
    
    // Add value
    doc.fontSize(8)
      .font('Helvetica')
      .text(field.value, x + labelWidth + 3, rowY + 5, {
        width: width - labelWidth - 6
      });
  });
}

/**
 * Formats a date string consistently to DD/MM/YYYY format
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    // Check if it's already in DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

module.exports = { generateInvoicePDF };