console.log("Script loaded"); // Debugging to ensure the script is loaded

document.getElementById("sync-btn").addEventListener("click", function() {
    console.log("Sync button clicked"); // Debugging to see if the event is fired
    fetchSync();
});

document.getElementById("async-callback-btn").addEventListener("click", function() {
    console.log("Async Callback button clicked"); // Debugging to see if the event is fired
    fetchAsyncWithCallback();
});

document.getElementById("fetch-promise-btn").addEventListener("click", function() {
    console.log("Fetch Promise button clicked"); // Debugging to see if the event is fired
    fetchWithPromises();
});

const displayData = (data, append = false) => {
    const tableBody = document.querySelector("#data-table tbody");
    if (!append) {
        tableBody.innerHTML = "";
    }
    data.forEach(entry => {
        const nameParts = entry.name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");
        const id = entry.id;

        const row = document.createElement("tr");
        row.innerHTML = `<td>${firstName}</td><td>${lastName}</td><td>${id}</td>`;
        tableBody.appendChild(row);
    });
    console.log("Data displayed", data); // Debugging to see if the data is processed
};

// Approach 1: Synchronous XMLHttpRequest
const fetchSync = () => {
    console.log("Starting sync fetch"); // Debugging to see where we are in execution
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/reference.json', false);
        xhr.send();

        if (xhr.status === 200) {
            const refData = JSON.parse(xhr.responseText);
            const data1Location = refData.data_location;

            xhr.open('GET', `data/${data1Location}`, false);
            xhr.send();
            const data1 = JSON.parse(xhr.responseText).data;

            const data2Location = JSON.parse(xhr.responseText).data_location;

            xhr.open('GET', `data/${data2Location}`, false);
            xhr.send();
            const data2 = JSON.parse(xhr.responseText).data;

            xhr.open('GET', 'data/data3.json', false);
            xhr.send();
            const data3 = JSON.parse(xhr.responseText).data;

            const allData = [...data1, ...data2, ...data3];
            displayData(allData);
        }
    } catch (error) {
        console.error("Error fetching data synchronously: ", error);
    }
};

// Approach 2: Asynchronous XMLHttpRequest with Callbacks
const fetchAsyncWithCallback = () => {
    console.log("Starting async callback fetch"); // Debugging
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/reference.json');
    xhr.onload = () => {
        if (xhr.status === 200) {
            const refData = JSON.parse(xhr.responseText);
            const data1Location = refData.data_location;

            const xhr1 = new XMLHttpRequest();
            xhr1.open('GET', `data/${data1Location}`);
            xhr1.onload = () => {
                const data1 = JSON.parse(xhr1.responseText).data;
                const data2Location = JSON.parse(xhr1.responseText).data_location;

                const xhr2 = new XMLHttpRequest();
                xhr2.open('GET', `data/${data2Location}`);
                xhr2.onload = () => {
                    const data2 = JSON.parse(xhr2.responseText).data;

                    const xhr3 = new XMLHttpRequest();
                    xhr3.open('GET', 'data/data3.json');
                    xhr3.onload = () => {
                        const data3 = JSON.parse(xhr3.responseText).data;
                        const allData = [...data1, ...data2, ...data3];
                        displayData(allData);
                    };
                    xhr3.send();
                };
                xhr2.send();
            };
            xhr1.send();
        }
    };
    xhr.send();
};

// Approach 3: Fetch with Promises
const fetchWithPromises = () => {
    console.log("Starting fetch with promises"); // Debugging
    fetch('data/reference.json')
        .then(response => response.json())
        .then(refData => {
            const data1Location = refData.data_location;
            return fetch(`data/${data1Location}`);
        })
        .then(response => response.json())
        .then(data1 => {
            const data2Location = data1.data_location;
            const data1Processed = data1.data;
            return Promise.all([data1Processed, fetch(`data/${data2Location}`).then(res => res.json())]);
        })
        .then(([data1Processed, data2]) => {
            const data2Processed = data2.data;
            return Promise.all([data1Processed, data2Processed, fetch('data/data3.json').then(res => res.json())]);
        })
        .then(([data1Processed, data2Processed, data3]) => {
            const allData = [...data1Processed, ...data2Processed, ...data3.data];
            displayData(allData);
        })
        .catch(error => console.error('Error fetching with promises: ', error));
};
