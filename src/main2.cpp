#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include "PIDController.h"

// ================= WIFI =================
const char* ssid = "heatseal";
const char* password = "12345678";
IPAddress local_IP(192,168,4,1);
IPAddress gateway(192,168,4,1);
IPAddress subnet(255,255,255,0);

WebServer server(80);
DNSServer dnsServer;

// ================= PINS =================
#define sensor1_read 4
#define sensor2_read 5
#define sensor3_read 6
#define sensor4_read 7

#define coil1_out 12
#define coil2_out 13
#define coil3_out 14
#define coil4_out 15

// ================= CONTROL VARIABLES =================
int setTemp[4] = {150,130,110,90};
double temp[4], output[4];
String Mode = "heatoff";
bool safeLock = false;

// ================= PID CONTROLLERS =================
PIDController pid1(3.0, 0.8, 1.2);
PIDController pid2(3.0, 0.8, 1.2);
PIDController pid3(3.0, 0.8, 1.2);
PIDController pid4(3.0, 0.8, 1.2);

// ================= UTILITIES =================
int readKY028(int pin) {
    int raw = analogRead(pin);
    return map(raw, 0, 4095, 0, 200); // approximate °C
}

void readTemperatures() {
    temp[0] = readKY028(sensor1_read);
    temp[1] = readKY028(sensor2_read);
    temp[2] = readKY028(sensor3_read);
    temp[3] = readKY028(sensor4_read);
}

// ================= WEB HANDLERS =================
void handleRoot() {
    File f = SPIFFS.open("/index.html");
    server.streamFile(f,"text/html");
    f.close();
}

void handleFile(const char* path,const char* type){
    File f = SPIFFS.open(path);
    server.streamFile(f,type);
    f.close();
}

void handleSlider(){
    if(server.hasArg("coil1")){
        setTemp[0] = server.arg("coil1").toInt();
        setTemp[1] = server.arg("coil2").toInt();
        setTemp[2] = server.arg("coil3").toInt();
        setTemp[3] = server.arg("coil4").toInt();
    }
    if(server.hasArg("Mmode")){
        String m = server.arg("Mmode");
        if(m=="ideal"){
            setTemp[0] = setTemp[1] = setTemp[2] = setTemp[3] = 100;
        }
        Mode = m;
    }
    server.send(200,"text/plain","OK");
}

void handleGetOutput(){
    StaticJsonDocument<256> doc;
    doc["c1"] = setTemp[0];
    doc["c2"] = setTemp[1];
    doc["c3"] = setTemp[2];
    doc["c4"] = setTemp[3];
    doc["mode"] = Mode;
    String json;
    serializeJson(doc,json);
    server.send(200,"application/json",json);
}

void handleGetTemperatures(){
    StaticJsonDocument<256> doc;
    doc["t1"] = (int)temp[0];
    doc["t2"] = (int)temp[1];
    doc["t3"] = (int)temp[2];
    doc["t4"] = (int)temp[3];
    String json;
    serializeJson(doc,json);
    server.send(200,"application/json",json);
}

// ================= SETUP =================
void setup(){
    Serial.begin(115200);
    SPIFFS.begin(true);

    WiFi.mode(WIFI_AP);
    WiFi.softAPConfig(local_IP,gateway,subnet);
    WiFi.softAP(ssid,password);
    dnsServer.start(53,"*",local_IP);

    // Routes
    server.on("/",handleRoot);
    server.on("/style.css",[](){ handleFile("/style.css","text/css"); });
    server.on("/bootstrap.css",[](){ handleFile("/bootstrap.css","text/css"); });
    server.on("/script.js",[](){ handleFile("/script.js","application/javascript"); });
    server.on("/bootstrap.js",[](){ handleFile("/bootstrap.js","application/javascript"); });
    server.on("/slider",handleSlider);
    server.on("/getOutput",handleGetOutput);
    server.on("/getTemperatures",handleGetTemperatures);
    server.begin();

    // PWM setup
    ledcSetup(0,5000,8);
    ledcSetup(1,5000,8);
    ledcSetup(2,5000,8);
    ledcSetup(3,5000,8);

    ledcAttachPin(coil1_out,0);
    ledcAttachPin(coil2_out,1);
    ledcAttachPin(coil3_out,2);
    ledcAttachPin(coil4_out,3);

    pid1.setSetpoint(setTemp[0]);
    pid2.setSetpoint(setTemp[1]);
    pid3.setSetpoint(setTemp[2]);
    pid4.setSetpoint(setTemp[3]);
}

// ================= LOOP =================
void loop(){
    dnsServer.processNextRequest();
    server.handleClient();
    readTemperatures();

    // Safety lock
    if(temp[0] >= setTemp[0]) safeLock = true;
    else if(temp[0] <= setTemp[0]-10) safeLock = false;

    // Update PID setpoints
    pid1.setSetpoint(setTemp[0]);
    pid2.setSetpoint(setTemp[1]);
    pid3.setSetpoint(setTemp[2]);
    pid4.setSetpoint(setTemp[3]);

    // PID input
    pid1.setInput(temp[0]); pid2.setInput(temp[1]);
    pid3.setInput(temp[2]); pid4.setInput(temp[3]);

    // Compute outputs
    if((Mode=="heaton" || Mode=="ideal") && !safeLock){
        ledcWrite(0,(int)pid1.compute());
        ledcWrite(1,(int)pid2.compute());
        ledcWrite(2,(int)pid3.compute());
        ledcWrite(3,(int)pid4.compute());
    } else {
        ledcWrite(0,0); ledcWrite(1,0);
        ledcWrite(2,0); ledcWrite(3,0);
    }
}