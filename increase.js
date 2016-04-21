document.addEventListener("DOMContentLoaded", function(event) {
  var defaultValues = {
    input1: {
      rent: 900,
      percent: 4
    },
    input2: {
      rent: 950,
      percent: 3
    },
    input3: {
      rent: 1000,
      percent: 2
    }
  }
  var formula = {
    a: 0,
    b: -1/50,
    c: 22
  }
  function getFormulaForGraph() {
    var f = formula
    var fun = "function(x) {\nreturn ["
    var eq = f.a +"* Math.pow(x, 2) + "+ f.b +"* x + "+ f.c
    var end = "]\n}"
    return fun + eq + end
  }

  function setUp(values) {
    var form = document.getElementById('rent-input')
    while (form.firstChild) {
      form.removeChild(form.firstChild)
    }
    for (var i = 1; i < 4; i++) {
      let div = document.createElement('div')
      div.id = 'input' + i

      let input = '<br>Current Rent: <input type="text" class="rent" value="$'+ values[div.id].rent +'"><br>Increase by: <input type="text" class="percent" value="'+ values[div.id].percent +'%">'
      div.innerHTML = input
      form.appendChild(div)
    }
    var submitButton = document.createElement('input')
    submitButton.type = 'submit'
    submitButton.style.margin = "15px 75px"
    submitButton.value = 'Reassess'

    form.appendChild(submitButton)
  }
  setUp(defaultValues)

  function getInputData(form) {
    var data = {}
    for (var i = 0; i < form.children.length; i++) {
      let input = form.children[i]
      if (!/input/.test(input.id)) continue;

      let dataInput = data[input.id] = {}
      for (var j = 0; j < input.children.length; j++) {
        let inputBox = input.children[j]

        if (inputBox.localName === 'input') {
          if (!/\d/.test(inputBox.value)) {
            alert("Please enter a number");
            throw "No number"
          }
          let value = +(inputBox.value.match(/[\d\.]/g).join(''))
          dataInput[inputBox.className] = value
        }
      }
    }
    setUp(data)
    return data
  }

  function adjustForPeak() {
    var rentInputs = document.getElementsByClassName('rent')
    var x1 = +(rentInputs[0].value.match(/[\d\.]/g).join(''));
    var x2 = +(rentInputs[rentInputs.length - 1].value.match(/[\d\.]/g).join(''));
    var vertex = Math.round(-formula.b / (2 * formula.a))
    if (vertex > x1 && vertex < x2) {
      console.log("Vertex: ", vertex)
      console.log("X: ", x1, x2)
      alert("Percent are too close together")
    }
  }

  function calculateFormula(data, flag) {
    let l = Object.keys(data)
    var A = new Array(l)
    var B = new Array(l);
    for (let key in data) {
      let input = data[key]
      let index = +(/\d+/.exec(key)[0]) - 1
      let rent = input.rent
      let percent = input.percent

      A[index] = ([Math.pow(rent, 2), rent, 1])
      B[index] = ([percent])
    }

    A = math.matrix(A)
    B = math.matrix(B)
    // console.log(A, math.inv(A), B)
    var formulaMatrix = math.multiply(math.inv(A), B)
    let formulaKeys = 'abcdefghijklmnopqrstuvwxyz'
    for (var i = 0; i < formulaMatrix._data.length; i++) {
      formula[formulaKeys[i]] = formulaMatrix._data[i][0]
    }
    if (flag) {
      adjustForPeak()
      plot()
    }
  }

  function calculatePercent (rent, f) {
    if (typeof rent !== 'number') {
      rent = +(rent.match(/[\d\.]/g).join(''))
    }
    let percent = f.a*Math.pow(rent, 2) + f.b*rent + f.c
    return percent < 0 ? 0 : percent
  }

  function calculateRent(rent, f) {
    if (!f) f = formula
    if (typeof rent !== 'number') {
      rent = +(rent.match(/[\d\.]/g).join(''))
    }
    let percent = calculatePercent(rent, f)
    if (percent < 0) {percent = 0}

    return rent * (1 + percent / 100)
  }

  function writeDOM(rent, f) {
    if (!/\d/.test(rent)) {
      alert("Please enter a number");
      throw "No number"
    }

    if (typeof rent !== 'number') {
      rent = +(rent.match(/[\d\.]/g).join(''))
    }

    let percent = calculatePercent(rent, f)
    let final = calculateRent(rent, f)
    let delta = +Math.round(final) - +Math.round(rent)

    document.getElementById('percent-applied').innerHTML = percent.toFixed(2) + "%"
    document.getElementById('rent-difference').innerHTML = "$" + Math.round(delta)
    document.getElementById('final-rent').innerHTML = "$" + Math.round(final)
    document.getElementById('start-rent').value = "$" + rent
  }

  function plot() {
    var plotButton = document.getElementById("plot");
    // var eq = document.getElementById("eq").value;
    var eq = getFormulaForGraph();
    eval("fn = " + eq);

    var graph = document.getElementById("graph_div");
    var width = parseInt(graph.style.width, 10);
    var rentInputs = document.getElementsByClassName('rent')
    var x1 = +(rentInputs[0].value.match(/[\d\.]/g).join(''));
    var x2 = +(rentInputs[rentInputs.length - 1].value.match(/[\d\.]/g).join(''));
    var xs = 1.0 * (x2 - x1) / width;

    var data = [];
    for (var i = 0; i < width; i++) {
      var x = x1 + i * xs;
      var y = fn(x);
      var row = [x];
      if (y.length > 0) {
        for (var j = 0; j < y.length; j++) {
          row.push(y[j]);
        }
      } else {
        row.push(y);
      }
      data.push(row);
    }

    new Dygraph(graph, data, {
      ylabel: 'Percent Increase (%)',
      xlabel: 'Current Rent ($)',
      labels: ['Rent', 'Increase'],
      animatedZooms: true,
      digitsAfterDecimal: 2,
      interactionModel: 'nonInteractiveModel',
      valueFormatter: function
      (num_or_millis, opts, seriesName, dygraph, row, col) {
        if (seriesName === "Rent") {
          num_or_millis = "Rent: $" + Math.round(num_or_millis)
        } else if (seriesName === "Increase") {
          num_or_millis = num_or_millis.toFixed(2) + "%"
        }
        return num_or_millis
      }
    });
  };
  // plotButton.onclick = plot;
  plot();

  function setRange (s, e) {
    return {
      s: {
        c: s.c,
        r: s.r
      },
      e: {
        c: e.c,
        r: e.r
      }
    }
  }

  function itterateThrough(sheet, cb) {
    var r = sheet['!range']
    var letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (var R = r.s.r; R <= r.e.r; R++) {
      for (var C = r.s.c; C <= r.e.c; C++) {
        let address = letter[C] + (R + 1)
        cb(sheet[address], address)
      }
    }
  }

  function handleFile(e) {
    var files = e.target.files;
    var i,f;
    for (i = 0, f = files[i]; i != files.length; ++i) {
      var reader = new FileReader();
      var name = f.name;
      console.log(f)
      reader.onload = function(e) {
        var data = e.target.result;

        var workbook = XLSX.read(data, {type: 'binary'});
        var worksheet = workbook.Sheets[workbook.SheetNames[0]]
        worksheet['!range'] = setRange({c: 0, r: 0}, {c: 26, r: 0})
        var col;
        let letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        itterateThrough(worksheet, function (cell, address) {
          if (!cell) return
          if (/[Rr][Ee][Nn][Tt]/.test(cell.v)) {
            col = letter.indexOf(address[0])
          }
        })
        if (!col) col = letter.indexOf('M')
        let max = Math.max(...worksheet['!ref'].match(/\d+/g))
        worksheet['!range'] = setRange({c: col, r: 2}, {c: col, r: max})
        itterateThrough(worksheet, function (cell) {
          if (cell) {
            var final = +(Math.round(calculateRent(cell.v)).toFixed(2))
            cell.v = final
            cell.w = final.toFixed(2)
          }
        })
        console.log(worksheet)

        var fileName = f.name.split('.')
        let index = fileName.indexOf(fileName[fileName.length - 1]) - 1
        fileName[index] = fileName[index] + "-adjusted"
        fileName[fileName.length - 1] = 'xlsx'

        var wopts = { bookType:"xlsx", bookSST:false, type:'binary' };
        fileName = fileName.join('.')

        var wbout = XLSX.write(workbook,wopts);

        function s2ab(s) {
          var buf = new ArrayBuffer(s.length);
          var view = new Uint8Array(buf);
          for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
          return buf;
        }

        /* the saveAs call downloads a file on the local machine */
        saveAs(new Blob([s2ab(wbout)],{type:""}), fileName)
        /* DO SOMETHING WITH workbook HERE */
      };
      reader.readAsBinaryString(f);
    }
  }

  document.getElementById('upload-excel')
    .addEventListener('change', handleFile)

  document.getElementById('rent-input').addEventListener('submit', function (e) {
      e.preventDefault()
      var data = getInputData(e.target)
      calculateFormula(data, true)
      var rent = document.getElementById('start-rent').value
      writeDOM(rent, formula)
  })

  document.getElementById('get-rent').addEventListener('submit', function (e) {
    e.preventDefault()
    var rent = document.getElementById('start-rent').value
    writeDOM(rent, formula)
  })

});
