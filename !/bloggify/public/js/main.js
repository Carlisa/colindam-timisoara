$(function () {

    var config = {
        apiKey: "AIzaSyDyu3h3yn4WtCp9kQKr53gwYJ3PEVDTN50",
        authDomain: "asdasdasdasd-bd2ff.firebaseapp.com",
        databaseURL: "https://asdasdasdasd-bd2ff.firebaseio.com",
        storageBucket: "asdasdasdasd-bd2ff.appspot.com",
        messagingSenderId: "905761980454"
    };
    firebase.initializeApp(config);

    var db = firebase.database();
    var usersRef = db.ref("users");

    $(".show-auth").hide();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            usersRef.child(user.uid).once("value").then(function (church) {
                var $humansTable = $(".humans-table").empty().get(0);
                if ($humansTable) {
                    JSONEditor.defaults.languages.en.button_add_row_title = "Adaugă {{0}}";
                    JSONEditor.defaults.languages.en.button_delete_row_title_short = "Șterge";
                    var editor = new JSONEditor($humansTable, {
                        theme: 'bootstrap3',
                        disable_collapse: true,
                        disable_array_delete_last_row: true,
                        disable_array_reorder: true,
                        disable_array_delete_all_rows: true,
                        schema: {
                            "title": "Persoane de colindat",
                            "type": "array",
                            "format": "table",
                            "items": {
                                "type": "object",
                                "title": "Persoană",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "required": true,
                                        "title": "Nume"
                                    },
                                    "address": {
                                        "type": "string",
                                        "title": "Adresa"
                                    },
                                    "phone": {
                                        "type": "string",
                                        "title": "Telefon"
                                    },
                                    "email": {
                                        "type": "string",
                                        "title": "Email"
                                    },
                                    "date": {
                                        "type": "string",
                                        "title": "Ora"
                                    },
                                    "proposed_by": {
                                        "type": "string",
                                        "title": "Propus de"
                                    }
                                }
                            },
                            "default": []
                        }
                    });

                    editor.on("change", function () {
                        usersRef.child(user.uid).child("persons").set(editor.getValue());
                    });

                    editor.setValue(church.val().persons);
                }
            });
        }

        $(".show-auth,.show-noauth").hide();
        $(".show-" + (user ? "" : "no") + "auth").show();
        $(".show-pending").hide();
        $("form :input").prop("disabled", false);
    });


    $(".sign-out").click(function () {
        firebase.auth().signOut();
    });

    //    $("form").parsley();
    $("form").on("submit", function (e) {
        e.preventDefault();

        var $this = $(this);
        $this.parsley().validate();
        if (!$this.parsley().isValid()){
            return;
        }
        var formType = $this.data("form");

        var data = {};
        $this.serializeArray().forEach(function (c) {
          data[c.name] = c.value;
        });
        $this.find(":input").prop("disabled", true);

        var prom = null;
        switch (formType) {
            case "signup":
                prom = firebase
                  .auth()
                  .createUserWithEmailAndPassword(data.email, data.password)
                  .then(function (user) {
                      data.role = "user";
                      usersRef.child(user.uid).set(data);
                      location = "/admin";
                  })
                break;
            case "signin":
                prom = firebase
                   .auth()
                   .signInWithEmailAndPassword(data.email, data.password)
                break;
        }

        prom.catch(function (err) {
            $this.find(":input").prop("disabled", false);
            alert(err.message);
        });
    });
});

Parsley.addMessages('ro', {
  defaultMessage: "Acest câmp nu este completat corect.",
  type: {
    email:        "Trebuie să scrii un email valid.",
    url:          "Trebuie să scrii un link valid",
    number:       "Trebuie să scrii un număr valid",
    integer:      "Trebuie să scrii un număr întreg valid",
    digits:       "Trebuie să conțină doar cifre.",
    alphanum:     "Trebuie să conțină doar cifre sau litere."
  },
  notblank:       "Acest câmp nu poate fi lăsat gol.",
  required:       "Acest câmp trebuie să fie completat.",
  pattern:        "Acest câmp nu este completat corect.",
  min:            "Trebuie să fie ceva mai mare sau egal cu %s.",
  max:            "Trebuie să fie ceva mai mic sau egal cu %s.",
  range:          "Valoarea trebuie să fie între %s și %s.",
  minlength:      "Trebuie să scrii cel puțin %s caractere.",
  maxlength:      "Trebuie să scrii cel mult %s caractere.",
  length:         "Trebuie să scrii cel puțin %s și %s cel mult %s caractere.",
  mincheck:       "Trebuie să alegi cel puțin %s opțiuni.",
  maxcheck:       "Poți alege maxim %s opțiuni.",
  check:          "Trebuie să alegi între %s sau %s.",
  equalto:        "Trebuie să fie la fel."
});

Parsley.setLocale('ro');
