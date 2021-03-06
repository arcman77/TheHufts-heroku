var express    = require('express');
var router     = express.Router();
var CryptoJS   = require("crypto-js");
var gateKeeper = require('./gateKeeper');
var Parse      = require('parse/node');
var AES        = require("crypto-js/aes");
var SHA256     = require("crypto-js/sha256");
var session    = require('client-sessions');


function aesDcrypt(string,key){
  var decrypted       = AES.decrypt(string, key);
  var decryptedString = CryptoJS.enc.Utf8.stringify(decrypted);
  return decryptedString;
}

function aesEncrypt(string,key){
  var encrypted       = AES.encrypt(string,key);
  //var encryptedString = CryptoJS.enc.Utf8.stringify(encrypted);
  var encryptedString = encrypted.toString();
  return encryptedString;
}

// function getUserAlgo(username,req,res,next){
//    //console.log("resetSessionAlgos req.body: " + JSON.stringify(req.body));
//    var requestType = "getAlgoFiles";
//    var User  = Parse.Object.extend("UserC");
//    var query = new Parse.Query(User);
//     query.equalTo( "username", username )//.select(userAttributes);
//     query.first().then(
//       function (object) {
//         console.log("LOGIN: Successfully retrieved user" + object.get("username"));
//         var accessToken = object.get('accessToken');
//         /////////////////////////////////////////////////////
//         //setting the session to the logged in user
//         var user         = {};
//         user.accessToken = accessToken;
//         user.username    = object.get('username');
//         var session_id   = aesEncrypt(user.username, "TheHufts");

//         user.email       = object.get('email');
//         var relation     = object.relation("algos");
//         relation.query().find().then(
//             function (list){
//               if (list.length == 0){  //the user has no uploaded algos
//                 user.algos = false;
//               }
//               else{ //storing users algos in user object
//                 list = list.map(function(algo){
//                   var encryptedAlgo = algo.get("encryptedString");
//                   var algoFile      = aesDcrypt(encryptedAlgo,req.body.accessKey);
//                   //return {algo: algoFile, name: algo.get("name") }
//                   return {name: algo.get("name")}
//                 });
//                 user.algos = list;
//               }
//               req.user = user;
//               req.session.user = user;  //refresh the session value
//               req.session.user.session_id = session_id;

//               res.locals.user  = user;
//                console.log("req.session resetSessionAlgos: ", JSON.stringify(req.session));
//                console.log("req.session size: "+ roughSizeOfObject(req.session));
//                next();
//               // console.log("req.cookies: resetSessionAlgos: ", req.cookies);
//             },
//             function (error){
//               console.log( "users-algos error: "+error);
//               next();
//             }
//           );//end relation-then function
//       },//end query user success function
//       function (error) {
//         console.log(" (line 205 app.js) LOGIN-Error: " + error.code + " " + error.message);
//         next();
//       }
//     ); //end query-first user
// }

function roughSizeOfObject( object ) {

    var objectList = [];

    var recurse = function( value )
    {
        var bytes = 0;

        if ( typeof value === 'boolean' ) {
            bytes = 4;
        }
        else if ( typeof value === 'string' ) {
            bytes = value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes = 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList[ objectList.length ] = value;

            for( i in value ) {
                bytes+= 8; // an assumed existence overhead
                bytes+= recurse( value[i] )
            }
        }

        return bytes;
    }

    return recurse( object );
}

function getDemoAlgoNames(req, res, next,response){
  var DemoAlgo  = Parse.Object.extend("DemoAlgo");
  var demoQuery = new Parse.Query(DemoAlgo);
  return demoQuery.find().then(
    function (list){
      console.log("getDemoAlgoNames: ",list);
      list.forEach(function (algo){
          response.algos.push( { name: algo.get("name"), demo: true, fileType: algo.get("fileType") });
      });//end forEach
      console.log('sending response')
      response = JSON.stringify(response);
      res.send(response);
    },//end list success
    function (error){
      console.log("getAlgoNames getDemoAlgoNames error:");
      console.log(error);
      res.send("could not find demo algos");
    }//end list error
  )//end tempRelation.query().then()
}

router.post('/', function (req, res, next) {
  console.log("getAlgoNames req.session.user: ",req.session.user)
  var response = {};
  response["algos"] = [];
  if(req.session.user){
     // if user is logged in
     var list = req.session.user.algos;
     if (list){
       response["algos"] = list;
       response = JSON.stringify(response);
       res.send(response);
     }
     else{//user has no uploaded algos
       getDemoAlgoNames(req, res, next, response);
     }
  }
  else{//not logged in?
    getDemoAlgoNames(req, res, next, response);
  }
});

module.exports = router;
module.exports.roughSizeOfObject = roughSizeOfObject;
