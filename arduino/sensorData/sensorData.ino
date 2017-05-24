// Including necessary libraries
#include "DHT.h"         // https://github.com/adafruit/DHT-sensor-library/archive/master.zip
#include "OneWire.h"     // http://www.pjrc.com/teensy/arduino_libraries/OneWire.zip
#include "DallasTemperature.h" //https://github.com/milesburton/Arduino-Temperature-Control-Library/archive/master.zip

// Defining Analog pins in use
#define GASPIN A0    // Analog input from the mq-2 sensor (gas/smoke)
#define MOISTPIN A1  // Analog input from the soil moisture sensor
#define LEAKPIN A2   // Analog input from the rain sensor module, used as a leak monitor in this case
#define LIGHTSENSPIN A3 // Analog input from the temt6000 light sensor.

// Defining Digital pins in use
#define DHTPIN 2     // Digital input from the DHT11 temperature/humidity sensor
#define FLAMEPIN 3   // Digital input from the flame sensor
#define PHOTOELPIN 4 // Digital input from the photoresistor sensor module
#define VIBEPIN 5 // Digital input from the vibration sensor module
#define IRBARPIN 6 // Digital input from the Infrared barrier module
#define PIRPIN 10 // Digital input from the PIR sensor module
#define ONEWIREBUS 11 // OneWire Bus for the ds18b20 temperature sensors.


// Other
#define DHTTYPE DHT11   //Defining what type of DHTxx sensor we're using
#define TEMP_PRECISION 9 // Used to set the resolution of the ds18b20 sensors to 9 bit


// Declaring variables and passing arguments to libraries

DHT dht(DHTPIN, DHTTYPE);    // DHT instance for the DHT11 sensor
OneWire oneWire(ONEWIREBUS); // OneWire instance to communicate with the ds18b20 sensors
DallasTemperature dsSensors(&oneWire);
DeviceAddress dsSensor1,dsSensor2; //Arrays to hold ds18b20 sensor addresses. If adding more sensors to the bus, add equally more variables here

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
  pinMode(PIRPIN, INPUT);

  // Add more lines here if adding more ds18b20 sensors to the bus. Use the variables added in DeviceAddress.
  if(!dsSensors.getAddress(dsSensor1, 0)) Serial.println("Unable to find address for device 0");
  if(!dsSensors.getAddress(dsSensor2, 1)) Serial.println("Unable to find address for device 1");
    dsSensors.setResolution(dsSensor1, TEMP_PRECISION);
  dsSensors.setResolution(dsSensor2, TEMP_PRECISION);
}

// Loop with main program
void loop() {
  char inChar =Serial.read(); // Storing input from node.js server as a local variable

  // Node server is set up to write the character 'c' every second. If the Arduino receives a 'c',
  // then run functions for reading the different sensors and return the readings in a print.
  if(inChar == 'c'){
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


  // Check if DHT11 reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
   }
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
  t = dht.readTemperature(); // Read temperature as Celsius
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


void vibesensor_read()
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


void lightsensor_read()
{
  li = analogRead(LIGHTSENSPIN); //Read light level
  float volts = li * 5.0 / 1024.0;
  float amps = volts / 10000.0; // TEMT6000 intergrated resistor is 10kohms
  float microamps = amps * 1000000.0;
  lux = microamps * 2.0;

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