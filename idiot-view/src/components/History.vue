<template>
  <div class="history">
    {{sensesWrite ? sensesWrite.length: "??"}}
    {{test}}
    <div id="graph"></div>
    <button @click="(from.number = 1), (from.type = 'hours')">
      Час
    </button>
    <button @click="(from.number = 2), (from.type = 'hours')">Два часа</button>
    <button @click="(from.number = 1), (from.type = 'days')">
      Ден
    </button>
    <button @click="(from.number = 2), (from.type = 'days')">
      Два дни
    </button>
    <button @click="(from.number = 7), (from.type = 'days')">
      Седмица
    </button>
    <input v-model="from.number" />
    <select v-model="from.type">
      <option v-for="dateType in dateTypes" v-bind:value="dateType" v-t="dateType"> </option>
    </select>
    <input v-model="to.number" />
    <select v-model="to.type">
      <option v-for="dateType in dateTypes" v-bind:value="dateType" v-t="dateType"> </option>
    </select>
  </div>
</template>

<script>
import moment from "moment";
import * as d3 from "d3";

function initialize() {
  const vue = this;
  this.margin = { top: 20, right: 80, bottom: 30, left: 80 };
  this.width = 960 - this.margin.left - this.margin.right;
  (this.height = 500 - this.margin.top - this.margin.bottom),
    (this.writes_height = 50),
    (this.senses_height = this.height - this.writes_height);
  this.green = "#4CAF50";

  this.timeformat = d3.timeFormat("%H:%M");

  this.x = d3.scaleTime().range([0, this.width]);
  this.numbers_y = d3.scaleLinear().range([this.senses_height / 2, 0]);
  this.percents_y = d3
    .scaleLinear()
    .range([this.senses_height, this.senses_height / 2 + 10]);
  this.writes_y = d3.scaleBand().range([this.height, this.senses_height + 10]);

  this.numbers_line = d3
    .line()
    .curve(d3.curveBasis)
    .x(function(d) {
      return vue.x(d.date);
    })
    .y(function(d) {
      return vue.numbers_y(d.value);
    });

  this.percents_line = d3
    .line()
    .curve(d3.curveBasis)
    .x(function(d) {
      return vue.x(d.date);
    })
    .y(function(d) {
      return vue.percents_y(d.value);
    });

  this.writes_area = d3
    .area()
    .x(function(d) {
      return vue.x(d.date);
    })
    .y1(function(d) {
      return vue.writes_y(d.id);
    }) // TODO map d.id to writes_y range somehow
    .y0(function(d) {
      return vue.writes_y(d.id) + vue.writes_y.bandwidth();
    })
    .defined(function(d) {
      return d.value && d.value !== 0;
    });
}

function senses_line(id) {
  if (this.getConfig(id).type === "percent") {
    return this.percents_line;
  }

  return this.numbers_line;
}

function senses_y(id) {
  if (this.getConfig(id).type === "percent") {
    return this.percents_y;
  }

  return this.numbers_y;
}

function getAlias(sense_id) {
  var config = this.getConfig(sense_id);
  var alias = config.alias;
  if (alias) return alias;
  else return sense_id;
}

function getColor(sense_id) {
  return this.getConfig(sense_id).color;
}

function addHorizontalGrid(g, y, c) {
  g.selectAll("line.grid.horizontal." + c)
    .data(y.ticks(4))
    .enter()
    .append("line")
    .attr("class", "grid horizontal")
    .attr("x1", 4)
    .attr("x2", this.width)
    .attr("y1", function(d) {
      return y(d);
    })
    .attr("y2", function(d) {
      return y(d);
    })
    .attr("shape-rendering", "crispEdges");
}

function addVerticalGrid(g, x) {
  g.selectAll("line.grid.vertical")
    .data(x.ticks(4))
    .enter()
    .append("line")
    .attr("class", "grid vertical")
    .attr("x1", function(d) {
      return x(d);
    })
    .attr("x2", function(d) {
      return x(d);
    })
    .attr("y1", 0)
    .attr("y2", this.height)
    .attr("shape-rendering", "crispEdges");
}

function getConfig(id) {
  var config = this.config[id];

  if (!config) {
    config = {
      type: "number",
      graph: true,
      alias: id,
      color: id
    };
  }

  if (id === "time" || id === "vcc") {
    config.graph = false;
  }

  return config;
}

function redraw() {
  if (!this.sensesWrite) {
    return;
  }
  console.log('redraw');
  const vue = this;

  var senseColumns = [];
  var writeColumns = [];
  var data = this.sensesWrite.map(function(row) {
    var senses = row.senses;
    var write = row.write;
    if (senses) {
      senseColumns = senseColumns.concat(Object.keys(senses));
    }
    if (write) {
      writeColumns = writeColumns.concat(Object.keys(write));
    }
    if (senses || write) {
      return {
        date: moment.utc(row.timestamp),
        senses: senses,
        write: write
      };
    }
  });

  data = data.filter(d => d);

  senseColumns = Array.from(new Set(senseColumns));

  const visible_sense_columns = senseColumns.filter(function(d) {
    return vue.getConfig(d).graph;
  });

  var senses = visible_sense_columns.map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {
          date: d.date,
          value: id === "time" ? d.senses[id] : parseValue(d.senses[id])
        };
      })
    };
  });
  var numbers = senses.filter(function(d) {
    return vue.getConfig(d.id).type !== "percent";
  });

  writeColumns = Array.from(new Set(writeColumns));
  const visible_write_columns = writeColumns.filter(function(d) {
    return vue.getConfig(d).graph;
  });
  var writes = visible_write_columns.map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return { date: d.date, value: d.write ? d.write[id] : null, id: id };
      })
    };
  });
  this.x.domain(
    d3.extent(data, function(d) {
      return d.date;
    })
  );

  this.numbers_y.domain([
    d3.min(numbers, function(c) {
      return d3.min(c.values, function(d) {
        return d.value;
      });
    }),
    d3.max(numbers, function(c) {
      return d3.max(c.values, function(d) {
        return d.value;
      });
    })
  ]);

  this.percents_y.domain([0, 100]);

  vue.writes_y.domain(
    writeColumns.map(function(d) {
      return d;
    })
  );

  var dict = { senses: senses, writes: writes };
  var svg = d3
    .select("#graph")
    .selectAll("svg")
    .data([dict]);

  var svgEnter = svg.enter().append("svg");

  var gEnter = svgEnter
    .append("g")
    .attr(
      "transform",
      "translate(" + this.margin.left + "," + this.margin.top + ")"
    );

  svgEnter
    .merge(svg)
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom);

  //  svgEnter.append("text")
  //    .attr("class", "count")
  //    .attr("transform", "translate("
  //      + margin.left + "," + margin.top + ")")
  //    .style("font", "10px sans-serif");
  //
  //  svgEnter.merge(svg).select("text.count")
  //    .text("#" + senses[0].values.length)

  gEnter
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + this.height + ")");

  gEnter.append("g").attr("class", "axis axis-numbers-y");

  gEnter.append("g").attr("class", "axis axis-percents-y");

  gEnter.append("g").attr("class", "axis axis-writes-y");

  var g = svgEnter.merge(svg).select("g");
  g.select("g.axis.axis--x")
    .transition()
    .call(d3.axisBottom(this.x));
  g.select("g.axis.axis-numbers-y")
    .transition()
    .call(d3.axisLeft(this.numbers_y));
  g.select("g.axis.axis-percents-y")
    .transition()
    .call(d3.axisLeft(this.percents_y));
  g.select("g.axis.axis-writes-y")
    .transition()
    .call(d3.axisLeft(vue.writes_y).tickFormat(vue.getAlias));

  // source https://stackoverflow.com/a/17871021

  this.addHorizontalGrid(g, this.numbers_y, "numbers");
  this.addHorizontalGrid(g, this.percents_y, "percents");
  this.addVerticalGrid(g, this.x);

  var sense = g.selectAll(".sense").data(
    function(d) {
      return d["senses"];
    },
    function(d) {
      return d.id;
    }
  );

  var senseEnter = sense
    .enter()
    .append("g")
    .attr("class", "sense");

  senseEnter.append("path").attr("class", "line");

  senseEnter
    .append("text")
    .attr("x", 3)
    .attr("dy", "0.35em")
    .style("font", "10px sans-serif");

  senseEnter
    .merge(sense)
    .select("path.line")
    .style("stroke", function(d) {
      return vue.getColor(d.id);
    })
    .transition()
    .attr("d", function(d) {
      return vue.senses_line(d.id)(d.values);
    });

  senseEnter
    .merge(sense)
    .select("text")
    .datum(function(d) {
      return { id: d.id, value: d.values[d.values.length - 1] };
    })
    .attr("transform", function(d) {
      return (
        "translate(" +
        vue.x(d.value.date) +
        "," +
        vue.senses_y(d.id)(d.value.value) +
        ")"
      );
    })
    .text(function(d) {
      return vue.getAlias(d.id);
    });

  sense.exit().remove();

  var write = g.selectAll(".write").data(
    function(d) {
      return d.writes;
    },
    function(d) {
      return d.id;
    }
  );

  var writeEnter = write
    .enter()
    .append("g")
    .attr("class", "write");

  writeEnter.append("path").attr("class", "area");

  writeEnter
    .merge(write)
    .select("path.area")
    .style("fill", function(d) {
      return vue.getColor(d.id);
    })
    .transition()
    .attr("d", function(d) {
      return vue.writes_area(d.values);
    });

  write.exit().remove();

  d3.select(".loading").classed("hidden", true);

  var mouseG = svgEnter
    .append("g")
    .attr("class", "mouse-over-effects")
    .attr(
      "transform",
      "translate(" + this.margin.left + "," + this.margin.top + ")"
    );

  mouseG
    .append("path") // black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", this.green)
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mouseG
    .append("text")
    .attr("class", "x-text")
    .style("text-anchor", "middle")
    .style("fill", this.green)
    .style("opacity", "0");

  var lines = document.getElementsByClassName("line"); // TODO use d3 selector
  var mousePerLineEnter = mouseG
    .selectAll(".mouse-per-line")
    .data(function(d) {
      return d.senses;
    })
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

  mousePerLineEnter
    .append("circle")
    .attr("r", 7)
    .style("stroke", this.green)
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mousePerLineEnter
    .append("text")
    .attr("fill", this.green)
    .attr("transform", "translate(10,-10)");

  mouseG
    .append("svg:rect") // append a rect to catch mouse movements on canvas
    .attr("class", "unselectable")
    .attr("width", this.width)
    .attr("height", this.height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseout", function() {
      // hide line, circles and text
      d3.select(".mouse-line").style("opacity", "0");
      d3.selectAll(".mouse-per-line circle").style("opacity", "0");
      d3.selectAll(".mouse-per-line text").style("opacity", "0");
      d3.selectAll(".x-text").style("opacity", "0");
    })
    .on("mouseover", function() {
      // hide line, circles and text
      d3.select(".mouse-line").style("opacity", "1");
      d3.selectAll(".mouse-per-line circle").style("opacity", "1");
      d3.selectAll(".mouse-per-line text").style("opacity", "1");
      d3.selectAll(".x-text").style("opacity", "1");
    })
    .on("mousemove", function() {
      var mouse = d3.mouse(this);
      var xDate = vue.x.invert(mouse[0]);
      d3.select(".x-text")
        .attr(
          "transform",
          "translate(" + mouse[0] + ", " + (vue.height + 30) + ")"
        )
        .text(vue.timeformat(xDate));
      d3.select(".mouse-line").attr("d", function() {
        var d = "M" + mouse[0] + "," + (vue.height + 10);
        d += " " + mouse[0] + "," + 0;
        return d;
      });
      d3.selectAll(".mouse-per-line").attr("transform", function(d, i) {
        //var bisect = d3.bisector(function(d) {
        //  return d.date;
        //}).right;
        //var idx = bisect(d.values, xDate);

        if (!lines[i]) {
          return;
        }

        var beginning = 0,
          end = lines[i].getTotalLength(),
          target = null;

        var pos;
        while (true) {
          target = Math.floor((beginning + end) / 2);
          pos = lines[i].getPointAtLength(target);
          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            break;
          }
          if (pos.x > mouse[0]) end = target;
          else if (pos.x < mouse[0]) beginning = target;
          else break; //position found
        }

        d3.select(this)
          .select("text")
          .text(
            vue
              .senses_y(d.id)
              .invert(pos.y)
              .toFixed(2)
          );

        return "translate(" + mouse[0] + "," + pos.y + ")";
      });
    });
}

function parseValue(s) {
  if (s) {
    // TODO support simple values
    return parseFloat(s.split("|")[0]);
  } else {
    return null;
  }
}

const dateTypes = ["minutes", "hours", "days"];

export default {
  name: "History",
  props: {
    thing: String
  },
  data() {
    return {
      from: {
        number: 1,
        type: "days"
      },
      to: {
        number: 0,
        type: "minutes"
      },
      config: {},
      dateTypes: dateTypes
    };
  },
  pouch: {
    sensesWrite() {
      if (this.thing) {
        var selector = {
            _id: {
              $gt: "sensesWrite/"+this.thing+'$'+this.fromDate.format()
            }
        }
        if (this.to.number !== 0) {
          selector._id.$lt = "sensesWrite/"+this.thing+'$'+this.toDate.format();
        }
        return {
          database: "idiot",
          selector: selector,
          fields: ['timestamp', 'senses', 'write']
        }
      }
    }
  },
  computed: {
    fromDate() {
      return moment()
        .utc()
        .subtract(this.from.number, this.from.type);
    },
    toDate() {
      return moment()
        .utc()
        .subtract(this.to.number, this.to.type);
    },
    test() {
      this.redraw();
    }

  },
  mounted() {
    this.initialize();
    this.$pouch.sync("idiot", process.env.VUE_APP_DB_URL, {
      selector: {
        _id: {
          $gt: "sensesWrite/"+this.thing,
          $lt: "sensesWrite/"+this.thing+'{'
        }
      }
    }); // TODO either don't sync the whole DB or keep that db short and make another one, idiot-history for anything more than a day old
  },
  methods: {
    initialize: initialize,
    redraw: redraw,
    quote: function quote(s) {
      return '"' + s + '"';
    },
    getConfig: getConfig,
    addHorizontalGrid: addHorizontalGrid,
    addVerticalGrid: addVerticalGrid,
    getAlias: getAlias,
    getColor: getColor,
    senses_line: senses_line,
    senses_y: senses_y
  }
};
</script>

<style>
.axis--x path {
  display: none;
}

.line {
  fill: none;
  stroke: steelblue;
  stroke-width: 1.5px;
}

#graph {
  min-width: 960px;
  min-height: 500px;
}

line.grid {
  fill: none;
  stroke: lightgrey;
  opacity: 0.8;
  stroke-width: 1px;
}
</style>
