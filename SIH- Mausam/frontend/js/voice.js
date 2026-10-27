// Voice Weather Feature
document.getElementById("voiceBtn").addEventListener("click", () => {
    // Check if browser supports speech
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        alert("Voice not supported in this browser. Try Chrome.");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    const language = document.getElementById("language").value;
    
    // Set language
    switch(language) {
        case "hindi":
            recognition.lang = "hi-IN";
            break;
        case "malayalam":
            recognition.lang = "ml-IN";
            break;
        case "tamil":
            recognition.lang = "ta-IN";
            break;
        default:
            recognition.lang = "en-IN";
    }
    
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Add active state to button
    const voiceBtn = document.getElementById("voiceBtn");
    voiceBtn.classList.add("voice-active");
    voiceBtn.textContent = "🎙️ Listening...";

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("User said:", transcript);
        
        // Reset button
        voiceBtn.classList.remove("voice-active");
        voiceBtn.textContent = "🗣️ Speak Weather";
        
        // Get current city
        const city = document.getElementById("citySelect").value;
        
        // Fetch weather and speak
        fetch(`${API_BASE}/weather/${city}`)
            .then(res => res.json())
            .then(data => {
                let speechText = "";
                
                if (language === "hindi") {
                    speechText = `Aaj ${city} me temperature ${data.temperature} degree Celsius hai. Humidity ${data.percent || data.humidity} percent hai. ${data.condition}.`;
                } else if (language === "malayalam") {
                    speechText = `Innu ${city}il temperature ${data.temperature} degree Celsius aanu. Humidity ${data.percent || data.humidity} percent aanu. ${data.condition}.`;
                } else if (language === "tamil") {
                    speechText = `Indru ${city}il temperature ${data.temperature} degree Celsius. Humidity ${data.percent || data.humidity} percent. ${data.condition}.`;
                } else {
                    speechText = `Today in ${city}, temperature is ${data.temperature} degrees Celsius. Humidity is ${data.percent || data.humidity} percent. ${data.condition}.`;
                }
                
                speak(speechText, language);
            })
            .catch(error => {
                console.error("Error fetching weather for voice:", error);
                speak("Sorry, I could not fetch the weather data.", "en-IN");
            });
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        voiceBtn.classList.remove("voice-active");
        voiceBtn.textContent = "🗣️ Speak Weather";
        
        if (event.error === "no-speech") {
            speak("I did not hear anything. Please try again.", "en-IN");
        }
    };

    recognition.onend = () => {
        voiceBtn.classList.remove("voice-active");
        voiceBtn.textContent = "🗣️ Speak Weather";
    };

    recognition.start();
});

function speak(text, lang = "en-IN") {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
}
