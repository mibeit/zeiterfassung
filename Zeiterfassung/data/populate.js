const fs = require('fs');
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
                "id": Date.now() - currentDate.getTime(), 
                "user": startUser
            };

            data.push(entry);
        }

       
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return data;
}
// hier dann ändern wer und wie lange 
let newData = generateDataEntries("Clara", "6:00", "14:30");


fs.readFile('timeRecords.json', 'utf8', (err, data) => {
    if (err) throw err;

    let existingData = JSON.parse(data);

    
    let combinedData = existingData.concat(newData);

    combinedData.reverse();

    
    fs.writeFile('timeRecords.json', JSON.stringify(combinedData, null, 2), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
});