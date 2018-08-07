var imported = document.createElement('script');
imported.src = 'https://code.jquery.com/jquery-1.11.3.js';
document.head.appendChild(imported);

function renderAnalysisPage(){
    var charts = document.querySelectorAll(".epiinfochart");
    renderSwitch(charts);
}

function renderSwitch(chartNodeList){
    chartNodeList.forEach(function(chartNode){
        var chartJson = JSON.parse(chartNode.children[0].innerHTML);
        switch (chartJson.chart.type){
            case "epicurve" :
                renderEpiCurve(chartNode);
                break;
            case "columnchart" :
                renderEpiCurve(chartNode);
                break;
        }
        AddSettings(chartNode);
    });
}

function AddSettings(renderNode){
    var nodeJson = JSON.parse(renderNode.children[0].innerHTML);
    var settings = nodeJson.chart.settings;

    var chartNode = $("#" + renderNode.id);
    chartNode.append('<div class="settings"></div>');
    
    var settingsNode = $("#" + renderNode.id).find(".settings");
    settingsNode.append('<div class="settingsClickDiv" onclick="toggleSettings(this)"><a><strong>&nbsp;...&nbsp;</strong></a></div>');
    settingsNode.append('<div id="' + renderNode.id + '_inputs" class="inputs" style="display: none;"></div>');

    var inputNode = $("#" + renderNode.id).find(".settings").find(".inputs");

    if (typeof settings != 'undefined'){
        settings.forEach(function(attribute){
            inputNode.append('<div class="settingsInputBlock"><div class="settingsInputLabel">' + attribute.prompt + '</div><input type="text" class="settingsInput" name="' + attribute.name + '" value="' + attribute.value + '" ></div></div>');
        });
    }

    settingsNode.append('<div id="' + renderNode.id + '_buttons" class="buttons" style="display: none;"><button class="card__button">OK</button><button class="card__button">CANCEL</button></div>');
}


    function renderEpiCurve(renderNode) {
    
    var nodeJson = JSON.parse(renderNode.children[0].innerHTML);
    var data = nodeJson.chart.data;

    var parseDate = d3.timeParse("%m/%d/%Y %H:%M:%S %p");
    var formatCount = d3.format(",.0f");

    var margin = {top: 10, right: 30, bottom: 30, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0);
    var y = d3.scaleLinear().rangeRound([height, 0]);

    var svg = d3.select("#" + renderNode.id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var g = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 0 + ")")
        .call(d3.axisBottom(x));
        
    var xDates = data.map(function(d) { return parseDate(d.date); }); 
    xDates = data.map(function(d) { return d.date }); 
    x.domain(xDates);

    var yValues = d3.max(data, function(d) { return d.value; }); 
    y.domain([0, yValues]);
    
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

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

    svg.selectAll("line").attr("x2", 5000); 

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.date) + 10; })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .style("stroke", "#000")
        .style("stroke-width", 2);;
    }

    function type(d) {
        d.date = parseDate(d.date);
        return d;
    }
    

function toggleSettings(d){
    var settingsNode = $(d.parentNode);
    var inputsNode = $(d.parentNode).find(".inputs");
    var buttonsNode = $(d.parentNode).find(".buttons");    
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
    // var settingsDivs = document.querySelectorAll(".settings");
    // settingsDivs.forEach(function(node){minimizeSetting(node);});
}
function minimizeSetting(settingNode){
    settingNode.style.width = "auto";
    settingNode.style.height = "auto";

    var inputs = settingNode.childNodes[3];
    inputs.style.display = "none";
}
