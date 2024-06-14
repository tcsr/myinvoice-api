const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const supplierDetails = './data/supplierDetails.json';
const cardsDetails = './data/cardsDetails.json';
const paymentModes = './data/paymentModes.json';
const invoiceTypes = './data/invoiceType.json';
const invoiceListPaginated = './data/invoiceListPaginated.json';
const invoiceData = './data/invoiceData.json';
const classificationCodes = './data/classificationCodes.json';
const msicCodes = './data/MSICSubCategoryCodes.json';
const countryCodes = './data/countryCodes.json';
const currencyCodes = './data/currencyCodes.json';
const paymentMethods = './data/paymentMethods.json';
const stateCodes = './data/stateCodes.json';
const taxTypes = './data/taxTypes.json';
const unitTypes = './data/unitTypes.json';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/einvoice/getSupplierDetails', (req, res) => {
    fs.readFile(supplierDetails, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading supplier details' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/classificationCodes', (req, res) => {
    fs.readFile(classificationCodes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading Classification Codes' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/countryCode', (req, res) => {
    fs.readFile(countryCodes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading Country Codes' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/currencyCode', (req, res) => {
    fs.readFile(currencyCodes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading Currency Codes' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/stateCode', (req, res) => {
    fs.readFile(stateCodes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading State Codes' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/msicCode', (req, res) => {
    fs.readFile(msicCodes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading Msic Codes' });
        }
        res.status(200).send(data);
    });
});


app.get('/master/paymentMethods', (req, res) => {
    fs.readFile(paymentMethods, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading Payent Methods' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/taxTypes', (req, res) => {
    fs.readFile(taxTypes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading Tax Types' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/unitTypes', (req, res) => {
    fs.readFile(unitTypes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading Unit Types' });
        }
        res.status(200).send(data);
    });
});


app.get('/einvoice/getCardsDetails', (req, res) => {
    fs.readFile(cardsDetails, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading cards details' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/paymentMode', (req, res) => {
    fs.readFile(paymentModes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading payment modes' });
        }
        res.status(200).send(data);
    });
});

app.get('/master/invoiceType', (req, res) => {
    fs.readFile(invoiceTypes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading invoice types' });
        }
        res.status(200).send(data);
    });
});

app.get('/einvoice/invoiceListPaginated', (req, res) => {
    const { pageNumber = 0, pageSize = 10, searchTerm = '', filter = '' } = req.query;

    fs.readFile(invoiceListPaginated, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }

        const jsonData = JSON.parse(data);
        let content = jsonData.content;

        // Apply search filter
        if (searchTerm) {
            content = content.filter(invoice =>
                Object.values(invoice).some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Apply custom filter (example: filter by irbmResponse)
        if (filter) {
            content = content.filter(invoice =>
                invoice.irbmResponse.toLowerCase() === filter.toLowerCase()
            );
        }

        const totalElements = content.length;

        // Apply pagination
        const startIndex = pageNumber * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedContent = content.slice(startIndex, endIndex);

        const response = {
            content: paginatedContent,
            pageable: {
                pageNumber: parseInt(pageNumber),
                pageSize: parseInt(pageSize),
                sort: {
                    empty: false,
                    sorted: true,
                    unsorted: false
                },
                offset: startIndex,
                paged: true,
                unpaged: false
            },
            last: endIndex >= totalElements,
            totalElements: totalElements,
            totalPages: Math.ceil(totalElements / pageSize),
            size: parseInt(pageSize),
            number: parseInt(pageNumber),
            sort: {
                empty: false,
                sorted: true,
                unsorted: false
            },
            first: parseInt(pageNumber) === 0,
            numberOfElements: paginatedContent.length,
            empty: paginatedContent.length === 0
        };

        res.status(200).json(response);
    });
});

app.post('/einvoice/generateInvoices', (req, res) => {
    const invoices = req.body;

    fs.readFile(invoiceData, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading invoice data:', err.message);
            return res.status(500).json({ status: 'failed', message: 'Error reading invoice data' });
        }

        let existingInvoices;
        try {
            existingInvoices = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing invoice data:', parseErr.message);
            return res.status(500).json({ status: 'failed', message: 'Error parsing invoice data' });
        }

        const newInvoices = existingInvoices.concat(invoices);

        fs.writeFile(invoiceData, JSON.stringify(newInvoices, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing invoice data:', err.message);
                return res.status(500).json({ status: 'failed', message: 'Error writing invoice data' });
            }

            // res.status(400).json({ status: 'error', message: 'Invoices generated successfully' });
            res.status(200).json({ status: 'success', message: 'Invoices generated successfully' });
        });
    });
});

app.delete('/einvoice/deleteInvoices', (req, res) => {
    const { ids } = req.body; // Expecting an array of invoice IDs

    fs.readFile(invoiceData, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading invoice data:', err.message);
            return res.status(500).json({ status: 'failed', message: 'Error reading invoice data' });
        }

        let existingInvoices;
        try {
            existingInvoices = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing invoice data:', parseErr.message);
            return res.status(500).json({ status: 'failed', message: 'Error parsing invoice data' });
        }

        const filteredInvoices = existingInvoices.filter(invoice => !ids.includes(invoice.id));

        fs.writeFile(invoiceData, JSON.stringify(filteredInvoices, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing invoice data:', err.message);
                return res.status(500).json({ status: 'failed', message: 'Error writing invoice data' });
            }

            // res.status(400).json({ status: 'error', message: 'Invoices deleted successfully' });
            res.status(200).json({ status: 'success', message: 'Invoices deleted successfully' });
        });
    });
});

// read all the missed json from data folder in the root and generate respective get apis




app.listen(3000, () => {
    console.log('server started');
});
