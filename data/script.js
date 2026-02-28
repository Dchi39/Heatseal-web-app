let ModeSet = "heatoff";

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
    getOutput();
    setInterval(getTemperatures, 500); // update every 500 ms
});

// Fetch slider values and mode
function getOutput() {
    fetch("/getOutput")
    .then(r=>r.json())
    .then(data=>{
        setSlider("c1","coil1",data.c1);
        setSlider("c2","coil2",data.c2);
        setSlider("c3","coil3",data.c3);
        setSlider("c4","coil4",data.c4);
        updateModeButtons(data.mode);
    });
}

// Fetch simulated temperatures
function getTemperatures() {
    fetch("/getTemperatures")
    .then(r=>r.json())
    .then(temp=>{
        document.getElementById("coil1Temp").innerText = temp.t1 + " °C";
        document.getElementById("coil2Temp").innerText = temp.t2 + " °C";
        document.getElementById("coil3Temp").innerText = temp.t3 + " °C";
        document.getElementById("coil4Temp").innerText = temp.t4 + " °C";
    });
}

// Update sliders
function setSlider(sliderId,valueId,value){
    document.getElementById(sliderId).value = value;
    document.getElementById(valueId).innerText = value;
}

// Slider changed
function updateSliderValue() {
    const c1 = document.getElementById("c1").value;
    const c2 = document.getElementById("c2").value;
    const c3 = document.getElementById("c3").value;
    const c4 = document.getElementById("c4").value;

    document.getElementById("coil1").innerText = c1;
    document.getElementById("coil2").innerText = c2;
    document.getElementById("coil3").innerText = c3;
    document.getElementById("coil4").innerText = c4;

    fetch(`/slider?coil1=${c1}&coil2=${c2}&coil3=${c3}&coil4=${c4}&Mmode=${ModeSet}`);
}

// Mode buttons
function updateModeButtons(mode) {
    ModeSet = mode;
    document.getElementById("heaton").disabled  = (mode==="heaton");
    document.getElementById("heatoff").disabled = (mode==="heatoff");
    document.getElementById("ideal").disabled   = (mode==="ideal");
}

function updateMode(mode){
    ModeSet = mode;
    updateModeButtons(mode);
    fetch(`/slider?Mmode=${mode}`);
    setTimeout(getOutput,100);
}