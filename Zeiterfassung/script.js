const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3030;
const DATA_FILE = path.join(__dirname, 'data', 'timeRecords.json');

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
    res.sendFile(path.join(__dirname, 'front/login.html'));
});

// Get all time records
app.get('/timeRecords', (req, res) => {
    res.json(timeRecords);
});

// Add new time record
app.post('/timeRecords', (req, res) => {
  const newTimeRecord = req.body;
  newTimeRecord.id = Date.now(); // Assign a unique ID
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

