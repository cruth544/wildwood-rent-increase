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

  function calculateFormula(data) {
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
    plot()
  }

  function calculateRent(rent, f) {
    if (!/\d/.test(rent)) {
      alert("Please enter a number");
      throw "No number"
    }
    rent = +(rent.match(/[\d\.]/g).join(''))
    let percent = f.a*Math.pow(rent, 2) + f.b*rent + f.c
    if (percent < 0) {percent = 0}
    let final = rent * (1 + percent / 100)
    let delta = +Math.round(final) - +Math.round(rent)

    document.getElementById('percent-applied').innerHTML = percent.toFixed(2) + "%"
    document.getElementById('rent-difference').innerHTML = "$" + Math.round(delta)
    document.getElementById('final-rent').innerHTML = "$" + Math.round(final)
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

  function uploadExcel(file) {
    console.log(file)
  }
  document.getElementById('upload-excel').addEventListener('change', function (e) {
    // var workbook = new Excel.Workbook()
    console.log(console.log(e.target.value))
  })

  document.getElementById('rent-input').addEventListener('submit', function (e) {
      e.preventDefault()
      var data = getInputData(e.target)
      console.log(data)
      calculateFormula(data)
      var rent = document.getElementById('start-rent').value
      calculateRent(rent, formula)
  })

  document.getElementById('get-rent').addEventListener('submit', function (e) {
    e.preventDefault()
    var rent = document.getElementById('start-rent').value
    calculateRent(rent, formula)
  })

});
