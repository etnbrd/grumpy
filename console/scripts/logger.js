var logElm = $('#log');

var templates = {
  logBlock: function (eltId) {
    return [
      "<div class='logBlock' id=" + eltId + ">",
      "<div/>"
    ].join('');
  },
  logRequest: function (id, url) {
    return [
      "<span class='logRequest'> req " + id + ' -- ' + url,
      "</span>"
    ].join('');
  },
  logLine: function (timestamp, msg, data) {
    return [
      "<div class='logLine' hidden='hidden'>",
      "<span class='timestamp'>" + timestamp + "</span>",
      "<div class='logMessage'>",
        "<span class='logMessageSource'>" + msg.s + "</span>",
        "<span> ⇾ </span>",
        "<span class='logMessageTarget'>" + msg.t + "</span>",
      "</div>",
      "<span class='logData'>" + data + "</span>",
      "</div>"
    ].join('');
  },

  code: function (langage, code) {
    return [
      "<pre>",
      "<code class='hljs'" + langage + "'>" + code + "</code>",
      "</pre>"
    ].join('');
  }

};

console.log('definition of logger', logger);

function logger (eltId) {

  function _timestamp() {
    var time = new Date();
    return time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "." + time.getMilliseconds();
  }

  function toggle() {
    var logBlocks, logLines, i;
    logBlocks = $('.logBlock').not(logBlock);

    logLines = logBlocks.find('.logLine');
    for (i = 0; i < logLines.length; i++)
      logLines[i].hidden = true;

    logLines = logBlock.find('.logLine');
    for (i = 0; i < logLines.length; i++)
      logLines[i].hidden = ((logLines[i].hidden === true) ? false : true);

    toggleState = (logLines[0].hidden === true) ? false : true;
    if (toggleState === true) {
      toggleClassPath(null, 'linkHidden', true);
      toggleClassNode(null, 'nodeHidden', true);
      toggleClassPath(getLinks(logBlock.find('.logMessage')), 'linkHidden', false);
      toggleClassNode(getNodes(logBlock.find('.logMessage')), 'nodeHidden', false);
    } else {
      toggleClassPath(null, 'linkHidden', false);
      toggleClassNode(null, 'nodeHidden', false);
    }
  }

  function toggleClassPath(links, className, activate) {
    if (links === null) {
      d3.selectAll('.link').classed(className, activate);
    } else {
      links.forEach(function (link) {
        d3.selectAll('.' + link.s + '-' + link.s).classed(className, activate);
        d3.selectAll('.' + link.t + '-' + link.t).classed(className, activate);
        d3.selectAll('.' + link.s + '-' + link.t).classed(className, activate);
      });
    }
  }

  function toggleClassNode(nodes, className, activate) {
    if (nodes === null) {
      d3.selectAll('.circle').classed(className, activate);
      d3.selectAll('.text').classed(className, activate);
    } else {
      nodes.forEach(function (node) {
        d3.selectAll('.' + node).classed(className, activate);
      });
    }
  }

  function getLinks(logMessages) {
    var links = [];
    logMessages.each(function () {
      links.push({
        s: $(this).find('.logMessageSource').html(),
        t: $(this).find('.logMessageTarget').html()
      });
    });
    return links;
  }

  function getNodes(logMessages) {
    var nodes = [];
    logMessages.each(function () {
      nodes.push($(this).find('.logMessageSource').html());
      nodes.push($(this).find('.logMessageTarget').html());
    });
    return nodes;
  }

  function logLineMouseOver () {
    toggleClassNode(getNodes(logMessages), 'nodeColored', true);
    toggleClassPath(getLinks(logMessages), 'linkColored', true);
  }

  function logLineMouseOut () {
    toggleClassNode(getNodes(logMessages), 'nodeColored', false);
    toggleClassPath(getLinks(logMessages), 'linkColored', false);
  }

  function logMessageMouseOver () {
    toggleClassPath(null, 'linkColored', false);
    toggleClassNode(null, 'nodeColored', false);
    toggleClassNode([this.innerHTML], 'nodeColored', true);
    toggleClassPath([{s:this.innerHTML, t:this.innerHTML}], 'linkColored', true);
  }

  var logBlock = $("#" + eltId);
  if (logBlock.length === 0) {
    logBlock = $(templates.logBlock(eltId));
    logElm.append(logBlock);

    var logRequest = $(templates.logRequest(eltId, Array.prototype.slice.call(arguments, 1, 2)));
    var toggleState = false;
    logRequest.click(toggle);
    logBlock.append(logRequest);
  }

  var hl = hljs.highlightAuto(JSON.stringify(arguments[2], undefined, 2));

  var logLine = $(templates.logLine(
    _timestamp(),
    { s:arguments[3], t:arguments[4]},
    templates.code(hl.language, hl.value)));

  var logMessages = logLine.find('.logMessage');
  var logMessageSource = logMessages.find('.logMessageSource');
  var logMessageTarget = logMessages.find('.logMessageTarget');

  logLine.hover(logLineMouseOver, logLineMouseOut);
  logMessageSource.hover(logMessageMouseOver, logLineMouseOver);
  logMessageTarget.hover(logMessageMouseOver, logLineMouseOver);

  logBlock.append(logLine);

  logElm.scrollTop = logElm.scrollHeight;
}
