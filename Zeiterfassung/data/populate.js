const fs = require('fs');
function generateDataEntries(startUser, startTime, endTime) {
    let data = [];
    let currentDate = new Date(); // Startdatum ist das heutige Datum
    let endDate = new Date(2024, 0, 3); // Enddatum ist der 03.01.2024

    while (currentDate >= endDate) {
        // Überprüfen, ob das aktuelle Datum ein Wochenende ist
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            let entry = {
                "start": startTime,
                "end": endTime,
                "date": `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`,
                "id": Date.now() - currentDate.getTime(), // Erzeugen Sie eine eindeutige ID
                "user": startUser
            };

            data.push(entry);
        }

        // Dekrementieren Sie das Datum um einen Tag
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return data;
}

let newData = generateDataEntries("Micha", "6:00", "16:30");

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