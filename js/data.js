const ITEMS = [
  { id:'engine_oil',    group:'fluids',  name:'Engine Oil & Filter',        pn:'0W-20 Full Syn · PN# 04152-YZZA1 · 6.2 qts', normal:5000,  severe:2000,   notes:'Drain: 30 ft·lb · Filter housing: 18 ft·lb · Filter drain: 10 ft·lb' },
  { id:'transmission',  group:'fluids',  name:'Transmission Fluid',         pn:'Toyota ATF WS',                               normal:100000,severe:60000,  notes:'Fill: 29 ft·lb · Overflow: 15 ft·lb · Drain: 15 ft·lb' },
  { id:'transfer_case', group:'fluids',  name:'Transfer Case Oil',          pn:'Gear Oil LF 75W',                             normal:60000, severe:30000,  notes:'Fill & Drain: 27 ft·lb' },
  { id:'rear_diff',     group:'fluids',  name:'Rear Differential Fluid',    pn:'Gear Oil 75W-85 GL-5',                        normal:30000, severe:15000,  notes:'Fill & Drain: 36 ft·lb' },
  { id:'front_diff',    group:'fluids',  name:'Front Differential Fluid',   pn:'Gear Oil 75W-85 GL-5',                        normal:30000, severe:15000,  notes:'Fill: 29 ft·lb · Drain: 48 ft·lb' },
  { id:'coolant',       group:'fluids',  name:'Engine Coolant',             pn:'Toyota SLLC',                                 normal:100000,severe:null,   notes:'Radiator drain: hand tight · Block drain: 9 ft·lb' },
  { id:'brake_fluid',   group:'fluids',  name:'Brake Fluid',                pn:'DOT 3 / SAE J1703',                           normal:25000, severe:null,   notes:'Inspect every 25K · change if discolored' },
  { id:'pwr_steering',  group:'fluids',  name:'Power Steering Fluid',       pn:'DEXRON II or III',                            normal:50000, severe:null,   notes:'Inspect for leaks and fluid clarity' },
  { id:'cabin_filter',  group:'filters', name:'Cabin Air Filter',           pn:'PN# 87139-YZZ09',                             normal:20000, severe:null,   notes:'More frequently in dusty environments' },
  { id:'air_filter',    group:'filters', name:'Engine Air Filter',          pn:'PN# 17801-0P100',                             normal:5000,  severe:5000,   notes:'Inspect every 5K · change when dirty' },
  { id:'spark_plugs',   group:'filters', name:'Spark Plugs',                pn:'Denso FK20HBR8 Iridium',                      normal:60000, severe:null,   notes:'Pre-gapped iridium · 13 ft·lb' },
  { id:'driveshaft',    group:'filters', name:'Grease Driveshaft',          pn:'Lithium Chassis Grease',                      normal:15000, severe:5000,   notes:'Not all 3rd Gens have greaseable driveshafts — confirm yours' },
  { id:'tire_rot',      group:'brakes',  name:'Tire Rotation',              pn:'Inspect for damage · Lug nuts: 83 ft·lb',     normal:5000,  severe:null,   notes:'Front-to-rear or rearward cross pattern recommended' },
  { id:'front_brakes',  group:'brakes',  name:'Front Brakes',               pn:'Pads PN# 04465-AZ200 · Rotors PN# 43512-04052',normal:10000,severe:null,  notes:'Inspect every 10K · replace before 2mm thick' },
  { id:'rear_drums',    group:'brakes',  name:'Rear Drum Brakes',           pn:'PN# 04495-04010',                             normal:20000, severe:null,   notes:'Inspect every 20K · replace before 2mm thick' },
  { id:'serp_belt',     group:'brakes',  name:'Serpentine Belt',            pn:'PN# 90916-A2037',                             normal:100000,severe:null,   notes:'Replace at 100K or if chirping / cracking detected' },
];

let miles = null;
let records = {};
let severeMode = false;
let nonServiceable = {}; // { itemId: true }
let customItems = []; // { id, name, pn, interval, notes }
let editingCustomId = null;

const truckImgEl = document.querySelector('.truck-img');
if (truckImgEl && !truckImgEl.id) truckImgEl.id = 'truckImg';
const defaultTruckImageSrc = truckImgEl?.getAttribute('src') || '';
const defaultTruckImageLabel = document.getElementById('truckImgLabel')?.textContent || '';
