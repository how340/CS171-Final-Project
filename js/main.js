// load data using promises
let promises = [

  d3.csv("data/internet_language_data.csv"),

];

Promise.all(promises)
  .then(function (data) {
      initMainPage(data)
  })
  .catch(function (err) {
      console.log(err)
  });

// initMainPage
function initMainPage(dataArray) {

  myvis = new InternetLangVis('internetLang', dataArray[0]);

  

}

