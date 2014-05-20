d3.helper = {};

d3.helper.tooltip = function(){
    var tooltipDiv;
    var bodyNode = d3.select('body').node();    
    var attrs = [];
    var text = "";
    var styles = [];

    function tooltip(selection) {

        selection.on("mouseover", function (d, i) {
            var name, value;
            d3.select(this).select('circle').transition().duration(300).attr('r', d3.helper.utils.nodeRadiusHover);
            d3.select(this).select('text').transition().duration(300).attr('x', d3.helper.utils.nodeTextHover_x);
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body').append('div');
            for (i in attrs) {
                name = attrs[i][0];
                if (typeof attrs[i][1] === "function") {
                    value = attrs[i][1](d, i);
                } else value = attrs[i][1];
                if (name === "class") value += " tooltip";
                tooltipDiv.attr(name, value);
            }
            for (i in styles) {
                name = styles[i][0];
                if (typeof attrs[i][1] === "function") {
                    value = styles[i][1](d, i);
                } else value = styles[i][1];
                tooltipDiv.style(name, value);
            }

            tooltipDiv.style('position', 'absolute')
                      .style('z-index', 1001);

            // Add text using the accessor function
            var tooltipText = '';
            if (typeof text === "function") tooltipText = text(d, i);
            else if (typeof text != "undefined" || typeof text !== null) tooltipText = text;
            // Crop text arbitrarily
            var hl = hljs.highlightAuto(tooltipText);
            tooltipDiv.html('<pre><code class=" hljs ' + hl.language + '">' + hl.value + '</code></pre>');
            tooltip.setPosition(tooltipDiv);
        })
        .on('mousemove', function(d, i) {
            tooltip.setPosition(tooltipDiv);
        })
        .on("mouseout", function(d, i){
            tooltipDiv.remove();
            d3.select(this).select('circle').transition().duration(300).attr('r', d3.helper.utils.nodeRadius);
            d3.select(this).select('text').transition().duration(300).attr('x', d3.helper.utils.nodeText_x);
        });

    }

    tooltip.setPosition = function (tooltipDiv) {
        var absoluteMousePos = d3.mouse(bodyNode);
        var height = $(window).height();
        var width = $(window).width();
        var tooltipWidth = parseInt(tooltipDiv.style('width'));
        var tooltipHeight = parseInt(tooltipDiv.style('height'));
        var tooltipTop = parseInt(tooltipDiv.style('top'));
        var left = (absoluteMousePos[0] + 10) + tooltipWidth > width ? (absoluteMousePos[0] - 20 - tooltipWidth) : (absoluteMousePos[0] + 10);
        var k = absoluteMousePos[1] + 5 + tooltipHeight - height;
        var top = k > 0 ? absoluteMousePos[1] + 5 - k : absoluteMousePos[1] + 5;
        tooltipDiv.style('left', left + 'px')
                  .style('top', top + 'px');
    };

    tooltip.attr = function(name, value) {
        attrs.push(arguments);
        return this;
    };

    tooltip.text = function(value) {
        text = value;
        return this;
    };

    tooltip.style = function(name, value) {
        styles.push(arguments);
        return this;
    };

    return tooltip;
};
