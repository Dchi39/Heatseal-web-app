// ==================== GLOBAL VARIABLES ====================
let ModeSet = "heatoff"; // default mode

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  getOutput(); // fetch initial slider values and mode
  setInterval(getTemperatures, 500); // update temperatures every 500 ms
});

// ==================== FETCH CURRENT OUTPUT/SLIDERS ====================
function getOutput() {
  fetch("/getOutput")
    .then(response => response.json())
    .then(data => {
      // Set sliders and displayed values
      setSlider("c1", "coil1", data.c1);
      setSlider("c2", "coil2", data.c2);
      setSlider("c3", "coil3", data.c3);
      setSlider("c4", "coil4", data.c4);

      // Update buttons according to mode
      updateModeButtons(data.mode);
    })
    .catch(err => console.error("Error fetching output:", err));
}

// ==================== FETCH TEMPERATURES ====================
function getTemperatures() {
  fetch("/getTemperatures")
    .then(response => response.json())
    .then(temp => {
      document.getElementById("coil1Temp").innerText = temp.t1 + " °C";
      document.getElementById("coil2Temp").innerText = temp.t2 + " °C";
      document.getElementById("coil3Temp").innerText = temp.t3 + " °C";
      document.getElementById("coil4Temp").innerText = temp.t4 + " °C";
    })
    .catch(err => console.error("Error fetching temperatures:", err));
}

// ==================== UPDATE SLIDERS ====================
function setSlider(sliderId, valueId, value) {
  document.getElementById(sliderId).value = value;
  document.getElementById(valueId).innerText = value;
}

// Called when a slider is moved
function updateSliderValue() {
  const c1 = document.getElementById("c1").value;
  const c2 = document.getElementById("c2").value;
  const c3 = document.getElementById("c3").value;
  const c4 = document.getElementById("c4").value;

  // Update displayed values
  document.getElementById("coil1").innerText = c1;
  document.getElementById("coil2").innerText = c2;
  document.getElementById("coil3").innerText = c3;
  document.getElementById("coil4").innerText = c4;

  // Send updated slider values to ESP32
  fetch(`/slider?coil1=${c1}&coil2=${c2}&coil3=${c3}&coil4=${c4}&Mmode=${ModeSet}`)
    .catch(err => console.error("Error updating sliders:", err));
}

// ==================== UPDATE MODE BUTTONS ====================
function updateModeButtons(mode) {
  ModeSet = mode; // global mode

  document.getElementById("heaton").disabled  = (mode === "heaton");
  document.getElementById("heatoff").disabled = (mode === "heatoff");
  document.getElementById("ideal").disabled   = (mode === "ideal");
}

// Called when a mode button is clicked
function updateMode(mode) {
  ModeSet = mode;

  // Update UI buttons instantly
  updateModeButtons(mode);

  // Send mode to ESP32
  fetch(`/slider?Mmode=${mode}`)
    .catch(err => console.error("Error updating mode:", err));

  // Refresh slider values from ESP32 after mode change
  setTimeout(getOutput, 100);
}