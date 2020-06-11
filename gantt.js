google.charts.load('current', {'packages':['gantt']});
// google.charts.setOnLoadCallback(drawChart);
google.charts.setOnLoadCallback(getData);

function daysToMilliseconds(days) {
    return days * 24 * 60 * 60 * 1000;
}

function getData() {
    var queryString = encodeURIComponent('select A, B, C, F, G, H, I, J');

    var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1astWf1jlEIF2PCziDdLZlTqyBxr88XCe4Nw5gEcG6VI/gviz/tq?gid=1329900028&headers=1&tq=' + queryString);
    query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
    if (response.isError()) {
        alert('Error in query: ' + response,getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    var data = response.getDataTable();
    drawChart(data)
}

function transformData(val, major_milestone_filter = false){
    var new_data = []

    for (var y = 0, maxrows = val.getNumberOfRows(); y < maxrows; y++) {
        var row_data = []
        for (var x = 0, maxcols = val.getNumberOfColumns(); x < maxcols; x++) {
            row_data.push(val.getValue(y, x))
        }
        let wbs_no, wbs_title, milestone_id, milestone, base_start_date, base_completion_date, actual_completion_date, comments;
        [wbs_no, wbs_title, milestone_id, milestone, base_start_date, base_completion_date, actual_completion_date, comments] = row_data;

        if (major_milestone_filter) {
            var res = milestone_id.split(".");
            if (res[2] != "00") {
                continue;
            }
        }

        var start_date = base_start_date;
        var end_date = actual_completion_date;

        if (start_date === null) {
            start_date = new Date(2020, 1, 1);
        }

        if (end_date === null) {
            end_date = base_completion_date
        }

        // Adding resource for "grouping"
        new_data.push([milestone_id, milestone, wbs_title, start_date, end_date, null, 100, null]);
        // new_data.push([milestone_id, milestone, start_date, end_date, null, 100, null]);
    }
    return new_data
}

function drawChart(spreadSheetData) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Task ID');
    data.addColumn('string', 'Task Name');
    // adds resource for grouping - adjust tranformData accordingly
    data.addColumn('string', 'Resource');
    data.addColumn('date', 'Start Date');
    data.addColumn('date', 'End Date');
    data.addColumn('number', 'Duration');
    data.addColumn('number', 'Percent Complete');
    data.addColumn('string', 'Dependencies');

    var newRows = transformData(spreadSheetData, true);



    // var newRows = spreadSheetData.rows.map(transformData);

    // data.addRows([
    //     ['Research', 'Find sources',
    //         new Date(2015, 0, 1), new Date(2015, 0, 5), null,  100,  null],
    //     ['Write', 'Write paper',
    //         null, new Date(2015, 0, 9), daysToMilliseconds(3), 25, 'Research,Outline'],
    //     ['Cite', 'Create bibliography',
    //         null, new Date(2015, 0, 7), daysToMilliseconds(1), 20, 'Research'],
    //     ['Complete', 'Hand in paper',
    //         null, new Date(2015, 0, 10), daysToMilliseconds(1), 0, 'Cite,Write'],
    //     ['Outline', 'Outline paper',
    //         null, new Date(2015, 0, 6), daysToMilliseconds(1), 100, 'Research']
    // ]);

    data.addRows(newRows)
    // data.sort(2)
    //
    var options = {
        height: 4500,
        width: 2000,
        gantt : {
            labelMaxWidth: 1200,
            labelStyle: {
                fontName: "Arial",
                fontSize: 14,
                color: '#757575',
                fontWeight: "bold"
            }
        }
    };

    var chart = new google.visualization.Gantt(document.getElementById('chart_div'));

    chart.draw(data, options);
}