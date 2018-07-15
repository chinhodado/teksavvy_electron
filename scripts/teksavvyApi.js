let Highcharts = require('highcharts');
let request = require('request-promise-native');

async function makeGraph(url, graphDiv, graphName, prevData) {
    let options = {
        url: url,
        headers: {
            'TekSavvy-APIKey': localStorage['apiKey']
        }
    };

    let result = await request(options);
    result = JSON.parse(result);

    let data = result.value;

    let graphData;
    if (prevData) {
        graphData = prevData;
    }
    else {
        graphData = {
            graphDiv: graphDiv,
            graphName: graphName,
            onPeakDownloads: [],
            offPeakDownloads: [],
            onPeakUploads: [],
            offPeakUploads: [],
            date: []
        }
    }

    for (let i = 0; i < data.length; i++) {
        graphData.onPeakDownloads.push(data[i].OnPeakDownload);
        graphData.offPeakDownloads.push(data[i].OffPeakDownload);
        graphData.onPeakUploads.push(data[i].OnPeakUpload);
        graphData.offPeakUploads.push(data[i].OffPeakUpload);

        if (data[i].StartDate) {
            // monthly
            graphData.date.push(data[i].StartDate.substring(0, 7));
        }
        else {
            // daily
            graphData.date.push(data[i].Date.substring(0, 10))
        }
    }

    if (result['odata.nextLink']) {
        let nextLink = result['odata.nextLink'];
        // shitty TekSavvy puts a HTTP link here but refuses to allow HTTP connection
        if (nextLink.startsWith("http:")) {
            nextLink = "https:" + nextLink.substring(5);
        }
        await makeGraph(nextLink, graphDiv, graphName, graphData)
    }
    else {
        drawGraph(graphData)
    }
}

function drawGraph(data) {
    Highcharts.chart(data.graphDiv, {
        title: {
            text: data.graphName
        },
        yAxis: {
            title: {
                text: 'GB'
            }
        },
        xAxis: {
            categories: data.date
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
            { name: 'Download (on peak)', data: data.onPeakDownloads },
            { name: 'Download (off peak)', data: data.offPeakDownloads },
            { name: 'Upload (on peak)', data: data.onPeakUploads },
            { name: 'Upload (off peak)', data: data.offPeakUploads },
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

async function makeMonthlyGraph() {
    await makeGraph("https://api.teksavvy.com/web/Usage/UsageSummaryRecords", "graph-container1", "Monthly usage");
}

async function makeDailyGraph() {
    await makeGraph("https://api.teksavvy.com/web/Usage/UsageRecords", "graph-container2", "Daily usage");
}