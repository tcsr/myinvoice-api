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
const invoiceData = './data/invoiceData.json'; // Added for generating/deleting invoices

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

app.get('/einvoice/getCardsDetails', (req, res) => {
    fs.readFile(cardsDetails, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading cards details' });
        }
        res.status(200).send(data);
    });
});

app.get('/dropdown/paymentMode', (req, res) => {
    fs.readFile(paymentModes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading payment modes' });
        }
        res.status(200).send(data);
    });
});

app.get('/dropdown/invoiceType', (req, res) => {
    fs.readFile(invoiceTypes, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error reading invoice types' });
        }
        res.status(200).send(data);
    });
});

app.get('/einvoice/invoiceListPaginated', (req, res) => {
    const { page = 0, size = 10, search = '', filter = '' } = req.query;

    fs.readFile(invoiceListPaginated, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }

        const jsonData = JSON.parse(data);
        let content = jsonData.content;

        // Apply search filter
        if (search) {
            content = content.filter(invoice =>
                Object.values(invoice).some(value =>
                    value.toString().toLowerCase().includes(search.toLowerCase())
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
        const startIndex = page * size;
        const endIndex = startIndex + parseInt(size);
        const paginatedContent = content.slice(startIndex, endIndex);

        const response = {
            content: paginatedContent,
            pageable: {
                pageNumber: parseInt(page),
                pageSize: parseInt(size),
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
            totalPages: Math.ceil(totalElements / size),
            size: parseInt(size),
            number: parseInt(page),
            sort: {
                empty: false,
                sorted: true,
                unsorted: false
            },
            first: parseInt(page) === 0,
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
            console.error(err);
            return res.status(500).json({ message: 'Error reading invoice data' });
        }

        const existingInvoices = JSON.parse(data);
        const newInvoices = existingInvoices.concat(invoices);

        fs.writeFile(invoiceData, JSON.stringify(newInvoices, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error writing invoice data' });
            }

            res.status(200).json({ message: 'Invoices generated successfully' });
        });
    });
});

app.delete('/einvoice/deleteInvoices', (req, res) => {
    const { ids } = req.body; // Expecting an array of invoice IDs

    fs.readFile(invoiceData, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error reading invoice data' });
        }

        let existingInvoices = JSON.parse(data);
        existingInvoices = existingInvoices.filter(invoice => !ids.includes(invoice.id));

        fs.writeFile(invoiceData, JSON.stringify(existingInvoices, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error writing invoice data' });
            }

            res.status(200).json({ message: 'Invoices deleted successfully' });
        });
    });
});

app.listen(3000, () => {
    console.log('server started');
});
