/*

Javascript-funksjonalitet for booking-sjef-bruker

*/

//Visning og skjuling av divs for å vise korrekt info for fanesystemet
function bookingsjeffane(index) {
    if (index=="0") { //Viser den økonomiske rapporten
        $("#listofscenes").show();
        $("#ecorapport_knapp").css("background",selectedcolor);

        $("#prisgenerering").hide();
        $("#manager_tilbud").hide();
        $("#kalender").hide();
        $("#kalender_knapp").css("background",defaultcolor);
        $("#prisgen_knapp").css("background",defaultcolor);
        $("#tilbud_knapp").css("background",defaultcolor);
    }
    else if (index == "1") { // Viser prisgenereringen
        $("#prisgenerering").show();
        $("#prisgen_knapp").css("background",selectedcolor);

        $("#listofscenes").hide();
        $("#manager_tilbud").hide();
        $("#kalender").hide();
        $("#kalender_knapp").css("background",defaultcolor);
        $("#ecorapport_knapp").css("background",defaultcolor);
        $("#tilbud_knapp").css("background",defaultcolor);
    }
    else if (index == "2") { //Viser tilbud mottat fra Booking Ansvarlig
        $("#manager_tilbud").show();
        $("#tilbud_knapp").css("background",selectedcolor);

        $("#listofscenes").hide();
        $("#prisgenerering").hide();
        $("#kalender").hide();
        $("#kalender_knapp").css("background",defaultcolor);
        $("#ecorapport_knapp").css("background",defaultcolor);
        $("#prisgen_knapp").css("background",defaultcolor);
    }
    else if (index == "3") { //Viser kalender for ledige tidspunkt for konserter.
        $("#kalender").show();
        $("#kalender_knapp").css("background",selectedcolor);

        $("#listofscenes").hide();
        $("#prisgenerering").hide();
        $("#manager_tilbud").hide();
        $("#tilbud_knapp").css("background", defaultcolor);
        $("#ecorapport_knapp").css("background",defaultcolor);
        $("#prisgen_knapp").css("background",defaultcolor);
    }
}

//Starter oppbygging av hele den økonomiske rapporten. Henter scenelistene.
function getListOfScenesForBookingSjef(bruker) {

    l = [];

    $.ajax({ url: '/database.php?method=getListOfScenes',
        data: {username: bruker.name, usertype: bruker.type},
        type: 'post',
        success: function(output) {
            l = safeJsonParse(output); //gjør en try-catch sjekk.
            let overskrift = $("<h2></h2>").text('Økonomisk rapport').addClass('brukeroverskrift');
            let BSscenelist = $("<div></div>").attr('id', 'listofscenes').addClass('listofscenesForCalender')
            $('#divBS').append(BSscenelist);
            let container = $("<div></div>").addClass("scenelist");
            $('#listofscenes').append(overskrift, container);

            for (i in l) {
                let scenediv = $("<ul></ul>").addClass("scene"+l[i].sid);
                $('.scenelist').append(scenediv);
                getListOfConcertesBySceneForBookingSjef(bruker,l[i])
            }

        },
        error: function(xmlhttprequest, textstatus, message) {
            if(textstatus==="timeout") {
                alert("Timeout feil, kan ikke koble til databasen");
            } else {
                console.log("Error: "+message);
            }
        }
    });


}

// Lager et html-element med konserter filtrert etter scene
function getListOfConcertesBySceneForBookingSjef(bruker, scene) { //Bygger scenene til den økonomiske rapporten
    $.ajax({ url: '/database.php?method=getListOfConcertsByScene',
        data: {username: bruker.name, usertype: bruker.type, sceneid: scene.sid, fid:current_fid},
        type: 'post',
        success: function(output) {

            let l = safeJsonParse(output); //gjør en try-catch sjekk.

            let scenePoint = $("<li></li>").addClass("scenePoint");
            let concerts = buildListOfConcerts(bruker,l,scene.sid); //Bygger konsertene. Common.js funksjon.
            let sceneHead = $("<li></li>").text(scene.navn);
            let sceneInfo = $("<li></li>").text("Maks plasser: " + scene.maks_plasser);

            scenePoint.append(concerts);

            $('.scene'+scene.sid).append(sceneHead,sceneInfo,scenePoint);

        },
        error: function(xmlhttprequest, textstatus, message) {
            if(textstatus==="timeout") {
                alert("Timeout feil, kan ikke koble til databasen");
            } else {
                console.log("Error: "+message);
            }
        }
    });
}

//Setter inn inforasjon i økonomisk rapport til bookingsjef
function BSbuildConcertReport(kid, sname, container){

  $.ajax({ url: '/database.php?method=getConcertReport',
      data: {cid : kid , fid:current_fid},
      type: 'post',
      success: function(output) {

          l = safeJsonParse(output); //gjør en try-catch sjekk.
          // Vi bygger et HTML-element
          let listContainer = $("<div></div>").addClass("concertReportContainer");
          listContainer.append('<br>');
          for (i in l) {

              let sjanger = $("<span></span><br>").text('Sjanger: ' + l[i].sjanger);
              let kostnad = $("<span></span><br>").text('Kostnad: ' + l[i].kostnad);
              let billettpris = $("<span></span><br>").text('Billettpris: ' + l[i].billettpris );
              let EcResult = $("<span></span><br>").text('Økonomisk resultat: ' + ((l[i].billettpris * l[i].tilskuere) - l[i].kostnad));
              let inntekt = $("<span></span><br>").text('Inntekt: ' + l[i].billettpris * l[i].tilskuere)
              if(!(l[i].billettpris)){
                billettpris =  $("<span></span><br>").text('Billettpris: Utilgjengelig');
                EcResult = $("<span></span><br>").text('Økonomisk resultat: Utilgjengelig');
                inntekt = $("<span></span><br>").text('Inntekt: Utilgjengelig');
              }
              let tilskuere = $("<span></span><br>").text('Tilskuere: ' + l[i].tilskuere);
              if(!(l[i].tilskuere)){
                tilskuere = $("<span></span><br>").text('Tilskuere: Utilgjengelig');
                EcResult = $("<span></span><br>").text('Økonomisk resultat: Utilgjengelig');
                inntekt = $("<span></span><br>").text('Inntekt: Utilgjengelig');
              }
              listContainer.append(sjanger, kostnad, billettpris, tilskuere, inntekt,  EcResult, '<br>');
          }
          $(container).append(listContainer);

      },
      error: function(xmlhttprequest, textstatus, message) {
          if(textstatus==="timeout") {
              alert("Timeout feil, kan ikke koble til databasen");
          } else {
              console.log("Error: "+message);
          }
      }
  });
}


// Gir prisforslag på alle scener til konserter uten registrert billettpris
function concertPricing(){
  let l = [];

  $.ajax({ url: '/database.php?method=getConcertPricingInfo',
  data: {},
  type: 'post',
  success: function(output) {
    l = safeJsonParse(output);
    let container = $("<div></div>").attr('id', 'prisgenerering');
    let overskrift = $("<h2></h2>").text("Prisgenerering for konserter uten satt pris");
    container.append(overskrift);

    // Legger HTML-kode for hver konsert i listen
    for (i in l[0]){
      let konsertDiv = $("<div></div>");
      let konsertHeader = $("<h4></h4>").text(l[0][i].knavn);
      let konsertBand = $("<span></span><br>").text("Band: " + l[0][i].bnavn);
      let konsertKostnad = $("<span></span><br>").text("Kostnad for band: " + l[0][i].kostnad + " kr.");

      let prisForslagByscenen = Math.ceil(l[0][i].kostnad*5 / l[1][0].maks_plasser);
      let prisForslagStorsalen = Math.ceil(l[0][i].kostnad*5 / l[1][1].maks_plasser);
      let prisForslagAmfiet = Math.ceil(l[0][i].kostnad*5 / l[1][2].maks_plasser);
      let konsertPrisByscenen = $("<span></span><br>").text("Prisforslag Byscenen: " + prisForslagByscenen + " kr.");
      let konsertPrisStorsalen = $("<span></span><br>").text("Prisforslag Storsalen: " + prisForslagStorsalen + " kr.");
      let konsertPrisAmfiet = $("<span></span><br>").text("Prisforslag Amfiet: " + prisForslagAmfiet + " kr.");
      konsertDiv.append(konsertHeader, konsertBand,'<br />', konsertKostnad,'<br />', konsertPrisByscenen, konsertPrisStorsalen, konsertPrisAmfiet);
      container.append(konsertDiv);
    }
    $("#divBS").append(container);
  },
  error: function(xmlhttprequest, textstatus, message) {
      if(textstatus==="timeout") {
          alert("Timeout feil, kan ikke koble til databasen");
      } else {
          console.log("Error: "+message);
      }
  }
});
}

//Bygger en liste for dager i konserten.
function createListOfConcertDays(){

    $.ajax({ url: '/database.php?method=getListOfConcertDays',
        data: {fid: current_fid},
        type: 'post',
        success: function(output) {
            let l = safeJsonParse(output);

            //Her hentes det ut informasjon om start og sluttdatoer
            let startdate = l.startDag;
            let sluttdate = l.sluttDag;

            //Endrer format av datoobjektene for å bedre presentere dem
            let dateArray = [];
            let date = new Date(startdate);
            let e = new Date(sluttdate);
            date.setDate(date.getDate()-1);

            while(date < e) {
              dateArray.push(date);
              date = new Date(date.setDate(date.getDate() + 1));
            }

            //Bygger opp generell kode for siden
            let headline = $("<h2></h2>").text('Kalender').addClass('brukeroverskrift');
            let calscenelist = $("<div></div>").attr('id', 'kalender')
            $('#divBS').append(calscenelist);
            let calcontainer = $("<div></div").addClass("calscenes")

            //Looper gjennom alle datoer for å skape datoelementer
            for(let i = 0; i < dateArray.length; i++){
                let calenderText = dateArray[i].toString();
                let calenderText2 = calenderText.substr(0,16);
                let calenderID = dateArray[i].yyyymmdd();
                let concertButton = $("<button></button>").addClass("concert_button").addClass("calenderButton").addClass('disabledButton').attr('id','knapp'+ calenderID).text("Mer info").attr('disabled', true);
                let mainCalenderHeadline = $('<div></div>');
                let headlineStatus = $('<div></div>').text("Denne datoen er ledig").attr('id', 'Status' + calenderID).addClass('headlineStatus');
                let calenderHeadline = $('<div></div>').text(calenderText2).addClass('calenderHeadline');
                mainCalenderHeadline.append(calenderHeadline, headlineStatus);
                let standardTextForCalender = $('<p></p>').text("Denne datoen er ledig").attr('id','Standard'+calenderID);
                let temp = $('<div></div>').attr('id',calenderID).addClass('datoliste').addClass('concertInfo').css('display', 'none');
                let calenderItemsDiv = $('<div></div>').addClass('calenderItemsDiv');
                temp.append(standardTextForCalender);
                calenderItemsDiv.append(mainCalenderHeadline, concertButton, temp);
                $(calcontainer).append(calenderItemsDiv);
            }
            //Kjører funksjoner for appending av informasjon til datoer.
            //Henter først ut konserter som er satt
            getConcertsForCalender();
            //Henter ut tilbud
            getOffersForCalender();
            $('#kalender').append(headline, calcontainer);


        },
        error: function(xmlhttprequest, textstatus, message) {
            if(textstatus==="timeout") {
                alert("Timeout feil, kan ikke koble til databasen");
            } else {
                console.log("Error: "+message);
            }
        }
    });
}


 //Hentet fra https://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
 //Brukes til reformatering av datoen for å kunne bruke den som ID
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};


//Appender konserter inn i kalenderen
function getConcertsForCalender(){
    let l = [];

    $.ajax({ url: '/database.php?method=getConcertsForCalender',
        data: {},
        type: 'post',
        success: function(output) {
            l = safeJsonParse(output);
            for(i in l){
                // Henter ut elementene basert på ID for å sjekke om det skal bygges på denne datoen
                let element = document.getElementById(new Date(l[i].dato).yyyymmdd());
                if(element){
                    // Henter ut IDer for å gjemme standardstatus når det ikke er noe planlagt den dagen
                    let knappID = '#knapp' +new Date(l[i].dato).yyyymmdd()
                    $(knappID).removeAttr('disabled').removeClass('disabledButton');
                    let standardID = '#Standard' +new Date(l[i].dato).yyyymmdd() ;
                    $(standardID).css('display','none');
                    let statusID = '#Status' +new Date(l[i].dato).yyyymmdd() ;
                    $(statusID).css('display','none')
                    // Bygger opp elementene som skal vises fra konserten
                    let concertCalenderDiv = $('<div></div>').addClass('CalenderDiv');
                    let concertCalenderName = $('<p></p>').text(l[i].navn + ' | ' + l[i].knavn).addClass('unknown').addClass("statusMessages");
                    let concertCalenderTime = $('<p></p>').text(l[i].start_tid + ' - ' + l[i].slutt_tid );
                    let concertCalenderSjanger = $('<p></p>').text(l[i].sjanger);
                    let concertCalenderScene = $('<p></p>').text(l[i].snavn);

                    // Sjekker for nullverdier
                    let concertCalenderEconomics = $('<p></p>').text('Kostnad: ' + l[i].kostnad + ' | Tilskuere: ' + l[i].tilskuere + ' | Billettpris: ' + l[i].billettpris);
                    if(!(l[i].billettpris)){
                        concertCalenderEconomics = $('<p></p>').text('Kostnad: ' + l[i].kostnad + ' | Tilskuere: ' + l[i].tilskuere + ' | Billettpris: Ikke tilgjengelig');
                    }
                    if(!(l[i].kostnad)){
                        concertCalenderEconomics = $('<p></p>').text('Kostnad: Ikke tilgjengelig' + ' | Tilskuere: ' + l[i].tilskuere + ' | Billettpris: ' + l[i].billettpris);
                    }
                    if(!(l[i].tilskuere)){
                        concertCalenderEconomics = $('<p></p>').text('Kostnad: ' + l[i].kostnad + ' | Tilskuere: Ikke tilgjengelig'  + ' | Billettpris: ' + l[i].billettpris);
                    }
                    if(!(l[i].billettpris) && !(l[i].kostnad)){
                        concertCalenderEconomics = $('<p></p>').text('Kostnad: Ikke tilgjengelig' + ' | Tilskuere: ' + l[i].tilskuere + ' | Billettpris: Ikke tilgjengelig');
                    }
                    if(!(l[i].billettpris) && !(l[i].tilskuere)){
                        concertCalenderEconomics = $('<p></p>').text('Kostnad: ' + l[i].kostnad + ' | Tilskuere: Ikke tilgjengelig' + ' | Billettpris: Ikke tilgjengelig');
                    }
                    if(!(l[i].tilskuere) && !(l[i].kostnad)){
                        concertCalenderEconomics = $('<p></p>').text('Kostnad: Ikke tilgjengelig' + ' | Tilskuere: Ikke tilgjengelig' + ' | Billettpris: ' + l[i].billettpris);
                    }
                    if(!(l[i].tilskuere) && !(l[i].kostnad) && !(l[i].billettpris)){
                        concertCalenderEconomics = $('<p></p>').text('Kostnad: Ikke tilgjengelig' + ' | Tilskuere: Ikke tilgjengelig' + ' | Billettpris: Ikke tilgjengelig');
                    }

                    // Legger inn informasjon inn i en div som gjør det mulig å skjule den
                    $(concertCalenderDiv).append(concertCalenderName, '<br /> <br />', concertCalenderScene,concertCalenderTime, concertCalenderSjanger, concertCalenderEconomics, '<br />');
                    let dateID = '#' +new Date(l[i].dato).yyyymmdd() ;
                    $(dateID).append(concertCalenderDiv);
                }
            }
        },
        error: function(xmlhttprequest, textstatus, message) {
            if(textstatus==="timeout") {
                alert("Timeout feil, kan ikke koble til databasen");
            } else {
                console.log("Error: "+message);
            }
        }
    });
}

function getOffersForCalender() {
    let l = [];

    $.ajax({ url: '/database.php?method=getOffersForCalender',
        data: {},
        type: 'post',
        success: function(output) {
            l = safeJsonParse(output);
            // Går gjennom alle elemente basert på dato så vi kan sjekke om det finnes tilbud på aktuell dato.
            for(i in l){
                let element = document.getElementById(new Date(l[i].dato).yyyymmdd());
                // gjennomføring av sjekk for om det eksisterer noe denne datoen
                if(element){
                    let knappID = '#knapp' +new Date(l[i].dato).yyyymmdd()
                    $(knappID).removeAttr('disabled').removeClass('disabledButton');
                    let offerCalenderStatusMessage;
                    let offerCalenderDiv = $('<div></div>').addClass('CalenderDiv').addClass('concertInfo');

                    // For å sette rett status basert på bitflag - så vi vet korrekt status
                    switch(l[i].status){
                        case 0:
                            offerCalenderStatusMessage = $('<p></p>').text(l[i].navn + ' | Tilbud sendt fra Bookingansvarlig').addClass('partial-accept');
                            break;
                        case 1:
                            offerCalenderStatusMessage = $('<p></p>').text(l[i].navn + ' | Venter på svar fra manager').addClass('partial-accept');
                            break;
                        case 2:
                            offerCalenderStatusMessage = $('<p></p>').text(l[i].navn + ' | Godkjent av manager').addClass('accept');
                            break;
                    }

                    //class for css
                    offerCalenderStatusMessage.addClass("statusMessages");

                    //skjule ikke brukt informasjon
                    let standardID = '#Standard' +new Date(l[i].dato).yyyymmdd() ;
                    $(standardID).css('display','none');
                    let statusID = '#Status' +new Date(l[i].dato).yyyymmdd() ;
                    $(statusID).css('display','none');

                    //legger inn informasjon
                    let offerCalenderTime = $('<p></p>').text(l[i].start_tid + ' - ' + l[i].slutt_tid );
                    let offerCalenderScene = $('<p></p>').text(l[i].snavn);
                    $(offerCalenderDiv).append(offerCalenderStatusMessage, '<br />', '<br />', offerCalenderScene, offerCalenderTime, '<br />');
                    let dateID = '#' +new Date(l[i].dato).yyyymmdd() ;
                    $(dateID).append(offerCalenderDiv);
                }
            }
        },
        error: function(xmlhttprequest, textstatus, message) {
            if(textstatus==="timeout") {
                alert("Timeout feil, kan ikke koble til databasen");
            } else {
                console.log("Error: "+message);
            }
        }
    });
}
