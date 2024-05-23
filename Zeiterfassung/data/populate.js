const fs = require('fs');

function generateDataEntries(numEntries, startUser, startTime, endTime) {
    let data = [];
    let currentDate = new Date(); // Startdatum ist das heutige Datum

    for (let i = 0; i < numEntries; i++) {
        let entry = {
            "start": startTime,
            "end": endTime,
            "date": `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`,
            "id": Date.now() - i, // Erzeugen Sie eine eindeutige ID
            "user": startUser
        };

        data.push(entry);

        // Dekrementieren Sie das Datum um einen Tag
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return data;
}

let newData = generateDataEntries(60, "Marlies", "7:00", "16:30");

// Lesen Sie die vorhandenen Daten aus der JSON-Datei
fs.readFile('timeRecords.json', 'utf8', (err, data) => {
    if (err) throw err;

    let existingData = JSON.parse(data);

    // Fügen Sie die neuen Daten zu den vorhandenen Daten hinzu
    let combinedData = existingData.concat(newData);

    // Schreiben Sie die kombinierten Daten zurück in die JSON-Datei
    fs.writeFile('timeRecords.json', JSON.stringify(combinedData, null, 2), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
});