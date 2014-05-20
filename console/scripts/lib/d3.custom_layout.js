d3.layout.force_fluxion = function() {
  var force = {}, event = d3.dispatch("start", "tick", "end"), size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
  function repulse(node) {
    return function(quad, x1, _, x2) {
      if (quad.point !== node) {
        var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
        if (dw * dw / theta2 < dn) {
          if (dn < chargeDistance2) {
            var k = quad.charge / dn;
            node.px -= dx * k;
            node.py -= dy * k;
          }
          return true;
        }
        if (quad.point && dn && dn < chargeDistance2) {
          var k = quad.pointCharge / dn;
          node.px -= dx * k;
          node.py -= dy * k;
        }
      }
      return !quad.charge;
    };
  }
  function repulse_y(node) {
    return function(quad, x1, _, x2) {

      if (quad.point !== node && Math.floor(node.x) === Math.floor(quad.cx)) {
        var dy = quad.cy - node.y, dw = x2 - x1, dn = dy * dy;
        if (dw * dw / theta2 < dn) {
          if (dn < chargeDistance2) {
            var k = quad.charge / dn;
            node.py -= dy * k;
          }
          return true;
        }
        if (quad.point && dn && dn < chargeDistance2) {
          var k = quad.pointCharge / dn;
          node.py -= dy * k;
        }
      }
      return !quad.charge;
    };
  }
  force.tick = function() {
    if ((alpha *= .99) < .005) {
      event.end({
        type: "end",
        alpha: alpha = 0
      });
      return true;
    }
    var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
    // for (i = 0; i < m; ++i) {
    //   o = links[i];
    //   s = o.source;
    //   t = o.target;
    //   // x = t.x - s.x;
    //   y = t.y - s.y;
    //   if (l = /*x * x +*/ y * y) {
    //     l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
    //     // x *= l;
    //     y *= l;
    //     t.x -= x * (k = s.weight / (t.weight + s.weight));
    //     t.y -= y * k;
    //     s.x += x * (k = 1 - k);
    //     s.y += y * k;
    //   }
    // }

    if (k = alpha * gravity) {
      x = size[0] / 2;
      y = size[1] / 2;
      i = -1;
      if (k) while (++i < n) {
        o = nodes[i];
        o.x += (x - o.x) * k;
        o.y += (y - o.y) * k * o.nbLinks;
      }
    }
    if (charge) {
      d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
      i = -1;
      while (++i < n) {
        o = nodes[i];
        if (!(o.fixedx && o.fixedy)) {
          if (o.fixedx)
            q.visit(repulse_y(o));
          else
            q.visit(repulse(o));          
        }
      }
    }
    i = -1;
    while (++i < n) {
      o = nodes[i];
      if (o.fixedx && o.fixedy) {
        o.x = o.px;
        o.y = o.py;
      } else if (o.fixedx) {
        o.x = o.px;
        o.y -= (o.py - (o.py = o.y)) * friction;
      } else if (o.fixedy) {
        o.x -= (o.px - (o.px = o.x)) * friction;
        o.y = o.py;
      } else {
        o.x -= (o.px - (o.px = o.x)) * friction;
        o.y -= (o.py - (o.py = o.y)) * friction;
      }
    }
    event.tick({
      type: "tick",
      alpha: alpha
    });
  };
  force.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    return force;
  };
  force.links = function(x) {
    if (!arguments.length) return links;
    links = x;
    return force;
  };
  force.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return force;
  };
  force.linkDistance = function(x) {
    if (!arguments.length) return linkDistance;
    linkDistance = typeof x === "function" ? x : +x;
    return force;
  };
  force.distance = force.linkDistance;
  force.linkStrength = function(x) {
    if (!arguments.length) return linkStrength;
    linkStrength = typeof x === "function" ? x : +x;
    return force;
  };
  force.friction = function(x) {
    if (!arguments.length) return friction;
    friction = +x;
    return force;
  };
  force.charge = function(x) {
    if (!arguments.length) return charge;
    charge = typeof x === "function" ? x : +x;
    return force;
  };
  force.chargeDistance = function(x) {
    if (!arguments.length) return Math.sqrt(chargeDistance2);
    chargeDistance2 = x * x;
    return force;
  };
  force.gravity = function(x) {
    if (!arguments.length) return gravity;
    gravity = +x;
    return force;
  };
  force.theta = function(x) {
    if (!arguments.length) return Math.sqrt(theta2);
    theta2 = x * x;
    return force;
  };
  force.alpha = function(x) {
    if (!arguments.length) return alpha;
    x = +x;
    if (alpha) {
      if (x > 0) alpha = x; else alpha = 0;
    } else if (x > 0) {
      event.start({
        type: "start",
        alpha: alpha = x
      });
      d3.timer(force.tick);
    }
    return force;
  };
  force.start = function() {
    var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
    for (i = 0; i < n; ++i) {
      (o = nodes[i]).index = i;
      o.weight = 0;
    }
    for (i = 0; i < m; ++i) {
      o = links[i];
      if (typeof o.source == "number") o.source = nodes[o.source];
      if (typeof o.target == "number") o.target = nodes[o.target];
      ++o.source.weight;
      ++o.target.weight;
    }
    for (i = 0; i < n; ++i) {
      o = nodes[i];
      if (isNaN(o.x)) o.x = position("x", w);
      if (isNaN(o.y)) o.y = position("y", h);
      if (isNaN(o.px)) o.px = o.x;
      if (isNaN(o.py)) o.py = o.y;
    }
    distances = [];
    if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
    strengths = [];
    if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
    charges = [];
    if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
    function position(dimension, size) {
      if (!neighbors) {
        neighbors = new Array(n);
        for (j = 0; j < n; ++j) {
          neighbors[j] = [];
        }
        for (j = 0; j < m; ++j) {
          var o = links[j];
          neighbors[o.source.index].push(o.target);
          neighbors[o.target.index].push(o.source);
        }
      }
      var candidates = neighbors[i], j = -1, m = candidates.length, x;
      while (++j < m) if (!isNaN(x = candidates[j][dimension])) return x;
      return Math.random() * size;
    }
    return force.resume();
  };
  force.resume = function() {
    return force.alpha(.1);
  };
  force.stop = function() {
    return force.alpha(0);
  };
  force.drag = function() {
    if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
    if (!arguments.length) return drag;
    this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
  };
  function dragmove(d) {
    if (d.fixedx)
      d.py = d3.event.y;
    else
      d.px = d3.event.x, d.py = d3.event.y;
    force.resume();
  }
  return d3.rebind(force, event, "on");
};
function d3_identity(d) {
  return d;
}
function d3_layout_forceDragstart(d) {
  d.fixedx |= 2;
  d.fixedy |= 2;
}
function d3_layout_forceDragend(d) {
  d.fixedx &= ~6;
  d.fixedy &= ~6;
}
function d3_layout_forceMouseover(d) {
  d.fixedx |= 4;
  d.fixedy |= 4;
  d.px = d.x, d.py = d.y;
}
function d3_layout_forceMouseout(d) {
  d.fixedx &= ~4;
  d.fixedy &= ~4;
}
function d3_layout_forceAccumulate(quad, alpha, charges) {
  var cx = 0, cy = 0;
  quad.charge = 0;
  if (!quad.leaf) {
    var nodes = quad.nodes, n = nodes.length, i = -1, c;
    while (++i < n) {
      c = nodes[i];
      if (c == null) continue;
      d3_layout_forceAccumulate(c, alpha, charges);
      quad.charge += c.charge;
      cx += c.charge * c.cx;
      cy += c.charge * c.cy;
    }
  }
  if (quad.point) {
    if (!quad.leaf) {
      quad.point.x += Math.random() - .5;
      quad.point.y += Math.random() - .5;
    }
    var k = alpha * charges[quad.point.index];
    quad.charge += quad.pointCharge = k;
    cx += k * quad.point.x;
    cy += k * quad.point.y;
  }
  quad.cx = cx / quad.charge;
  quad.cy = cy / quad.charge;
}
var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
