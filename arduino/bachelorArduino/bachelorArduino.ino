// Including necessary libraries
#include "DHT.h"         // https://github.com/adafruit/DHT-sensor-library
#include "OneWire.h"     // http://www.pjrc.com/teensy/arduino_libraries/OneWire.zip
#include "DallasTemperature.h" //https://github.com/milesburton/Arduino-Temperature-Control-Library
//#include "ArduinoJson.h" // https://bblanchon.github.io/ArduinoJson/doc/installation/
// Defining Analog pins in use
#define GASPIN A0    // Analog input from the mq-2 sensor (gas/smoke) // https://create.arduino.cc/projecthub/Aritro/smoke-detection-using-mq-2-gas-sensor-79c54a
#define MOISTPIN A1  // Analog input from the soil moisture sensor // https://learn.sparkfun.com/tutorials/soil-moisture-sensor-hookup-guide
#define LEAKPIN A2   // Analog input from the rain sensor module, used as a leak monitor in this case // http://www.instructables.com/id/Arduino-Modules-Rain-Sensor/ 
#define LIGHTSENSPIN A3

// Defining Digital pins in use
#define DHTPIN 2     // Digital input from the DHT11 temperature/humidity sensor // https://learn.adafruit.com/dht/using-a-dhtxx-sensor
#define FLAMEPIN 3   // Digital input from the flame sensor // http://www.instructables.com/id/Arduino-Modules-Flame-Sensor/, https://docs.google.com/document/d/1FvOoJOS3eoVd8N5guKXi5Qim6IZoohg0390r2Dcsh9k/edit?pli=1
//#define LASERPIN 4   // Laser, if deciding to make it turn on and off http://www.instructables.com/id/Keyes-KY-008-Laser-Transmitter-Demystified/
#define PHOTOELPIN 4 // Digital input from the photoelectric sensor module // https://www.ia.omron.com/support/guide/43/introduction.html
#define VIBEPIN 5 // Digital input from the vibration sensor module //
#define IRBARPIN 6 // Digital input from the Infrared barrier module // http://www.hobbypartz.com/82p-ad-infrared-barrier.html
#define BUZZERPIN 7
#define LEDPIN 8
#define PIRPIN 10 // Digital input from the PIR sensor module
#define ONEWIREBUS 11 // OneWire Bus for the ds18b20 temperature sensors. 


// Other
#define DHTTYPE DHT11   //Defining what type of DHTxx sensor we're using
#define TEMP_PRECISION 9 // Used to set the resolution of the ds18b20 sensors to 9 bit


// Declaring variables and passing arguments to libraries

DHT dht(DHTPIN, DHTTYPE);    // DHT instance for the DHT11 sensor
OneWire oneWire(ONEWIREBUS); // OneWire instance to communicate with the ds18b20 sensors
DallasTemperature dsSensors(&oneWire);
DeviceAddress dsSensor1,dsSensor2; //Arrays to hold ds18b20 sensor addresses. If adding more sensors to the bus, add equally more variabels here

float h, t; // float value for humidity and temperature reading from DHT11
float li; // Analog int value from the temt6000 light sensor
float lux; // Value of light sensor converted to lux
float ds1; //First ds18b20 sensor on bus
float ds2; //Second ds18b20 sensor on bus
int s; // Analog int value from the mq-2 sensor
int m; // Analog int value from the soil moisture sensor
int r; // Analog int value from the rain sensor module/"leak sensor"
int f; // Digital (0,1) value from flame sensor
int l; // Digital (0,1) value from photoelectric sensor module (lasertrip reading)
int v; // Digital (0,1) value from vibration sensor module
int i; // Digital (0,1) value from infrared barrier module
int p; // Digital (0,1) value from PIR sensor module


int wetSoil = 350; // Threshold for deciding if soil is wet or dry.


// Arduino board setup
void setup() {
  Serial.begin(9600);
  dht.begin();
  dsSensors.begin();
  pinMode(GASPIN, INPUT);
  pinMode(MOISTPIN, INPUT);
  pinMode(LEAKPIN, INPUT);
  pinMode(FLAMEPIN, INPUT);
  pinMode(PHOTOELPIN, INPUT);
  pinMode(VIBEPIN, INPUT);
  pinMode(IRBARPIN, INPUT);
  pinMode(LIGHTSENSPIN,  INPUT);
  pinMode(LEDPIN, OUTPUT);
  pinMode(BUZZERPIN, OUTPUT);
  pinMode(PIRPIN, INPUT);

  // Add more lines here if adding more ds18b20 sensors to the bus. Use the varibles added in DeviceAddress.
  if(!dsSensors.getAddress(dsSensor1, 0)) Serial.println("Unable to find address for device 0");
  if(!dsSensors.getAddress(dsSensor2, 1)) Serial.println("Unable to find address for device 0");
    dsSensors.setResolution(dsSensor1, TEMP_PRECISION);
  dsSensors.setResolution(dsSensor2, TEMP_PRECISION);
}

// Loop with main program
void loop() {
  // Delay between measurements
  delay(2000);
  temperature_read();
  humidity_read();
  gassensor_read();
  flamesensor_read();
  lasertrip_read();
  vibesensor_read();
  irbarrier_read();
  soilmoist_read();
  leaksensor_read();
  lightsensor_read();
  pirsensor_read();
 dsSensors.requestTemperatures();
 ds18b20_read();
  printData();
 // beep(50);
//  json_print();

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
}
}

// The outprint is on JSON form, and is the data the node application uses. If adding more sensor make sure to include these sebsors to the print if necessary.
void printData() {
  Serial.println(
      "{\"Temperature\":\"" + String(t) +
      "\", \"Humidity\":\"" + String(h) +
      "\", \"Laser\":\"" + String(l) +
      "\", \"Gas\":\"" + String(s) +
      "\", \"Flame\":\"" + String(f) +
      "\", \"VibeValue\":\"" + String(v) +
      "\", \"IRBarrierValue\":\"" + String(i) +
      "\", \"SoilMoisture\":\"" + String(m) +
      "\", \"LeakValue\":\"" + String(r) +
      "\", \"LightValue\":\"" + String(lux) +
      "\", \"PirValue\":\""+ String(p)+
      "\", \"Ds1Value\":\""+ String(ds1)+
      "\", \"Ds2Value\":\""+ String(ds2)+
      "\"}");
}

void humidity_read() {
  h = dht.readHumidity();
}

void temperature_read()
{
  t = dht.readTemperature(); // Read temperature as Celsius (the default)
}

void gassensor_read()
{
  s = analogRead(GASPIN); // Read value of gas sensor
}

void flamesensor_read()
{
  f = digitalRead(FLAMEPIN);
}

void lasertrip_read()
{
  l = digitalRead(PHOTOELPIN);
}

// Window safety barrier
void vibesensor_read() // Forbedre med at arduino sender alarm ved gjentatte viberasjoner, eller bruke int verdi 0 -> 1023 for å unngå falske alarmer? https://www.youtube.com/watch?v=0SUgfuUDYNk
{
  v = digitalRead(VIBEPIN);
}

void irbarrier_read()
{
  i = digitalRead(IRBARPIN);
}

void soilmoist_read()
{
  m = analogRead(MOISTPIN); // Read Soil moisture value
}

void leaksensor_read()
{
  r = analogRead(LEAKPIN); // Read Rain sensor value
}

// https://forum.arduino.cc/index.php?topic=185158.0
void lightsensor_read()
{
  li = analogRead(LIGHTSENSPIN); //Read light level
  float volts = li * 5.0 / 1024.0;
  float amps = volts / 10000.0; // TEMT6000 intergrated resistor is 10kohms
  float microamps = amps * 1000000.0;
  lux = microamps * 2.0;


  // Code for dimming the Led
  //float square_ratio = li / 1023.0;      //Get percent of maximum value (1023)
  //square_ratio = pow(square_ratio, 2.0);      //Square to make response more obvious
  //analogWrite(LEDPIN, 255.0 * square_ratio);  //Adjust LED brightness relatively
}

void pirsensor_read()
{
  p = digitalRead(PIRPIN);
}
float getDsTemp(DeviceAddress dsAddress)
{
  return dsSensors.getTempC(dsAddress);
  
}
// Function reads temperature of the ds18b20 sensors. If adding more sensors to the bus, make sure you read them here also.

void ds18b20_read()
{
  ds1 = getDsTemp(dsSensor1);
  ds2 = getDsTemp(dsSensor2);
}

void beep(unsigned char delayms)
{
  analogWrite(BUZZERPIN, 20); //Setting pin to high
  delay(delayms); //Delaying
  analogWrite(BUZZERPIN ,0); //Setting pin to LOW
  delay(delayms); //Delaying

}

