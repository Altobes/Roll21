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
		const inputEmailEl = document.querySelector("#inputUser").valuel;
		const inputPasswordEl = document.querySelector("#inputPassword").value;
		firebase.auth().signInWithEmailAndPassword(inputEmailEl + "@shmee.edu", inputPasswordEl).then(function () {
			window.location.href = `/home.html`;
		}).catch = (error) => {
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
		firebase.auth().createUserWithEmailAndPassword(inputEmailEl + "@shmee.edu", inputPasswordEl).then(function () {
			window.location.href = `/home.html`;
		}).catch = (error) => {
			var errorCode = error.code;
			var errorMessage = error.messgage;
			console.log("creation error", errorCode, errorMessage);
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
			rhit.fbAuthManager.createAccount(inputEmailEl.value, inputPasswordEl.value);
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

		document.querySelector("#textBox").keypress(function (e) {
			if(e.which == 13) {
				this.chat();
			}	
		});
	}

	chat() {
		const text = document.querySelector("#textBox").value;
		db.collection("Campaigns").doc("Chat_Histry").collection("Chats").doc(chat).add({
			Message: text,
			Timestamp: new Date(),
			UserID: fbAuthManager._user
		})
		.then(function(docRef) {
			console.log("Chat sent succesfully");
			let box = document.querySelector("#chatBox");
			box.value = box.value + "/n" + text;
		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
		});
	}
}

rhit.Chat = class {
	constructor(uid, text) {
		this.sender = uid;
		this.chat = text;
	}
}

rhit.FbChatManager = class {
	constructor() {
		console.log("You created ChatManager");
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_CHAT_COLLECTION);
		this._unsubscribe = null;
	}
	add(uid, text) {
		//console.log(url + " " + title);
		this._ref.add({
			[rhit.FB_UID]: url,
			[rhit.FB_CHAT]: title,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now()
		}) 
		.then(function (docRef) {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function (error) {
			console.log("Error adding document: ", error);
		})
	}
	beginListening(changeListender) {
		this._unsubscribe = this._ref
			.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc")
			.limit(50)
			.onSnapshot((querySnapshot) => {
			console.log("chat update");
			this._documentSnapshots = querySnapshot.docs;
			changeListender();
		});
	}
	stopListening() {
		this._unsubscribe ();
	}
	get length() {
		return this._documentSnapshots.length;
	}
	getChatAtIndex(index) {
		const docSnapShot = this._documentSnapshots[index];
		const ch = new rhit.Chat(
			docSnapShot.sender, 
			docSnapShot.get(rhit.CHAT), 
		);
		return ch;
	}
}

rhit.HomePageController = class {
	constructor() {
		document.querySelector("#friends").addEventListener = (event) => {
		
		};
		document.querySelector("#campaigns").addEventListener = (event) => {
		
		};
		document.querySelector("#game").addEventListener = (event) => {
		
		};
		document.querySelector("#settings").addEventListener = (event) => {
		
		};

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
