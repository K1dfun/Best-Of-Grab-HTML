let outputHistory = [];  // ✅ Ensure this is defined before use

document.getElementById("urlInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        fetchLevelData();
    }
});

function fetchLevelData() {
    const input = document.getElementById('urlInput').value.trim();
    const match = input.match(/\?level=([\w]+):(\d+)/);
    const outputContainer = document.getElementById('output-container');
    
    if (!match) {
        outputContainer.innerHTML = "<div class='output-box' style='color:red;'>Invalid URL format. Ensure it's like '?level=example:1234'</div>";
        return;
    }

    const levelId = `${match[1]}/${match[2]}`;
    const apiUrl = `https://api.slin.dev/grab/v1/details/${levelId}`;

    outputContainer.innerHTML = "<div class='output-box' style='text-align:center;'>Loading...</div>";

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch level data.");
            return response.json();
        })
        .then(data => {
            outputContainer.innerHTML = ""; // Clear loading message
            displayLevelImage(levelId);
            displayInitialData(data);
            displayButtons(data);
            document.getElementById('buttons-box').style.display = 'block';
        })
        .catch(error => {
            outputContainer.innerHTML = `<div class='output-box' style='color:red;'>Error: ${error.message}. Please check the level ID.</div>`;
        });
}

function displayLevelImage(levelId) {
    const img = document.getElementById('level-image');
    img.src = `https://grab-images.slin.dev/level_${levelId.replace('/', '_')}_1_thumb.png`;
    img.onerror = function () {
        this.src = "Default_Image.png";
    };
}

function displayInitialData(data) {
    addOutputBox("Title", data.title);
    addOutputBox("Creators", data.creators);
    addOutputBox("Complexity", data.complexity);
}

function displayButtons(data) {
    const buttonContainer = document.getElementById('button-container');
    buttonContainer.innerHTML = '';

    Object.entries(data).forEach(([key, value]) => {
        if (key === "title" || key === "creators" || key === "complexity") return;
        
        const button = document.createElement('button');
        button.innerText = key.replaceAll('_', ' ');  // Make button labels more readable
        button.className = 'data-button';
        button.onclick = () => addOutputBox(key, value);
        buttonContainer.appendChild(button);
    });
}

function addOutputBox(key, value) {
    const outputContainer = document.getElementById('output-container');
    const outputBox = document.createElement('div');
    outputBox.className = 'output-box';
    outputBox.style.opacity = "0"; // Start invisible
    outputBox.innerHTML = `<strong>${key}</strong><pre>${JSON.stringify(value, null, 2)}</pre>`;
    
    outputContainer.appendChild(outputBox);
    
    setTimeout(() => { outputBox.style.opacity = "1"; }, 100); // Smooth fade-in

    outputHistory.push(outputBox);
    
    if (outputHistory.length > 6) {
        const firstOutput = outputHistory.shift();
        firstOutput.style.opacity = "0";
        setTimeout(() => outputContainer.removeChild(firstOutput), 300);
    }
}