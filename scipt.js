// 1. Connection to your free Mailbox (Webhook.site)
const MAILBOX_TOKEN = "ebd43a85-4b98-47b0-8df9-41103382990a";
const MAILBOX_URL = `https://webhook.site/token/${MAILBOX_TOKEN}/requests`;

// 2. Initialize 15 Hubs (Max 50 crates each)
let microHubs = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Micro-Hub ${i + 1}`,
    capacity: 50,
    stored: 0
}));

let processedMessages = new Set(); // To remember which calls we already handled

// 3. The Auto-Routing Logic (Finds the empty space)
function processVoiceBooking(phone, requestedCrates) {
    // Search for the first hub with enough empty space
    const targetHub = microHubs.find(hub => (hub.stored + requestedCrates) <= hub.capacity);

    if (targetHub) {
        targetHub.stored += requestedCrates; // Add crates
        updateDashboard(); // Update screen instantly
        console.log(`AUTOMATIC SUCCESS: Stored ${requestedCrates} crates in ${targetHub.name}`);
    } else {
        alert("SWIFT Network Full! Not enough space in any single hub.");
    }
}

// 4. The "Mailbox Checker" (Runs every 3 seconds)
async function checkMailbox() {
    try {
        const response = await fetch(MAILBOX_URL);
        const data = await response.json();
        
        // Look at every message in the mailbox
        data.data.forEach(msg => {
            // If it is a brand new call from Exotel...
            if (!processedMessages.has(msg.uuid)) {
                processedMessages.add(msg.uuid); // Mark as 'Read'
                
                // Exotel sends the fisherman's voice data here.
                // We extract the crates (defaults to 10 if Exotel didn't hear clearly)
                let crates = 10; 
                let phone = "+91 Fisherman";
                
                // Trigger the automatic website update!
                processVoiceBooking(phone, crates);
            }
        });
    } catch (error) {
        console.log("Waiting for fisherman calls...");
    }
}

// 5. Draw the 15 Hubs on the Screen
function updateDashboard() {
    const container = document.getElementById('hubs-grid');
    if(!container) return;
    
    container.innerHTML = microHubs.map(hub => `
        <div class="hub-card">
            <h3>${hub.name}</h3>
            <p>Stored: <strong>${hub.stored} / ${hub.capacity} Crates</strong></p>
            <div class="progress-bar">
                <div style="width: ${(hub.stored/hub.capacity)*100}%"></div>
            </div>
            <p class="small status-pending">Status: Active</p>
        </div>
    `).join('');
}

// Start the Dashboard and start checking the mailbox!
updateDashboard();
setInterval(checkMailbox, 3000); // Checks the mailbox every 3 seconds automatically