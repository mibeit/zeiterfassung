const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3030;
const DATA_FILE = path.join(__dirname, 'data', 'timeRecords.json');
const xlsx = require('xlsx');  
const session = require('express-session'); 
// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Load time records data
let timeRecords = [];

if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    timeRecords = JSON.parse(data);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the index.html file
app.use(express.static(path.join(__dirname, 'front')));

// About page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/login.html'));
});

// Get all time records
app.get('/timeRecords', (req, res) => {
    res.json(timeRecords);
});

app.use(session({
    secret: 'hallowiegehtsdir',
    resave: false,
    saveUninitialized: true
}));


// Add new time record
app.post('/timeRecords', (req, res) => {
  const newTimeRecord = req.body;
  newTimeRecord.id = Date.now(); // Assign a unique ID
  newTimeRecord.user = req.session.user.username; 
  timeRecords.push(newTimeRecord);
  saveDataToFile(timeRecords);
  console.log("Time record added for: "+newTimeRecord.start)
  res.status(201).json(newTimeRecord); // Return the new time record
});
// Delete time record
app.delete('/timeRecords/:id', (req, res) => {
    const id = req.params.id;
    const index = timeRecords.findIndex(record => record.id == id);
    if (index !== -1) {
        timeRecords.splice(index, 1);
        // Save the updated timeRecords array to the JSON file
        saveDataToFile(timeRecords);
        console.log('Time record deleted');
        res.status(200).send();
    } else {
        res.status(404).send();
    }
});


// Function to save data to file
function saveDataToFile(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Update time record
app.put('/timeRecords/:id', (req, res) => {
    const id = req.params.id;
    const updatedTimeRecord = req.body;

    const index = timeRecords.findIndex(record => record.id == id);
    if (index !== -1) {
        // Update the time record
        timeRecords[index] = updatedTimeRecord;
        // Save the updated timeRecords array to the JSON file
        saveDataToFile(timeRecords);
        console.log('Time record updated');
        res.status(200).json(updatedTimeRecord);
    } else {
        res.status(404).send();
    }
});


// login 

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const workbook = xlsx.readFile('data/user_data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let validCredentials = false;

    for (let row of data) {
        if (row.username === username && Number(row.password) === Number(password)) {
            validCredentials = true;
            req.session.user = row;
            break;
        }
    }

    if (validCredentials) {
        // Redirect to the overview page
        res.redirect('/front/html/overview.html');
    } else {
        // Redirect to the error page
        res.redirect('/front/html/login-error.html');
    }

 
    
});
app.get('/front/html/overview.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/overview.html'));
});
app.get('/front/html/zeiterfassung.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/zeiterfassung.html'));
});
app.get('/front/html/urlaub.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/urlaub.html'));
});
app.get('/front/html/dienstplan.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/dienstplan.html'));
});
app.get('/front/html/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/login.html'));
});
app.get('/front/html/login-error.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/login-error.html'));
});

