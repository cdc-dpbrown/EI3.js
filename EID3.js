

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
    
    function renderSwitch(chartNodeList){
        chartNodeList.forEach(function(chartNode){
            var nodeData = JSON.parse(chartNode.children[0].innerHTML);
            switch (nodeData.chart.type){
                case "epicurve" :
                    renderEpiCurve(chartNode);
                    break;
                case "columnchart" :
                    renderEpiCurve(chartNode);
                    break;
            }
        });
    }

    function renderAnalysisPage(){
        var charts = document.querySelectorAll(".epiinfochart");
        renderSwitch(charts);
    }

    function toggleSettings(d){
        var inputs = d.parentNode.childNodes[3];
        if(inputs.style.display === "none"||""){
            d.parentNode.style.width = "40%";
            d.parentNode.style.height = "100%";
            inputs.style.display = "block";
        }
        else{
            d.parentNode.style.width = "auto";
            d.parentNode.style.height = "auto";
            inputs.style.display = "none";
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
