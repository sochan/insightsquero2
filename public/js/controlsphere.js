function eegCommands(usrClickedStr){
    $.get("/eeg/commands", function(data){
        if (data != "err"){
          var elapse =5; // in seconds; it will get commands during this elapse

          var myTs = (Date.now()/1000)-elapse; // current time in seconds
          var jsonData = JSON.parse(data);
          //console.log(jsonData);
          console.log(jsonData.length);
          var commands = [];
          var nbcommands =[];

          if (jsonData.length > 1){
            for (var i=1; i< jsonData.length; i++){

              //console.log(jsonData[i]);
              var myjs = JSON.parse(jsonData[i]);
              //console.log(myjs.com[0]);

              if (myjs.time >= myTs)// Get the commands while user clicked
              {
                  commands.push(myjs);
                  nbcommands.push(commandToNumber(myjs.com[0]));
              }
              //console.log(myjs.time);
            }
          }

          // analyse the percentage of each command
          var analyseOutputCom = analyseMentalCommands(nbcommands);
          //console.log(analyseOutputCom);
          
          // Displaying
          var comtosphere = appendTableAnalyse(usrClickedStr, analyseOutputCom, "eeg_sphere2");
          //console.log(commands);
          
          //console.log(comtosphere);
          if (comtosphere != 0)
          {
            // Post eeg mental commands to server
            $.post("/eeg/tosphero", {commands:JSON.stringify(comtosphere)}, function(data){
              console.log(data);
            });
          }
        }
      });
}
// it will return the most commands
function analyseMentalCommands(mentalCommands){
  var analyse_commands = {
    push : { score: 0, num: 1},
    pull : { score: 0, num: -1}
  }
  if (mentalCommands.length > 0){
    console.log(mentalCommands);
    var sc1 = mentalCommands.filter(x => x==analyse_commands.push.num).length;
    console.log(sc1);
    analyse_commands.push.score = sc1/mentalCommands.length;
    
    var sc2 = mentalCommands.filter(x => x==analyse_commands.pull.num).length;
    analyse_commands.pull.score = sc2/mentalCommands.length;
  }
  
  return analyse_commands;
}

const controls = {
  PUSH : "push",
  PULL: "pull",
  NEUTRAL: "neutral"
};

function commandToNumber(strCommand){
  switch (strCommand) {
    case controls.PUSH:
      return 1;
      break;
    case controls.PULL:
      return -1;
    default:
      return 0;
      break;
  }
}

function appendTableAnalyse(userClickText, analyseCom, tableId){
    var tableRef = document.getElementById(tableId).getElementsByTagName('tbody')[0];

    // Insert a row in the table at the last row
    var newRow   = tableRef.insertRow();

    // Insert a cell in the row at index 0
    var c1  = newRow.insertCell(0);

    // Append a text node to the cell
    var usrClicked  = document.createTextNode(userClickText);
    c1.appendChild(usrClicked);

    // % push
    var c2 = newRow.insertCell(1);
    var pushSc = analyseCom.push.score;
    var push = document.createTextNode(pushSc);
    c2.appendChild(push);

    // % push
    var c3 = newRow.insertCell(2);
    var pullSc =  analyseCom.pull.score;
    var pull = document.createTextNode(pullSc);
    c3.appendChild(pull);

    // % Neutral
    var c4 = newRow.insertCell(3);
    var neutral = document.createTextNode(1-pushSc-pullSc);
    c4.appendChild(neutral);

    // Output command
    var c5 = newRow.insertCell(4);

    var outputStr = "-";
    var com = 0;
    if (pullSc > pushSc){
       outputStr = "pull";
       com=-1;
    }
    else if (pushSc > pullSc){
      outputStr = "push";
      com =1;
      }

    var outputText = document.createTextNode(outputStr);
    c5.appendChild(outputText);
  return com;
}

function appendTable(userClickText, data, tableId){
    var tableRef = document.getElementById(tableId).getElementsByTagName('tbody')[0];

    data.forEach(itm => {
        // Insert a row in the table at the last row
        var newRow   = tableRef.insertRow();

        // Insert a cell in the row at index 0
        var c1  = newRow.insertCell(0);

        // Append a text node to the cell
        var usrClicked  = document.createTextNode(userClickText);
        c1.appendChild(usrClicked);

        var c2 = newRow.insertCell(1);
        var eegCom = document.createTextNode(itm.com[0]);
        c2.appendChild(eegCom);

        var c3 = newRow.insertCell(2);
        var dispayTime = new Date(itm.time);
        var time = document.createTextNode(dispayTime.getHours() +'-'+dispayTime.getMinutes() + '-'+ dispayTime.getSeconds()+ '-'+dispayTime.getMilliseconds());
        c3.appendChild(time);
    });
}

/** Push and Pull Buttons */
function buttonClick(obj){
  //console.log($(obj).text());
  eegCommands($(obj).text());
}

/** Save Button to save displaying table into json */
function getTableData(id) {
 // function to get table cells data (from: https://coursesweb.net/ )
 // receives table ID. Returns 2 dimensional array with TD data in each row
  var t_rows = document.getElementById(id).querySelectorAll('tbody tr');    // rows from tbody
  var t_data = [];    // will store data from each TD of each row
  var ix = 0;    // index of rows in t_data

  // gets and dds td data in t_data
  for(var i=0; i<t_rows.length; i++) {
    var row_tds = t_rows[i].querySelectorAll('td');
    if(row_tds.length > 0) {
      t_data[ix] = [];
      for(var i2=0; i2<row_tds.length; i2++) t_data[ix].push((row_tds[i2].innerText || row_tds[i2].textContent));
      ix++;
    }
  }
  return t_data;
}

