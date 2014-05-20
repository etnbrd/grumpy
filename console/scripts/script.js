$(function(){

  var socket = io.connect('http://localhost:8080');

  var width = $('#graph-container').width() - 10
    , height = $('#graph-container').height() - 10
    , nodes = {}
    , links = []
    , r = 7
    , rHover = 10
    , linkMinStrokeWidth = 0.5
    , nodeTextOffset_x = 4
    , linkDistanceFluxion = 20
    , linkDistanceScp = 30;

  function routerFactory (route, fn) {
    socket.on(route, function (data) {
      fn(JSON.parse(data));
    });
  }

  routerFactory('register', _register);
  routerFactory('post', _post);
  routerFactory('init', _init);

  function _register(msg) {
    if (!(nodes[msg.name])) {
      var fixedy = (msg.name == 'output') ? true : false;
      var x = {
        'post': width/4,
        'follow': width/4,
        'read': width/4,
        'register': width/4,
        'filter': width/2,
        'followers': width/4,
        'output': width-50
      };
      var y = {
        'output': height/2
      };
      // Fluxions nodes
      nodes[msg.name] = {name: msg.name, type: 'fluxion', nbLinks: 1, data: msg.fn, fixedx: true, fixedy: fixedy, x: x[msg.name] || width/1.5, y: y[msg.name] };
      // Scope nodes
      for (var p in msg.scp) {
        nodes[p+msg.name] = {name: msg.name, type: 'scp', nbLinks: 1, fixedx: true, x: nodes[msg.name].x - 70, data: JSON.stringify(msg.scp[p], undefined, 2)};
        links.push({source: nodes[msg.name], target: nodes[p+msg.name], weight: 1});
      }
      update();
    }
  }

  function _post(msg) {
    log(msg.id, msg.url, msg.data, msg.s, msg.t);

    // Update scope
    for (var p in msg.scp)
      nodes[p+msg.t].data = JSON.stringify(msg.scp[p], undefined, 2);

    // Check if link already exists
    var found = false;
    links.forEach(function (link, index) {
      if (link.source == nodes[msg.s] && link.target == nodes[msg.t]) {
        link.weight++;
        nodes[msg.s].nbLinks++;
        nodes[msg.t].nbLinks++;
        found = true;
        return;
      }
    });
    if (found === false)
      links.push({source: nodes[msg.s], target: nodes[msg.t], weight: 1});

    update();
  }

  function _init(msg) {
    log('init', '', '', 'initialization');

    nodes['input'] = {name: 'input', type: 'fluxion', nbLinks: 0, data: '', fixedx: true, fixedy: true, x: 50, y: height/2};
    update();

    for (var i = 0; i < msg.nodes.length; i++)
      _register(msg.nodes[i]);

    for (var j = 0; j < msg.messages.length; j++)
      _post(msg.messages[j]);
  }

  d3.helper.utils = (function () {
    return {
      nodeRadius : function (d) { return (Math.log(d.nbLinks + 1) + r) + 'px'; },
      nodeRadiusHover : function (d) { return (Math.log(d.nbLinks + 1) + rHover) + 'px'; },
      nodeText_x : function (d) { return (Math.log(d.nbLinks + 1) + r + nodeTextOffset_x) + 'px'; },
      nodeTextHover_x : function (d) { return (Math.log(d.nbLinks + 1) + rHover + nodeTextOffset_x) + 'px'; },
      linkStrokeWidth : function (d) { return (Math.log(d.weight) + linkMinStrokeWidth) + "px"; },
      linkDistance : function (d) { return (d.source.type == 'fluxion' && d.target.type == 'fluxion') ? linkDistanceFluxion : linkDistanceScp; },
      // chargeDistance : function (d) { return -500; }, //-(d.weight * 1000); }
      chargeDistance : function (d) { return -(d.nbLinks * 100); }
    };
  }());

  var force = d3.layout.force_fluxion()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      //.linkDistance(1)
      //.linkStrength(2)
      .charge(d3.helper.utils.chargeDistance)
      .chargeDistance(500)
      .friction(0.8)
      //.theta(20)
      .gravity(0.1)
      .on('tick', tick)
      .start();

  var svg = d3.select('#graph-container').append('svg')
      .attr('width', width)
      .attr('height', height);

  // Per-type markers, as they don't inherit styles.
  //  svg.append('defs').selectAll('marker')
  //      .data(['link'])
  //    .enter().append('marker')
  //      .attr('id', function(d) { return d; })
  //      .attr('viewBox', '0 -5 10 10')
  //      .attr('refX', 15)
  //      .attr('refY', 0)
  //      .attr('markerWidth', 5)
  //      .attr('markerHeight', 5)
  //      .attr('orient', 'auto')
  //    .append('path')
  //      .attr('d', 'M0,-5L10,0L0,5');

  var link = svg.selectAll('.link')
                  .data(force.links())
                .enter().append('path')
                  .attr('class', 'link');
                  //.attr('marker-end', 'link');

  var node = svg.selectAll('.node')
                  .data(force.nodes())
                .enter().append('g')
                  .attr('class', 'node')
                  .call(force.drag)
                  .call(d3.helper.tooltip().text(function (d) { return d.data; }));

  node.append('circle')
      .attr('r', d3.helper.utils.nodeRadius);

  node.append('text')
      .attr('x', 14)
      .attr('y', 0)
      .text(function(d) { return d.name; });

  function tick () {
    link.attr('d', linkArc);
    svg.selectAll('g').attr('transform', transform);
  }

  function linkArc(d) {
    h = -30;
    if (d.source.name == 'input' && d.target.name == 'output')
      return 'M' + d.source.x  + ',' + d.source.y + 'C' + d.source.x + ',' + h + ' ' + d.target.x + ',' + h + ' ' + d.target.x + ',' + d.target.y ;
    else
      return 'M' + d.source.x + ',' + d.source.y + 'A' + 0 + ',' + 0 + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
  }
  
  function transform(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  }

  function update() {
    link = svg.selectAll('.link').data(force.links());
    // Update entries
    link.style("stroke-width", d3.helper.utils.linkStrokeWidth);
    // Add new entries
    link.enter().insert('path', 'g.node')
                .attr('class', function (d) { return 'link ' + d.source.name + '-' + d.target.name; }); //.attr("marker-end", function(d) { return "url(#link)"; });
    link.exit().remove();

    force.nodes(d3.values(nodes));
    node = svg.selectAll('.node').data(force.nodes());
    // Update entries
    node.select('circle').attr('r', d3.helper.utils.nodeRadius);
    node.select('text').attr('x', d3.helper.utils.nodeText_x);
    // Add new entries
    nodeEnter = node.enter().append('g')
                            .attr('class', 'node')
                            .call(force.drag)
                            .call(d3.helper.tooltip().text(function (d) { return d.data; }));
    nodeEnter.append('circle')
             .attr('class', function (d) { return 'circle ' + d.type + ' ' + d.name; })
             .attr('r', d3.helper.utils.nodeRadius);
    nodeEnter.append('text')
             .attr('class', function (d) { return 'text ' + d.name; })
             .attr('x', d3.helper.utils.nodeText_x)
             .attr('y', 0)
             .text(function(d) { return d.name; });
    node.exit().remove();

    force.start();
  }

});
