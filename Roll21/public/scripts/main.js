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
rhit.fbChatManager = null;
rhit.fbTokenManager = null;

rhit.FB_TOKEN_URL = "url";
rhit.FB_DIV_ID = "divID";

function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#logIn").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
		document.querySelector("#signUp").onclick = (event) => {
			const inputEmailEl = document.querySelector("#createUser")
			const inputPasswordEl = document.querySelector("#createPassword");
			const inputPasswordElv = document.querySelector("#verifyPassword");
			if (inputPasswordEl.value != inputPasswordElv.value) {
				console.error("Passwords do not match");
				return;
			}
			rhit.fbAuthManager.createAccount(inputEmailEl.value, inputPasswordEl.value);
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
		const inputEmailEl = document.querySelector("#inputUser").value;
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
		

		document.querySelector("#account").onclick = (event) => {
			window.location.href = `/index.html?`;
		};
	}
}

rhit.Token = class {
	constructor(id, url, divID) {
		this.id = id;
		this.url = url;
		this.divID = divID;
	}
}

rhit.MapPageController = class {

	_createRow(num) {
		//return htmlToElement(`<div ondrop="drop(event)" ondragover="allowDrop(event)" class="square" ><img class="aBox" draggable="true" ondragstart="drag(event)"></div>`);
		return htmlToElement(`<div class="square" ><img alt="&nbsp;" id="${num}" class="aBox" draggable="true" ondragstart="event.dataTransfer.setData('text',src)" onerror='this.style.display = "none"' style="display: none" onload="this.style.display=''"></div>`);
	}

	constructor() {
		let rows = document.querySelectorAll(".row");
		let newRows = new Array(10);
		let total = 0;
		for(let i=0; i<10;i++){
			newRows[i] = new Array(10);
			for(let k=0; k<10;k++){
				newRows[i][k] = this._createRow(total);
				total++;
			}
		}
		let g = 0;
		rows.forEach(row => {
			for (let j = 0;j < 10;j++) {
				row.appendChild(newRows[g][j]);
			}
			g++;
			
		});

		//Source: https://developer.mozilla.org/en-US/docs/Web/API/Document/drag_event
		var dragged;

		document.addEventListener("dragstart", function(event) {
			dragged = event.target;
		})

		document.addEventListener("dragover", function(event) {
			// prevent default to allow drop
			event.preventDefault();
		  }, false);

		document.addEventListener("drop", (event) =>  {
			// prevent default action (open as link for some elements)
			event.preventDefault();
			let image = event.target;
			if (image.tagName == "DIV") {
				image = image.querySelector("img");
			}
			if (image.tagName == "IMG" && image.className == "aBox" && dragged.src.length > 0) {
				const temp = dragged.src;
				dragged.src = "";
				image.src = temp;
				rhit.fbTokenManager.updateToken(dragged.id, image.id);
				//this.updateMap(image,dragged);
			}
		}, false);

		
		document.querySelector("#submitToken").onclick = (event) => {
			const url = document.getElementById("urlInput").value;
			rhit.fbTokenManager.addToken(url);
		};


		document.querySelector("#textBox").addEventListener = (event) => {
			
		};
		document.querySelector("#sendButton").onclick = (event) => {
			this.chat();
		};

		

		//Testing Code
		
		//this.addToken("https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS9G6twYx6wf6mYqKkZ06hTaR4BPmR8k_02eA&usqp=CAU");
		//document.getElementById(10).src = "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS9G6twYx6wf6mYqKkZ06hTaR4BPmR8k_02eA&usqp=CAU";
		//document.getElementById(18).src = "https://wiki.teamfortress.com/w/images/thumb/d/d8/Engineer.png/375px-Engineer.png";
		//document.getElementById(56).src = "https://img.favpng.com/15/24/12/team-fortress-2-engineering-taunting-science-png-favpng-3g9hvBzWy43XBAa9RWPJGGMpj.jpg";
		//document.getElementById(70).src = "https://i.redd.it/i51xeosj0bc31.png";
		
		//dragElement(document.querySelectorAll(".columns"));	
		rhit.fbTokenManager.beginListening(this.updateMap.bind(this));
	}

	

	updateMap(newPos, oldPos) {
		console.log("Updating Map");
		//console.log(rhit.fbTokenManager.length);

		for (let j = 0;j < 100;j++) {
			document.getElementById(j).src = "";
		}

		for (let i=0;i < rhit.fbTokenManager.length;i++) {
			const tk = rhit.fbTokenManager.getTokenAt(i);
			document.getElementById(tk.divID).src = tk.url;
		}

		return;
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

rhit.fbTokenManager = class {
	constructor() {
		console.log("Created TokenManager")
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("Campaigns").doc("Map").collection("Tokens");
		this._unsubscribe = null;
	}

	addToken(url) {
		console.log("Add Token");
		const location = this._ref;
		location.doc().set({
			[rhit.FB_TOKEN_URL]: url,
			[rhit.FB_DIV_ID]: "starter" 
		}).then(function (docRef) {
			console.log("Document written with ID: ", docRef.id);
		}).catch(function (error) {
			console.log("Error adding documents: ", error);
		});
		document.getElementById("starter").src = url;
	}

	getTokenAt(index) {
		const docSnapShot = this._documentSnapshots[index];
		const token = new rhit.Token(
			docSnapShot.id, 
			docSnapShot.get(rhit.FB_TOKEN_URL), 
			docSnapShot.get(rhit.FB_DIV_ID)
		);
		return token;
	}

	async updateToken(oldDIV, newDIV) {
		//console.log(`${oldDIV} --> ${newDIV}`);
		let query = await this._ref.where(rhit.FB_DIV_ID, "==", oldDIV).get();
		if (query.empty) {
			console.log("ERROR: Could not find Token")
		} else {
			query.forEach(async doc => {
				this._ref.doc(doc.id).update({
					[rhit.FB_DIV_ID]: newDIV
				})
			});
		}
		//tokenRef.set();
	}

	beginListening(changeListender) {
		this._unsubscribe = this._ref
			.onSnapshot((querySnapshot) => {
			//console.log("Map update");
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
}

rhit.Chat = class {
	constructor(uid, text) {
		this.sender = uid;
		this.chat = text;
	}
}

rhit.FbChatManager = class { /*
	constructor() {
		console.log("You created ChatManager");
		this._documentSnapshots = [];
		this._ref = null;//firebase.firestore().collection(rhit.FB_CHAT_COLLECTION);
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
	} */
} 

rhit.HomePageController = class {
	constructor() {
		document.querySelector("#friends").addEventListener = (event) => {
		
		};
		document.querySelector("#campaigns").addEventListener = (event) => {
		
		};
		document.querySelector("#game").onclick = (event) => {
			window.location.href = `/map.html?`;
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
		rhit.fbTokenManager = new rhit.fbTokenManager();
		new rhit.MapPageController();
	}

	if(document.querySelector("#homePage")) {
		console.log("You are on the map page.")
		new rhit.HomePageController();
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
