// init global variables & switches
let myMapVis,
    myPieVisRice,
    myPieVisWheat,
    myPieVisMaize,
    myPieVisRagi,
    myPieVisCoffee,
    myPieVisTea;


// click button
var clickedValue = "rainfall";
changeMapView();

function changeMapView(){
    $("button").click(function() {
        clickedValue = $(this).val();
        //console.log(clickedValue);
        myMapVis.updateVis()

    })
}

// load data using promises
let promises = [

    d3.json("data/states.json"),
    d3.csv("data/India_climate.csv"),
    d3.csv("data/crop_state.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);
    // init map
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1]);
    myPieVisRice = new PieVis('Rice', dataArray[2]);
    myPieVisWheat = new PieVis('Wheat', dataArray[2]);
    myPieVisMaize = new PieVis('Maize', dataArray[2]);
    myPieVisRagi = new PieVis('Ragi', dataArray[2]);
    myPieVisCoffee = new PieVis('Coffee', dataArray[2]);
    myPieVisTea = new PieVis('Tea', dataArray[2]);
}

// link map and pie-chart
let stateNameOnMap;
let stateNameOnPie;

getStateOnMap(state);
function getStateOnMap(state) {
    stateNameOnMap = state;

    myPieVisRice.updateVis();
    myPieVisWheat.updateVis();
    myPieVisMaize.updateVis();
    myPieVisRagi.updateVis();
    myPieVisCoffee.updateVis();
    myPieVisTea.updateVis();
}

getStateOnPie(state);
function getStateOnPie(state){
    stateNameOnPie = state;

    myMapVis.updateVis();
}
