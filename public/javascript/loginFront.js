

function encrypt(string,key){
  var encrypted = CryptoJS.AES.encrypt(string,key).toString();
  return encrypted;
}

function decrypt(string,key){
  var decrypted = CryptoJS.AES.decrypt(string, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}



function formSubmitListener(){
  var confirmation  = "TheHufts";


  //var gateKeeperURL = "U2FsdGVkX1/TgCOk5cMhFLg/9AnetMh2IYRno+wQGk78aKwkRS39/rop2c/Cm3SpOtrz2UQHSNgZOie01+kZQg==";
  //var gateKeeperURL = "https://" + domain +"/gateKeeper/knockKnock"
  var gateKeeperURL = protocol + "//" + domain + "/gateKeeper/knockKnock";
  $("#logIn-button").on("click",function(event){
     event.preventDefault();
     console.log("form submitted");
     //var username = $('.login-form input[name="form-email"]').val();
     var email        = $('.login-form input[name="form-email"]').val();
     var password     = $('.login-form input[name="form-password"]').val();
     var passwordhash =  CryptoJS.SHA3(password).toString();

     //var data = { username: username, password: password, confirmation: confirmation, login:true};
     var data = { email: email, password: password, passwordhash: passwordhash, confirmation: confirmation, login:true, domain: domain, protocol: protocol};
     ajaxLoginRouter(data,gateKeeperURL,confirmation);//decrypt(gateKeeperURL,confirmation));
  });

   $("#register-button").on("click",function(event){
     event.preventDefault();
     console.log("form submitted");
     var username = $('.login-form input[name="form-name"]').val();
     var password = $('.login-form input[name="form-password"]').val();
         password =  CryptoJS.SHA3(password).toString();
     var    email = $('.login-form input[name="form-email"]').val();
     var     data = { username: username, password: password, email: email, confirmation: confirmation, login:false, domain: domain, protocol: protocol };
     ajaxLoginRouter(data,gateKeeperURL,confirmation);//decrypt(gateKeeperURL,confirmation));
  });
}

function ajaxLoginRouter(data,url){
  data = JSON.stringify(data);
  $.ajax({
          url: url,
          type: "get"
      }).
  done(function(response){
    var key = response;
    //console.log(key);
    data = encrypt(data, key);
    //var loginURL = "U2FsdGVkX18QPZdMyeLqAkP32qAdsz5D1W4iRNrujhzK7jsbsxqL4Fur1NrXDNfk34cDezQ52BUvIP7WBT71sg==";
    var loginURL = protocol+ '//' + domain + '/login';
    var confirmation = encrypt("TheHufts",key);
    $.ajax({
        url: loginURL,//decrypt(loginURL,"TheHufts"),
        type: "post",
        data: {data: data}
    })
    .done(function (response){
      console.log(response);
      response = JSON.parse(response);
      if(response["redirect"]){
        window.location.href = response["redirect"];
      }
      // $('html').html(response);

      if(response == "{error-code:k}"){
        var retryURL = this.url;
        var retryData = this.data;
        ajaxLoginRouter(retryData,retryURL);
      }
      //console.log(userAlgos)
    });
  });
}



$(document).on("ready",function(){
  //navboxListener();
  formSubmitListener();
})