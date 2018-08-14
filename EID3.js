var imported = document.createElement('script');
imported.src = 'https://code.jquery.com/jquery-1.11.3.js';
document.head.appendChild(imported);

function renderAnalysisPage(){
    var charts = document.querySelectorAll(".epiinfochart");
    renderSwitch(charts);
}

function renderSwitch(chartNodeList){
    chartNodeList.forEach(function(chartNode){
        addSettings(chartNode);
        var chartJson = JSON.parse(chartNode.children[0].innerHTML);
        switch (chartJson.chart.type){
            case "epicurve" :
                renderEpiCurve(chartNode);
                break;
            case "columnchart" :
                renderEpiCurve(chartNode);
                break;
        }
    });
}

function addSettings(renderNode){
    var nodeJson = JSON.parse(renderNode.children[0].innerHTML);
    var settings = nodeJson.chart.settings;

    var chartNode = $("#" + renderNode.id);
    var settingDivId = renderNode.id + "_settings";
    chartNode.append('<div id="' + settingDivId + '" class="settings"></div>');
    
    var settingsNode = $("#" + renderNode.id).find(".settings");
    settingsNode.append('<div class="settingsClickDiv" onclick="toggleSettings(' + renderNode.id + ')"><a><strong>&nbsp;...&nbsp;</strong></a></div>');
    settingsNode.append('<div id="' + renderNode.id + '_inputs" class="inputs" style="display: none;"></div>');

    var inputNode = $("#" + renderNode.id).find(".settings").find(".inputs");

    if (typeof settings != 'undefined'){
        settings.forEach(function(attribute){
            inputNode.append('<div class="settingsInputBlock"><div class="settingsInputLabel">' + attribute.prompt + '</div><input type="text" id="' + renderNode.id + '_' + attribute.name + '" class="settingsInput" name="' + attribute.name + '" value="' + attribute.value + '" ></div></div>');
        });
    }

    settingsNode.append('<div id="' + renderNode.id + '_buttons" class="buttons" style="display: none;"><button class="card__button" onclick="okayClick(' + renderNode.id + ')">OK</button><button class="card__button" onclick="cancelClick(' + renderNode.id + ')">CANCEL</button></div>');
}

function applySettings(chartNode){
   $("#" + chartNode.id + "_title.chartCell span").text($("#" + chartNode.id + "_chartTitle.settingsInput").val());
   $("#" + chartNode.id + "_legend.chartCell span").text($("#" + chartNode.id + "_legendTitle.settingsInput").val());
   $("#" + chartNode.id + "_xAxisLabel.chartCell span").text($("#" + chartNode.id + "_xAxisLabel.settingsInput").val());
   $("#" + chartNode.id + "_yAxisLabel.chartCell span").text($("#" + chartNode.id + "_yAxisLabel.settingsInput").val());
}

function toDegrees (angle) {
   return angle * (180 / Math.PI);
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function getBoxWidth(node){

}

function renderEpiCurve(renderNode) {

    var yOffset = 10;

    var nodeJson = JSON.parse(renderNode.children[0].innerHTML);
    var data = nodeJson.chart.data;

    var parseDate = d3.timeParse("%m/%d/%Y %H:%M:%S %p");
    var formatCount = d3.format(",.0f");

    var margin = {top: 10, right: 30, bottom: 30, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0);
    var y = d3.scaleLinear().rangeRound([height, 0]);

    $("#" + renderNode.id).append(
    '<table style="width:100%">' +
    '<tr>' +
        '<td class="chartCell"></td>' +
        '<td class="chartCell chartLabel" id="' + renderNode.id + '_title" class="graphTitle"><span></span></td>' +
        '<td class="chartCell" id="' + renderNode.id + '_settings"></td>' +
    '</tr>' +
    '<tr>' +
        '<td class="chartCell chartLabel graphYAxisLabel" id="' + renderNode.id + '_yAxisLabel"><span class="inner rotate"></span></td>' +
        '<td class="chartCell" id="' + renderNode.id + '_svgGraph" class="svgGraph"></td>' +
        '<td class="chartCell graphYAxisLabel" id="' + renderNode.id + '_legend" class="graphLegend"><span></span></td>' +
    '</tr>' +
    '<tr>' +
        '<td class="chartCell"></td>' +
        '<td class="chartCell chartLabel" id="' + renderNode.id + '_xAxisLabel" class="graphXAxisLabel"><span></span></td>' +
        '<td class="chartCell"></td>' +
    '</tr>' +
    '</table>');

    var svg = d3.select("#" + renderNode.id + "_svgGraph" ).append("svg")
        .attr("id", renderNode.id + "_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var g = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + yOffset + "," + 0 + ")")
        .call(d3.axisBottom(x));
        
    var xDates = data.map(function(d) { return parseDate(d.date); }); 
    xDates = data.map(function(d) { return d.date }); 
    x.domain(xDates);

    var yValues = d3.max(data, function(d) { return d.value; }); 
    y.domain([0, yValues]);

    var xAxis = g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ") ")
        .call(d3.axisBottom(x));

    var barPitch = x.bandwidth();

    try{
        var textNodes = xAxis.selectAll("text").nodes();
        var textHeight = textNodes[0].getBBox().height;
        var maxTextWidth = d3.max(textNodes, n => n.getBBox().width);
        var degreeRotation = 45;
        var overUnder = textHeight/barPitch;
        if(overUnder > 1.0) {
            overUnder = 1.0;
        }
        degreeRotation = 90 - toDegrees(Math.acos(overUnder));

        if(degreeRotation < 45){
            degreeRotation = 45;
        }else if(degreeRotation > 80){
            degreeRotation = 90;
        }
        var verticalComponentOfMaxTextAfterRotate = Math.abs(maxTextWidth * Math.sin(toRadians(degreeRotation)));

        var ratio = Math.cos(toRadians(degreeRotation));

        var xTextRotationOriginOffset = 2;
        var yTextRotationOriginOffset = 2 + 7 * (ratio);
    }
    catch{
    }

    if(maxTextWidth > x.bandwidth()){
        xAxis.selectAll("text")	
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("x", xTextRotationOriginOffset)
        .attr("y", yTextRotationOriginOffset)
        .attr("transform", function(d) {
            return "rotate(-" + degreeRotation + ")" 
        });
        var newHeight = $("#" + renderNode.id + "_svg").height() + verticalComponentOfMaxTextAfterRotate;
        $("#" + renderNode.id + "_svg").height(newHeight);
    }

    g.append("g")
        .attr("class", "axis axis--y")
        .attr("font-size", 14)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");

    svg.selectAll(".axis--y line")
        .attr("x2", 5000);

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.date) + yOffset; })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .style("stroke", "#000")
        .style("stroke-width", 2);

    applySettings(renderNode);    
}

function type(d) {
    d.date = parseDate(d.date);
    return d;
}
  
function okayClick(d){
    applySettings(d);
    toggleSettings(d);
}

function cancelClick(d){
    toggleSettings(d);
}

function toggleSettings(d){
    var settingsNode =$("#" + d.id + "_settings");
    var inputsNode = $(d).find(".inputs");
    var buttonsNode = $(d).find(".buttons");    
    var displayString = inputsNode.attr("style");

    if(displayString === "display: none;"||""){
        settingsNode.width("40%");
        settingsNode.height("fit-content");
        inputsNode.attr("style", "display: block;");
        buttonsNode.attr("style", "display: block;");
    }
    else{
        settingsNode.width("auto");
        settingsNode.height("auto");
        inputsNode.attr("style", "display: none;");
        buttonsNode.attr("style", "display: none;");
    }
}

function minimizeSettings(){
    var settingsDivs = document.querySelectorAll(".settings");
    settingsDivs.forEach(function(node){minimizeSetting(node);});
}

function minimizeSetting(settingNode){
}
