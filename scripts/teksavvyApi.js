let Highcharts = require('highcharts');
let request = require('request-promise-native');

async function makeGraph(url, div, graphName) {
    let options = {
        url: url,
        headers: {
            'TekSavvy-APIKey': localStorage['apiKey']
        }
    };

    let result = await request(options);

    let data = JSON.parse(result).value;
    let onPeakDownloads = [];
    let offPeakDownloads = [];
    let onPeakUploads = [];
    let offPeakUploads = [];
    let date = [];
    for (let i = 0; i < data.length; i++) {
        onPeakDownloads.push(data[i].OnPeakDownload);
        offPeakDownloads.push(data[i].OffPeakDownload);
        onPeakUploads.push(data[i].OnPeakUpload);
        offPeakUploads.push(data[i].OffPeakUpload);

        if (data[i].StartDate) {
            // monthly
            date.push(data[i].StartDate.substring(0, 7));
        }
        else {
            // daily
            date.push(data[i].Date.substring(0, 10))
        }
    }

    Highcharts.chart(div, {
        title: {
            text: graphName
        },
        yAxis: {
            title: {
                text: 'GB'
            }
        },
        xAxis: {
            categories: date
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
            },
            line: {
                animation: true
            }
        },
        series: [
            { name: 'Download (on peak)', data: onPeakDownloads },
            { name: 'Download (off peak)', data: offPeakDownloads },
            { name: 'Upload (on peak)', data: onPeakUploads },
            { name: 'Upload (off peak)', data: offPeakUploads },
        ],
        responsive: {
            rules: [{
                condition: {
                    // maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    });
}

function makeMonthlyGraph() {
    makeGraph("https://api.teksavvy.com/web/Usage/UsageSummaryRecords", "graph-container1", "Monthly usage");
}

function makeDailyGraph() {
    makeGraph("https://api.teksavvy.com/web/Usage/UsageRecords", "graph-container2", "Daily usage");
}