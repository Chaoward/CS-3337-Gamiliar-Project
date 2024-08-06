const PATH = "./games.json";

module.exports = {basicSearch};


//===== basicSearch ==============================
/** Returns a list of 25 or less game Ids that match
 *  the input string passed in. Case Independent, but
 *  heavly prefix dependent.*/
//================================================
function basicSearch(input) {
    input = input.toLowerCase();
    const games = require(PATH);

    //save prefix at half of the string
    let prefix = input.substring( 0,  (input.length - 1) / 2 );
    let foundList = [];

    //linear search prefix match and save
    for (const gameId in games) {
      if (games[gameId].toLowerCase().startsWith(prefix))
        foundList.push(gameId);
    }
  
    //sort
    quicksort_desc(foundList, 0, foundList.length-1);
  
    //return first 25 entries
    let returnList = [];
    let perfectList = [];
    for (let i = 0; i < foundList.length && i < 25; i++) {
        if ( games[foundList[i]].toLowerCase().startsWith(input) )
            perfectList.push(foundList[i]);
        else
            returnList.push( foundList[i] );
      
    }
    
    return perfectList.concat(returnList);
}



//===== quicksort_desc ===========================================================
function quicksort_desc(list, lowbound, highbound) {
    if ( lowbound < highbound ) {
        //partition
        let q = partition(list, lowbound, highbound);
        //recurse
        quicksort_desc(list, lowbound, q-1);
        quicksort_desc(list, q+1, highbound);
    }
  }

  function partition(list, lowbound, highbound) {
    let pivot = Math.floor(Math.random() * (highbound - lowbound + 1) ) + lowbound;
    //let pivot = highbound;
    exchange(list, pivot, highbound);
    let i = lowbound - 1;
    for (let j = lowbound; j < highbound; ++j) {
      if (list[j] > list[highbound]) {
        i++;
        exchange(list, i, j);
      }
    }
    exchange(list, highbound, i + 1);
    
    return i + 1;
  }
  
  function exchange(list, index1, index2) {
    let temp = list[index1];
    list[index1] = list[index2];
    list[index2] = temp;
  }
//===== *END* quicksort_desc *END* ===============================================