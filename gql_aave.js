function getDataGQL() {
  var url_query = 'https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw';
  
  var query = '{\
                borrows(first:1000, skip: skip_param){\
                id,\
                amount,\
                reserve{\
                   id,\
                   symbol\
                 }\
                borrowRate,\
                borrowRateMode,\
                timestamp\
               }\
              }'

  data = getApiData_(url_query, query)
  writeData_(data)

}

/**
* Creates the query with the skip param to iterate all the borrows
* @param the query to executed with the skip param replaced
**/
function createOptions_(query){
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify({ query: query}) 
  };
  return options
}


/**
* Writes the data in the spreadsheet 
* @param matrix data to write
**/
function writeData_(data){
    Logger.log(data.length)
    var ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ss.getRange(2, 1, data.length, data[0].length).clear()
    ss.getRange(2, 1, data.length, data[0].length).setValues(data);  
}


/**
* Gets the data from the api and transform the result 
* getting the json data fields to a 
* array to write in the spreadsheet
**/
function getApiData_(url_query, query){
  var totalData = []
  var areData = true
  var skip = 0
  
  while(areData){
    var queryIter = query.replace("skip_param", skip.toString());
    var options = createOptions_(queryIter)
    var response = UrlFetchApp.fetch(url_query, options)
    var json = response.getContentText();
    var data = JSON.parse(json);
    var arrayData = data['data']['borrows']
    
    var grouped = arrayData.map(function(e){
      return [e['id'],
              e['amount'] / 1e18,
              e['reserve']['symbol'],
              e['borrowRate'] / 1e27, 
              e['borrowRateMode'], 
              e['timestamp']]
    })
    
    totalData.push(...grouped)
    skip += 1000
    
    areData = arrayData.length > 0
  }
  
  return totalData
}
