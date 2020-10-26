/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.fbAuthManager = null;

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#logIn").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};

		document.querySelector("#noAccount").onclick = (event) => {
			window.location.href = `/signup.html?`;
		};
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();

			if (user) {
				console.log('uid :>> ', this._user.uid);
			} else {
				console.log("There is no user signed in");
	
			}
		});
	}
	signIn() {
		firebase.auth().signInWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value).catch = (error) => {
			var errorCode = error.code;
			var errorMessage = error.messgage;
			console.log("sign in error", errorCode, errorMessage);
		}		  
	}
	signOut() {
		firebase.auth().signOut().then(function () {
			console.log("You are now signed out")
		}).catch(function (erro) {
			console.log("Sign out error");
		});
	}
	createAccount(inputEmailEl, inputPasswordEl) {
		firebase.auth().createUserWithEmailAndPassword(inputEmailEl.value + "@shmee.edu", inputPasswordEl.value).catch = (error) => {
			var errorCode = error.code;
			var errorMessage = error.messgage;
			console.log("sign in error", errorCode, errorMessage);
		}		  
	}
	get isSigndIn() {
		return !!this._user
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.SignUpPageController = class {
	constructor() {
		document.querySelector("#signUp").onclick = (event) => {
			const inputEmailEl = document.querySelector("#inputUser")
			const inputPasswordEl = document.querySelector("#inputPassword");
			rhit.fbAuthManager.createAccount(inputEmailEl, inputPasswordEl);
		};

		document.querySelector("#account").onclick = (event) => {
			window.location.href = `/index.html?`;
		};
	}
}

rhit.MapPageController = class {
	constructor() {
		document.querySelector("#textBox").addEventListener = (event) => {
			const inputEmailEl = document.querySelector("#inputUser")
			const inputPasswordEl = document.querySelector("#inputPassword");
			rhit.fbAuthManager.createAccount(inputEmailEl, inputPasswordEl);
		};

		$(function() {
			$("#textBox").keypress(function (e) {
				if(e.which == 13) {
					//submit form via ajax, this is not JS but server side scripting so not showing here
					$("#chatBox").append($(this).val() + "<br/>");
					$(this).val("");
					e.preventDefault();
				}
			});
		});
	}
}


rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("is SignedIn = ",rhit.fbAuthManager.isSigndIn);
	});

	if(document.querySelector("#loginPage")) {
		console.log("You are on the login page.")
		
		new rhit.LoginPageController();
	}

	if(document.querySelector("#signUpPage")) {
		console.log("You are on the sign up page.")
		
		new rhit.SignUpPageController();
	}

	if(document.querySelector("#mapPage")) {
		console.log("You are on the map page.")
		
		new rhit.MapPageController();
	}
	
};





rhit.startFirebaseUI = function() {
	 // FirebaseUI config.
	 var uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
      };
      const ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.main();
