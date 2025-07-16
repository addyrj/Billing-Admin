const db = require("../config/db");

const Company = {
    create: async (companyData, serialNumber) => {
        console.log('Model: Preparing database query');
        const query = `
            INSERT INTO partnerdata (
                companyName, firmType, registeredOfficeAddress, gstNo,
                billingAddress, shippingAddress, sameAsBilling, natureOfBusiness,
                contactNumbers, products, partnerId, partnerName, serialNumber, email, grandTotalPrice
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            companyData.companyName,
            companyData.firmType,
            JSON.stringify(companyData.registeredOfficeAddress),
            companyData.gstNo || null,
            JSON.stringify(companyData.billingAddress),
            JSON.stringify(companyData.shippingAddress),
            companyData.sameAsBilling ? 1 : 0,
            companyData.natureOfBusiness,
            JSON.stringify(companyData.contactNumbers),
            JSON.stringify(companyData.products),
            companyData.partnerId,
            companyData.partnerName,
            serialNumber,
            companyData.email || null,
            companyData.grandTotalPrice
        ];

        try {
            console.log('Model: Executing query with values:', {
                sql: query,
                values: values,
                timeout: 5000 
            });
            const [result] = await db.query(query, values);
            console.log('Model: Insert successful:', result);
            return result;
        } catch (err) {
            console.error('Model: Database error:', {
                code: err.code,
                errno: err.errno,
                sqlState: err.sqlState,
                sqlMessage: err.sqlMessage,
                sql: err.sql
            });
            throw err;
        }
    },

    getAll: async () => {
        try {
            const query = "SELECT * FROM partnerdata";
            const [results] = await db.query(query);
            return Company.parseCompanyResults(results);
        } catch (err) {
            console.error("Error fetching all company data:", err);
            throw err;
        }
    },

    getAllByPartner: async (partnerId) => {
        try {
            const query = "SELECT * FROM partnerdata WHERE partnerId = ?";
            const [results] = await db.query(query, [partnerId]);
            return Company.parseCompanyResults(results);
        } catch (err) {
            console.error("Error fetching companies by partner:", err);
            throw err;
        }
    },

    getAllByRole: async (roleName) => {
        try {
            const query = `
                SELECT pd.* FROM partnerdata pd
                JOIN users u ON pd.partnerId = u.id
                JOIN roles r ON u.role_id = r.id
                WHERE r.name = ?
            `;
            const [results] = await db.query(query, [roleName]);
            return Company.parseCompanyResults(results);
        } catch (err) {
            console.error("Error fetching companies by role:", err);
            throw err;
        }
    },

    getById: async (id) => {
        try {
            const query = "SELECT * FROM partnerdata WHERE id = ?";
            const [results] = await db.query(query, [id]);
            if (results.length === 0) {
                return null;
            }
            return Company.parseCompanyResults(results)[0];
        } catch (err) {
            console.error(`Error getting company data by ID ${id}:`, err);
            throw err;
        }
    },

    update: async (id, companyData) => {
        try {
            // Get existing company data
            const [existing] = await db.query("SELECT * FROM partnerdata WHERE id = ?", [id]);
            if (!existing) throw new Error('Company not found');
    
            // Merge existing data with updates
            const mergedData = { ...existing[0], ...companyData };
    
            // Prepare dynamic update query
            const fieldsToUpdate = [];
            const values = [];
    
            Object.entries(companyData).forEach(([key, value]) => {
                if (value !== undefined) {
                    fieldsToUpdate.push(`${key} = ?`);
                    
                    // Special handling for JSON fields
                    if (['registeredOfficeAddress', 'billingAddress', 'shippingAddress', 'ContactNumbers', 'products'].includes(key)) {
                        values.push(JSON.stringify(value));
                    } else {
                        values.push(value);
                    }
                }
            });
    
            if (fieldsToUpdate.length === 0) {
                throw new Error('No fields to update');
            }
    
            values.push(id); // Add ID for WHERE clause
    
            const query = `
                UPDATE partnerdata 
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = ?
            `;
    
            const [result] = await db.query(query, values);
            return result;
        } catch (err) {
            console.error('Database error:', {
                error: err.message,
                sql: err.sql,
                stack: err.stack
            });
            throw err;
        }
    },

    delete: async (id) => {
        try {
            const query = "DELETE FROM partnerdata WHERE id = ?";
            const [result] = await db.query(query, [id]);
            return result;
        } catch (err) {
            console.error(`Error deleting company data with ID ${id}:`, err);
            throw err;
        }
    },

parseCompanyResults: (results) => {
    return results.map(async (company) => {
        const safeParse = (field) => {
            if (!field || typeof field !== 'string') return field;
            try {
                return JSON.parse(field);
            } catch (e) {
                console.error(`Failed to parse field: ${field}`);
                return field;
            }
        };

        // Get payment details and images
        const paymentDetails = await Company.getPaymentDetails(company.id);
        const paymentImages = await Company.getPaymentImages(company.id);

        return {
            ...company,
            registeredOfficeAddress: safeParse(company.registeredOfficeAddress),
            billingAddress: safeParse(company.billingAddress),
            shippingAddress: safeParse(company.shippingAddress),
            ContactNumbers: safeParse(company.ContactNumbers),
            products: safeParse(company.products),
            paymentMethod: paymentDetails?.payment_method || 'cod',
            paymentReference: paymentDetails?.payment_reference || '',
            paymentStatus: paymentDetails?.payment_status || 'pending',
            paymentImages: paymentImages || []
        };
    });
},
    // Add these methods to your Company model
addPaymentImages: async (companyId, files) => {
    const query = "INSERT INTO payment_images (company_id, image_path) VALUES ?";
    const values = files.map(file => [companyId, `/payment-images/${file.filename}`]);
    await db.query(query, [values]);
},

updatePaymentDetails: async (id, paymentData) => {
    const query = `
        UPDATE partnerdata 
        SET payment_method = ?, payment_reference = ?, payment_status = ?
        WHERE id = ?
    `;
    await db.query(query, [
        paymentData.paymentMethod,
        paymentData.paymentReference,
        paymentData.paymentStatus || 'pending',
        id
    ]);
},
getPaymentDetails: async (id) => {
    const [result] = await db.query(`
        SELECT payment_method, payment_reference, payment_status 
        FROM partnerdata WHERE id = ?
    `, [id]);
    return result[0];
},

getPaymentImages: async (id) => {
    const [results] = await db.query(`
        SELECT image_path FROM payment_images WHERE company_id = ?
    `, [id]);
    return results.map(row => row.image_path);
}
};

module.exports = Company;