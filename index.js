document.addEventListener('DOMContentLoaded', function() {
    const stationSelect = document.getElementById('station-select');
    const timetableDiv = document.getElementById('timetable');

    // Haetaan asemat ja täytetään pudotusvalikko
    function loadStations() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://rata.digitraffic.fi/api/v1/metadata/stations', true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                // JSON-muotoon parsiminen
                let stations = JSON.parse(xhr.responseText);
                
                // Käydään läpi asemaobjektit ja lisätään valittavat vaihtoehdot
                stations.forEach(function(station) {
                    if (station.passengerTraffic) {
                        let option = document.createElement('option');
                        option.value = station.stationShortCode;
                        option.textContent = station.stationName;
                        stationSelect.appendChild(option);
                    }
                });
            }
        };
        xhr.send();
    }

    // Funktio junien aikataulujen hakemiseksi valitulta asemalta
    function loadTimetable(stationCode) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `https://rata.digitraffic.fi/api/v1/live-trains/station/${stationCode}`, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                let trains = JSON.parse(xhr.responseText);
                displayTimetable(trains); // Kutsutaan funktiota aikataulun näyttämiseksi
            }
        };
        xhr.send();
    }

    // Funktio aikataulujen näyttämiseksi DOM:ssa
    function displayTimetable(trains) {
        timetableDiv.innerHTML = '';  // Tyhjennetään aiemmat tulokset

        // Jos junia ei löydy, näytetään viesti
        if (trains.length === 0) {
            timetableDiv.innerHTML = '<p>No trains found for the selected station.</p>';
            return;
        }

        // Käydään läpi kaikki junat ja näytetään aikataulutiedot
        trains.forEach(function(train) {
            let departureTime = new Date(train.timeTableRows[0].scheduledTime).toLocaleTimeString('fi-FI');
            let destination = train.timeTableRows[train.timeTableRows.length - 1].stationShortCode;

            // Luodaan jokaiselle junalle oma div, johon lisätään tiedot
            let trainDiv = document.createElement('div');
            trainDiv.className = 'train';
            trainDiv.innerHTML = `
                <h3>Train ${train.trainType} ${train.trainNumber}</h3>
                <p>Departure: ${departureTime}</p>
                <p>Destination: ${destination}</p>
            `;
            timetableDiv.appendChild(trainDiv);
        });
    }

    // Tapahtumakuuntelija hakupainikkeelle
    document.getElementById('search-button').addEventListener('click', function() {
        let stationCode = stationSelect.value;
        
        // Tarkistetaan, että valittuna on asema
        if (stationCode) {
            loadTimetable(stationCode); // Haetaan aikataulut
        } else {
            alert('Please select a train station.'); // Virheviesti, jos asemaa ei ole valittu
        }
    });

    // Ladataan asemat heti sivun latauksen yhteydessä
    loadStations();
});
