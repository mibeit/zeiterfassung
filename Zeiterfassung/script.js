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

app.use(session({
    secret: 'hallowiegehtsdir',
    resave: false,
    saveUninitialized: true
}));

// About page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/login.html'));
});




// Get all time records
app.get('/timeRecords', (req, res) => {
    if (!req.session.user) {
        // Error wenn this code is not avalaible !! Noch ändern
        res.redirect('front/html/login.html');
        return;
    }


    // Filtern user specific time records
    const userTimeRecords = timeRecords.filter(record => record.user === req.session.user.username);

    res.json(userTimeRecords);
});




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

    updatedTimeRecord.user = req.session.user.username;

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

app.get('/timeRecords/month/:month', (req, res) => {
    if (!req.session.user) {
        res.redirect('front/html/login.html');
        return;
    }

    let month = Number(req.params.month);

    let filteredData = timeRecords.filter(record => {
        let recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0); 
        return record.user === req.session.user.username && 
               (recordDate.getMonth() + 1 === month);
    });

    res.json(filteredData);
});

app.get('/timeRecords/date/:date', (req, res) => {
    if (!req.session.user) {
        res.redirect('front/html/login.html');
        return;
    }

    let today = new Date(req.params.date);
    let sevenDaysAgo = new Date(req.params.date);
    sevenDaysAgo.setDate(today.getDate() - 7);

    let filteredData1 = timeRecords.filter(record => {
        let dateParts = record.date.split('-').map(part => parseInt(part, 10));
        let recordDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        let isWithinWeek = recordDate >= sevenDaysAgo && recordDate <= today;
        let isUserRecord = record.user === req.session.user.username;  
        return isWithinWeek && isUserRecord;  
    });

    res.json(filteredData1);
});

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
//Send me User data
app.get('/loggedInUser', function(req, res) {
    res.send(req.session.user);
});

app.get('/salaryRate/:user', (req, res) => {
    let user = req.params.user;
    
    const workbook = xlsx.readFile('data/user_data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    for (let row of data) {
        if (row.username === user) {
            res.send(row.gehalt.toString()); 
            return;
        }
    }
        res.status(404).send('User not found');
    });

app.get('/adress/:user', (req, res) => {
    let user = req.params.user;
    
    const workbook = xlsx.readFile('data/user_data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    for (let row of data) {
        if (row.username === user) {
            res.send(row.adresse.toString()); 
            return;
        }
        
    }
    
        res.status(404).send('User not found');
    });
app.get('/telnr/:user', (req, res) => {
    let user = req.params.user;
    
    const workbook = xlsx.readFile('data/user_data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    for (let row of data) {
        if (row.username === user) {
            res.send(row.telefonNummer.toString()); 
            return;
        }
        
    }
    
        res.status(404).send('User not found');
    });


app.get('/front/html/overview.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/overview.html'));
});
app.get('/front/html/zeiterfassung.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/zeiterfassung.html'));
});
app.get('/front/html/gehalt.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/html/gehalt.html'));
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