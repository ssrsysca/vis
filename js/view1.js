var v1 = new view1();

function view1() {
    // View vars
    var width, height;

    width = height = (innerHeight - 100) / 2 * 0.9;

    var scale = 1;

    var color = d3.scale.category10();

    var svg = d3.select(".canvas");
    svg.attr("width", width).attr("height", height);
    var svgG = svg
        .append("g")
        .call(d3.behavior.zoom().scaleExtent([1, 16]).on("zoom", zoom))
        .append("g");
    svgG.append("rect")
        .attr("class", "overlay")
        .attr("x", -width)
        .attr("y", -height)
        .attr("width", width * 3)
        .attr("height", height * 3)
        .style("fill", "rgb(222,222,222)")
        .on("click", function () {
            for (var d = 0; d < selectedNodes.length; ++d) selectedNodes[d] = false;
            for (var d = 0; d < selectedData.length; ++d) selectedData[d] = false;
            deselectAll();
            v1Select();
        });
    var linksCanvas = svgG.append("g");
    var nodesCanvas = svgG.append("g");
    // end

    var edges = []; // edges[edgeId] = edge
    var nodes = []; // nodes[nodeId] = node
    var edgeSourceTable = []; // edgeSourceTable[sourceNodeId][targetNodeId] = edgeId
    var edgeTargetTable = []; // edgeTargetTable[targetNodeId][sourceNodeId] = edgeId
    var nodeTable = []; // nodeTable[nodeLabel] = nodeId

    var maxX = 0;
    var maxY = 0;
    var minX = 0;
    var minY = 0;
    var minTime = 0;
    var maxTime = minTime;
    var startTime = minTime;
    var endTime = minTime + 50;
    var lastStartTime = 0;
    var lastEndTime = 0;
    var transitions = 0;

    this.fresh = function () { };

    var currentEdges = [];
    var currentNodes = [];
    var currentEdgeSourceTable = [];
    var currentEdgeTargetTable = [];

    var length;
    var lines;
    var circles;

    var i;

    var xScale;
    var yScale;

    var data;

    var selectedNodes = [];
    var selectedData = [];
    this.selected = selectedData;

    function clickOnNode(d) {
        selectedNodes[d] = !selectedNodes[d];
        showSelectedNodes();
    }
    this.otherCall = choseAnData;

    function setSelectedData(data) {
        if (data.length === selectedData.length)
            for (var i = 0; i < data.length; ++i)
                selectedData[i] = data[i];
        showSelectedData();
    }

    function choseAnData(d) {
        if (typeof (d) === "object") {
            setSelectedData(d);
        }
        else {
            selectedData[d] = !selectedData[d];
            showSelectedData();

        }
    }

    function showSelectedData() {
        deselectAll();
        var nn;
        for (nn = 0; nn < selectedData.length; ++nn) {
            if (selectedData[nn]) break;
        }
        if (nn === selectedData.length) { 
            for (var i = 0; i < selectedNodes.length; ++i) selectedNodes[i] = false;
            return;
        }

        var nodesOfData = [];
        var edgesOfData = [];
        for (nn = 0; nn < selectedData.length; ++nn) {
            if (selectedData[nn]) {
                var sourceId = nodeTable[data[nn].SRCIP];
                var targetId = nodeTable[data[nn].DSTIP];
                nodesOfData.push(sourceId);
                nodesOfData.push(targetId);
                edgesOfData.push(edgeSourceTable[sourceId][targetId]);
            }
        }

        nodesOfData.unique();
        edgesOfData.unique();

        svgG.selectAll(".link")
            .filter(function (n) {
                for (var d = 0; d < edgesOfData.length; ++d) {
                    if (edgesOfData[d] === n) {
                        return false;
                    }
                }
                return true;
            })
            //.transition()
            //.duration(250)
            .attr("stroke-opacity", 0.1);

        svgG.selectAll(".node")
            .filter(function (n) {
                for (var d = 0; d < nodesOfData.length; ++d) {
                    if (n === nodesOfData[d]) return false;
                }
                return true;
            })
            //.transition()
            //.duration(250)
            .attr("stroke-opacity", 0.1)
            .attr("fill-opacity", 0.1);
    }

    function showSelectedNodes() {
        deselectAll();
        var nn;
        for (nn = 0; nn < selectedNodes.length; ++nn) {
            if (selectedNodes[nn]) break;
        }
        if (nn === selectedNodes.length) {
            for (var i = 0; i < selectedData.length; ++i) selectedData[i] = false;
            return;
        }

        svgG.selectAll(".link")
            .filter(function (n) {
                for (var d = 0; d < selectedNodes.length; ++d) {
                    if (selectedNodes[d]) {
                        if (currentEdgeSourceTable.hasOwnProperty(nodes[d].id)) {
                            var est = currentEdgeSourceTable[nodes[d].id];
                            for (i in est) if (est.hasOwnProperty(i)) if (est[i] === n) { selectedData[n] = true; return false; }
                        }
                        if (currentEdgeTargetTable.hasOwnProperty(nodes[d].id)) {
                            var ett = currentEdgeTargetTable[nodes[d].id];
                            for (i in ett) if (ett.hasOwnProperty(i)) if (ett[i] === n) { selectedData[n] = true; return false; }
                        }
                    }
                }

                return true;
            })
            //.transition()
            //.duration(250)
            .attr("stroke-opacity", 0.1);

        svgG.selectAll(".node")
            .filter(function (n) {
                for (var d = 0; d < selectedNodes.length; ++d) {
                    if (selectedNodes[d]) {
                        if (((n === d) ||
                            (currentEdgeSourceTable.hasOwnProperty(d) && currentEdgeSourceTable[d].hasOwnProperty(n)) ||
                            (currentEdgeTargetTable.hasOwnProperty(d) && currentEdgeTargetTable[d].hasOwnProperty(n)))) return false;
                    }
                }
                return true;
            })
            //.transition()
            //.duration(250)
            .attr("stroke-opacity", 0.1)
            .attr("fill-opacity", 0.1);
        v1Select();
    }
    this.show = showSelectedNodes;

    function deselectAll(d) {
        //for (var i = 0; i < selectedNodes.length; ++i) selectedNodes[i] = false;
        //for (var i = 0; i < selectedData.length; ++i) selectedData[i] = false;
        svgG.selectAll(".link")
            //.transition()
            //.duration(250)
            .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale);
        svgG.selectAll(".node")
            //.transition()
            //.duration(250)
            .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
            .attr("fill-opacity", 0.9 + 0.1 / 16 * scale);
        //v1Select();
    }
    this.deselect = deselectAll;
    function redrawNetwork(start, end) {
        transitions = 0;
        startTime = start;
        endTime = end;
        if (start !== lastStartTime || end !== lastEndTime) {
            var i = 0;
            length = data.length;
            while (i < length && data[i].STARTTIME < start)++i;
            currentNodes = [];
            currentEdges = [];
            currentEdgeSourceTable = [];
            currentEdgeTargetTable = [];
            for (; i < length && data[i].STARTTIME <= end; ++i) {
                currentEdges.push(edgeSourceTable[nodeTable[data[i].SRCIP]][nodeTable[data[i].DSTIP]]);
                currentNodes.push(nodeTable[data[i].SRCIP]);
                currentNodes.push(nodeTable[data[i].DSTIP]);
                var currentEdge = edges[edgeSourceTable[nodeTable[data[i].SRCIP]][nodeTable[data[i].DSTIP]]];
                if (currentEdgeSourceTable[currentEdge.source] == null)
                    currentEdgeSourceTable[currentEdge.source] = [];
                currentEdgeSourceTable[currentEdge.source][currentEdge.target] = currentEdge.id;

                if (currentEdgeTargetTable[currentEdge.target] == null)
                    currentEdgeTargetTable[currentEdge.target] = [];
                currentEdgeTargetTable[currentEdge.target][currentEdge.source] = currentEdge.id;
            }
        }
        var previousEdgesU = linksCanvas.selectAll(".link").data().unique();
        var currentEdgesU = currentEdges.unique();
        var stoodEdges = intersection(previousEdgesU, currentEdgesU);
        var deletedEdges = difference(previousEdgesU, currentEdgesU);
        var addedEdges = difference(currentEdgesU, previousEdgesU);
        var arrangeEdges = stoodEdges.concat(deletedEdges);
        var resultEdges = stoodEdges.concat(addedEdges);

        var previousNodesU = nodesCanvas.selectAll(".node").data().unique();
        var currentNodesU = currentNodes.unique();
        var stoodNodes = intersection(previousNodesU, currentNodesU);
        var deletedNodes = difference(previousNodesU, currentNodesU);
        var addedNodes = difference(currentNodesU, previousNodesU);
        var arrangeNodes = stoodNodes.concat(deletedNodes);
        var resultNodes = stoodNodes.concat(addedNodes);

        // First, arrange the data set in order to keep the static data in front of the array.
        // No transition, since this is a work around.
        lines = linksCanvas.selectAll(".link").data(arrangeEdges);
        lines
            .attr("class", "link")
            .attr("x1", function (d, i) { return xScale(nodes[edges[d].source].x); })
            .attr("y1", function (d, i) { return yScale(nodes[edges[d].source].y); })
            .attr("x2", function (d, i) { return xScale(nodes[edges[d].target].x); })
            .attr("y2", function (d, i) { return yScale(nodes[edges[d].target].y); })
            .attr("stroke-width", 1 / scale)
            .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
            .style("stroke", "rgb(0,0,0)");
        circles = nodesCanvas.selectAll(".node").data(arrangeNodes);
        circles
            .attr("class", "node")
            .attr("cx", function (d, i) { return xScale(nodes[d].x); })
            .attr("cy", function (d, i) { return yScale(nodes[d].y); })
            .attr("r", function (d, i) { return nodes[d].size / 2 / scale; })
            //.attr("r", 5 / scale)
            .attr("stroke-width", 1 / scale)
            .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
            .attr("fill-opacity", 0.9 + 0.1 / 16 * scale)
            .style("fill",
            function (d, i) {
                return color(nodes[d].attributes.type2);
            })
            .style("stroke", "rgb(0,0,0)")
            .on("click", clickOnNode)
            .select("title")
            .text(function (d) { return nodes[d].label; });
        sleep(10);
        // Delete data.
        if (deletedEdges.length === 0) {
            lines = linksCanvas.selectAll(".link").data(resultEdges);
            lines.enter()
                .append("line")
                .attr("class", "link")
                .attr("x1", function (d, i) { return xScale(nodes[edges[d].source].x); })
                .attr("y1", function (d, i) { return yScale(nodes[edges[d].source].y); })
                .attr("x2", function (d, i) { return xScale(nodes[edges[d].target].x); })
                .attr("y2", function (d, i) { return yScale(nodes[edges[d].target].y); })
                .attr("stroke-width", 5 / scale)
                .attr("stroke-opacity", 0)
                .style("stroke", "orange")
                .transition()
                .duration(250)
                .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
                .transition()
                .duration(250)
                .attr("stroke-width", 1 / scale)
                .style("stroke", "rgb(0,0,0)");
        }
        if (deletedNodes.length === 0) {
            circles = nodesCanvas.selectAll(".node").data(resultNodes);
            circles
                .enter()
                .append("circle")
                .attr("class", "node")
                .attr("cx", function (d, i) { return xScale(nodes[d].x); })
                .attr("cy", function (d, i) { return yScale(nodes[d].y); })
                .attr("r", function (d, i) { return nodes[d].size / 2 / scale; })
                //.attr("r", 5 / scale)
                .attr("stroke-width", 5 / scale)
                .style("stroke", "orange")
                .attr("stroke-opacity", 0)
                .attr("fill-opacity", 0)
                .style("fill",
                function (d, i) {
                    return color(nodes[d].attributes.type2);
                })
                .transition()
                .duration(250)
                .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
                .attr("fill-opacity", 0.9 + 0.1 / 16 * scale)
                .transition()
                .duration(250)
                .attr("stroke-width", 1 / scale)
                .style("stroke", "rgb(0,0,0)");
            circles
                .on("click", clickOnNode)
                .append("title")
                .text(function (d) { return nodes[d].label; });
        }
        lines = linksCanvas.selectAll(".link").data(stoodEdges);
        lines.exit()
            .transition()
            .duration(250)
            .attr("stroke-width", 5 / scale)
            .style("stroke", "steelblue")
            .transition()
            .duration(250)
            .attr("stroke-opacity", 0)
            .remove()
            .each("start",
            function () {
                transitions++;
            })
            .each("end",
            function () {
                if (--transitions === 0) {
                    // Add data.
                    lines = linksCanvas.selectAll(".link").data(resultEdges);
                    lines.enter()
                        .append("line")
                        .attr("class", "link")
                        .attr("x1", function (d, i) { return xScale(nodes[edges[d].source].x); })
                        .attr("y1", function (d, i) { return yScale(nodes[edges[d].source].y); })
                        .attr("x2", function (d, i) { return xScale(nodes[edges[d].target].x); })
                        .attr("y2", function (d, i) { return yScale(nodes[edges[d].target].y); })
                        .attr("stroke-width", 5 / scale)
                        .attr("stroke-opacity", 0)
                        .style("stroke", "orange")
                        .transition()
                        .duration(250)
                        .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
                        .transition()
                        .duration(250)
                        .attr("stroke-width", 1 / scale)
                        .style("stroke", "rgb(0,0,0)");
                    circles = nodesCanvas.selectAll(".node").data(resultNodes);
                    circles
                        .enter()
                        .append("circle")
                        .attr("class", "node")
                        .attr("cx", function (d, i) { return xScale(nodes[d].x); })
                        .attr("cy", function (d, i) { return yScale(nodes[d].y); })
                        .attr("r", function (d, i) { return nodes[d].size / 2 / scale; })
                        //.attr("r", 5 / scale)
                        .attr("stroke-width", 5 / scale)
                        .style("stroke", "orange")
                        .attr("stroke-opacity", 0)
                        .attr("fill-opacity", 0)
                        .style("fill",
                        function (d, i) {
                            return color(nodes[d].attributes.type2);
                        })
                        .transition()
                        .duration(250)
                        .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
                        .attr("fill-opacity", 0.9 + 0.1 / 16 * scale)
                        .transition()
                        .duration(250)
                        .attr("stroke-width", 1 / scale)
                        .style("stroke", "rgb(0,0,0)");
                    circles
                        .on("click", clickOnNode)
                        .append("title")
                        .text(function (d) { return nodes[d].label; });

                }
            });
        circles = nodesCanvas.selectAll(".node").data(stoodNodes);
        circles.exit()
            .transition()
            .duration(250)
            .attr("stroke-width", 5 / scale)
            .style("stroke", "steelblue")
            .transition()
            .duration(250)
            .attr("stroke-opacity", 0)
            .attr("fill-opacity", 0)
            .remove()
            .each("start",
            function () {
                transitions++;
            })
            .each("end",
            function () {
                if (--transitions === 0) {
                    // Add data.
                    lines = linksCanvas.selectAll(".link").data(resultEdges);
                    lines.enter()
                        .append("line")
                        .attr("class", "link")
                        .attr("x1", function (d, i) { return xScale(nodes[edges[d].source].x); })
                        .attr("y1", function (d, i) { return yScale(nodes[edges[d].source].y); })
                        .attr("x2", function (d, i) { return xScale(nodes[edges[d].target].x); })
                        .attr("y2", function (d, i) { return yScale(nodes[edges[d].target].y); })
                        .attr("stroke-width", 5 / scale)
                        .attr("stroke-opacity", 0)
                        .style("stroke", "orange")
                        .transition()
                        .duration(250)
                        .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
                        .transition()
                        .duration(250)
                        .attr("stroke-width", 1 / scale)
                        .style("stroke", "rgb(0,0,0)");
                    circles = nodesCanvas.selectAll(".node").data(resultNodes);
                    circles
                        .enter()
                        .append("circle")
                        .attr("class", "node")
                        .attr("cx", function (d, i) { return xScale(nodes[d].x); })
                        .attr("cy", function (d, i) { return yScale(nodes[d].y); })
                        .attr("r", function (d, i) { return nodes[d].size / 2 / scale; })
                        //.attr("r", 5 / scale)
                        .attr("stroke-width", 5 / scale)
                        .style("stroke", "orange")
                        .attr("stroke-opacity", 0)
                        .attr("fill-opacity", 0)
                        .style("fill",
                        function (d, i) {
                            return color(nodes[d].attributes.type2);
                        })
                        .transition()
                        .duration(250)
                        .attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
                        .attr("fill-opacity", 0.9 + 0.1 / 16 * scale)
                        .transition()
                        .duration(250)
                        .attr("stroke-width", 1 / scale)
                        .style("stroke", "rgb(0,0,0)");
                    circles
                        .on("click", clickOnNode)
                        .append("title")
                        .text(function (d) { return nodes[d].label; });
                }
            });


        lastStartTime = start;
        lastEndTime = end;

    }
    this.fresh = redrawNetwork;
    function zoom() {
        svgG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        scale = d3.event.scale;

        nodesCanvas.selectAll(".node")
            .attr("r", function (d, i) { return nodes[d].size / 2 / d3.event.scale; })
            //.attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
            //.attr("fill-opacity", 0.9 + 0.1 / 16 * scale)
            .attr("stroke-width", 1 / d3.event.scale);

        linksCanvas.selectAll(".link")
            //.attr("stroke-opacity", 0.9 + 0.1 / 16 * scale)
            .attr("stroke-width", 1 / d3.event.scale);


    }

    d3.json("data/network.json",
        function (error, graph) {
            if (error) throw error;
            var i;
            length = graph.edges.length;
            for (i = 0; i < length; ++i) {
                var edge = graph.edges[i];
                edge.id = parseInt(edge.id);
                edge.source = parseInt(edge.source);
                edge.target = parseInt(edge.target);
                edges[edge.id] = edge;

                if (edgeSourceTable[edge.source] == null)
                    edgeSourceTable[edge.source] = [];
                edgeSourceTable[edge.source][edge.target] = edge.id;

                if (edgeTargetTable[edge.target] == null)
                    edgeTargetTable[edge.target] = [];
                edgeTargetTable[edge.target][edge.source] = edge.id;
            }
            length = graph.nodes.length;
            for (i = 0; i < length; ++i) {
                var node = graph.nodes[i];
                node.id = parseInt(node.id);
                node.attributes.type2 = parseInt(node.attributes.type2);
                nodes[node.id] = node;
                nodeTable[node.label] = node.id;
                if (node.x < minX) minX = node.x;
                if (node.x > maxX) maxX = node.x;
                if (node.y < minY) minY = node.y;
                if (node.y > maxY) maxY = node.y;
                selectedNodes[node.id] = false;
            }

            xScale = d3.scale.linear()
                .domain([minX, maxX])
                .range([0, width]);
            yScale = d3.scale.linear()
                .domain([minY, maxY])
                .range([0, height]);

            d3.csv("data/data.csv",
                function (error1, Data) {
                    if (error1) throw error1;
                    data = Data;
                    var i = 0;
                    length = Data.length;
                    minTime = parseInt(Data[0].RECEIVETIME);
                    for (i = 0; i < length; ++i) {
                        Data[i].ID = parseInt(Data[i].ID);
                        Data[i].STARTTIME = parseInt(Data[i]
                            .RECEIVETIME); //Date.parse(new Date(data[i].STARTTIME)) / 1000;
                        if (Data[i].STARTTIME > maxTime) maxTime = Data[i].STARTTIME;
                        if (Data[i].STARTTIME < minTime) minTime = Data[i].STARTTIME;
                        selectedData[i] = false;
                    }
                    startTime = minTime;
                    endTime = (maxTime - minTime) / 10 + minTime;
                    lastEndTime = endTime;

                    slider.SetTime(minTime, maxTime, startTime, endTime);
                });

        });
}