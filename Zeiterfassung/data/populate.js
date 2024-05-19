const fs = require('fs');

let idCounter = 0;

function generateDataEntries(startUser, startTime, endTime) {
    let data = [];
    let currentDate = new Date(); 
    let endDate = new Date(2024, 3, 3); 

    while (currentDate >= endDate) {
        
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            let entry = {
                "start": startTime,
                "end": endTime,
                "date": `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`,
                "id": idCounter++, 
                "user": startUser
            };

            data.push(entry);
        }

        currentDate.setDate(currentDate.getDate() - 1);
    }

    return data;
}


let users = [
    { name: "Deborah", start: "6:00", end: "14:30" },
    { name: "Luisa", start: "7:00", end: "15:30" },
    { name: "Clara", start: "8:00", end: "16:30" },
    { name: "Prisca", start: "14:00", end: "22:30" },
    { name: "Aitana", start: "18:00", end: "23:30" },
    { name: "Vivien", start: "2:00", end: "7:30" },
    { name: "Elena", start: "10:00", end: "15:30" }
   
];

fs.readFile('timeRecords.json', 'utf8', (err, data) => {
    if (err) throw err;

    let existingData = JSON.parse(data);

    users.forEach(user => {
        let newData = generateDataEntries(user.name, user.start, user.end);
        existingData = existingData.concat(newData);
    });

    existingData.reverse();

    fs.writeFile('timeRecords.json', JSON.stringify(existingData, null, 2), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
});