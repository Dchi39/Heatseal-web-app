var ModeSet = "heatoff";
getOutput();

function getOutput() {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/getOutput', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          console.log(xhr.responseText);
          alert(xhr.responseText);
          var jsonstr = JSON.parse(xhr.responseText);
          console.log(jsonstr);

        if(jsonstr["mode"] == "heatoff"){
            document.getElementById("heatoff").disabled = true;
            document.getElementById("heaton").disabled = false;
            document.getElementById("ideal").disabled = false;
        }

        if(jsonstr["mode"] == "heaton"){
            document.getElementById("heatoff").disabled = false;
            document.getElementById("heaton").disabled = true;
            document.getElementById("ideal").disabled = false;
        }

        if(jsonstr["mode"] == "ideal"){
            document.getElementById("heatoff").disabled = false;
            document.getElementById("heaton").disabled = false;
            document.getElementById("ideal").disabled = true;
        }

        
        console.log("Step From the esp", jsonstr["step"]);
    }};
      xhr.send();
}

// Function to send the slider value to the ESP32
    function sendSliderValue() {
      const xhr = new XMLHttpRequest();
      const value = slider.value;
      xhr.open("GET", `/slider?value=${value}`, true);
      xhr.send();
    }

    function updateSliderValue() {
      let coil1 = document.getElementById('c1').value;
      document.getElementById('coil1').innerText = coil1;
      let coil2 = document.getElementById('c2').value;
      document.getElementById('coil2').innerText = coil2;
      let coil3 = document.getElementById('c3').value;
      document.getElementById('coil3').innerText = coil3;
      let coil4 = document.getElementById('c4').value;
      document.getElementById('coil4').innerText = coil4;

      console.log("Change Occured...", coil1, coil2, coil3, coil4);
      // Send the slider value to the ESP32
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/slider?coil1=" + coil1 + "&coil2=" + coil2 + "&coil3=" + coil3 + "&coil4=" + coil4 + "&Mmode=" + ModeSet, true);
      xhr.send();
    }

    function updateMode(mode) {
      console.log(mode);
      ModeSet = mode;

      if(mode=="heaton"){
            document.getElementById("heatoff").disabled = false;
            document.getElementById("heaton").disabled = true;
            document.getElementById("ideal").disabled = false;
          }
          if(mode=="heatoff"){
            document.getElementById("heatoff").disabled = true;
            document.getElementById("heaton").disabled = false;
            document.getElementById("ideal").disabled = false;
            // smartbtBtn
            // suctionbtBtn

          }
          if(mode=="ideal"){
            document.getElementById("heatoff").disabled = false;
            document.getElementById("heaton").disabled = false;
            document.getElementById("ideal").disabled = true;
          }

      var xhr = new XMLHttpRequest();
      xhr.open("GET", `/slider?Mmode=${mode}`, true);
      console.log("Sending"+mode);
      xhr.send();
    }