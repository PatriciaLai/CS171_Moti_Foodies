// Importing data

d3V3.csv("data/religion.csv", function(err, data) {
    if (err) {
        console.error(err);
    } else {
        let waffle = new WaffleChart()
            .selector("#religion_chart")
            .data(data)
            .useWidth(false)
            .label("")
            .size(12)
            .gap(2)
            .rows(30)
            .columns(50)
            .rounded(true)();
    }
});

// source: https://gist.github.com/tomcardoso/1d44732cc7f3d97d6bf7#file-data-csv
// dataset: https://www.census2011.co.in/religion.php