// init global variables & switches
let myMapVis;

var clickedValue = "rainfall";
myFunction();

function myFunction(){
    $("button").click(function() {
        clickedValue = $(this).val();
        //console.log(clickedValue);
        myMapVis.updateVis()

    })
}


// load data using promises
let promises = [

    d3.json("data/states.json"),
    d3.csv("data/India_climate.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);
    // init map
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1]);

}




