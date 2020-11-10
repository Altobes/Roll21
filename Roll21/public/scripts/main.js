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
rhit.fbCampaignManager = null;

rhit.FB_TOKEN_URL = "url";
rhit.FB_DIV_ID = "divID";

rhit.FB_UID = "uid";
rhit.FB_CHAT =  "message";
rhit.FB_KEY_LAST_TOUCHED =  "timestamp";

rhit.FB_CODE = "code";
rhit.FB_CREATOR = "creator";
rhit.FB_USERS = "users";
rhit.FB_NAME = "name";

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

		document.querySelector("#deleteToken").onclick = (event) => {
			rhit.fbTokenManager.deleteToken();
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
		this._ref = firebase.firestore().collection("Campaigns").doc(rhit._selected).collection("Tokens");
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
	}

	async deleteToken() {
		let query = await this._ref.where(rhit.FB_DIV_ID, "==", "starter").get();
		if (query.empty) {
			console.log("ERROR: Could not find Token")
		} else {
			query.forEach(async doc => {
				this._ref.doc(doc.id).delete();
			});
			console.log("Token Deleted");
			document.getElementById("#starter").src = "";
		}
	}

	beginListening(changeListender) {
		this._unsubscribe = this._ref
			.onSnapshot((querySnapshot) => {
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
	constructor(uid, text, time) {
		this.sender = uid;
		this.chat = text;
		this.timestamp = time;
	}
}

rhit.FbChatManager = class { 
	constructor() {
		console.log("You created ChatManager");
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("Campaigns").doc("ChatHistory").collection("Chats");
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
		document.querySelector("#campaigns").onclick = (event) => {
			window.location.href = `/campaigns.html?`;
		};
		document.querySelector("#game").onclick = (event) => {
			window.location.href = `/map.html?`;
		};
		document.querySelector("#settings").addEventListener = (event) => {
		
		};

	}
}

rhit.Campaign = class {
	constructor(id, name, creator) {
		this.id = id;
		this.name = name;
		this.creator = creator;
	}
}

rhit.CampaignPageController = class {
	constructor(creator, code) {
		document.querySelector("#create").onclick = (event) => {
			const name = document.getElementById("campName").value;
			if (name.empty) {
				console.error("Need name"); //Add prompt
			} else {
				rhit.fbCampaignManager.createCampaign(name);
			}
			
		};

		document.querySelector("#addPlayer").onclick = (event) => {
			const name = document.getElementById("player").value;
			if (name.empty) {
				console.error("Need name"); //Add prompt
			} else {
				rhit.fbCampaignManager.addPlayer(name);
			}
			
		};

		document.querySelector("#selectCampaign").onclick = (event) => {
			const camp = document.getElementById("campaigns").value;
			if (name.empty) {
				console.error("Need name"); //Add prompt
			} else {
				rhit.fbCampaignManager.addPlayer(name);
			}
			
		};

		rhit.fbCampaignManager.beginListening(this.updateList.bind(this));

	}

	_createOption(camp) {
		return htmlToElement(`<option value="${camp}">${camp}</option>`);
	}

	updateList() {
		const camp = document.querySelector("#campaigns");
		for (let i=0;i < rhit.fbCampaignManager.length;i++) {
			const cm = rhit.fbCampaignManager.getCampaignAt(i);
			console.log(cm.creator);
			if (cm.creator != rhit.fbAuthManager.uid) {
				continue;
			}

			camp.appendChild(this._createOption(cm.name));
		}
	}
}

rhit.FbCampaignManager = class {
	constructor() {
		console.log("Created CampaignManager")
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("Campaigns");
		this._unsubscribe = null;
		this._selected = null;
	}
	createCampaign(name) {
		console.log("Create Campagin");
		this._ref.add({
			[rhit.FB_CREATOR]: rhit.fbAuthManager.uid,
			[rhit.FB_NAME]: name,
			[rhit.FB_USERS]: [rhit.fbAuthManager.uid]
		}).then(function (docRef) {
			console.log("Document written with ID: ", docRef.id);
			docRef.collection("Tokens").add({
				[rhit.FB_TOKEN_URL]: "data:image/png;base64,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",
				[rhit.FB_DIV_ID]: "starter" 
			})
			docRef.collection("ChatHistory").add({
				[rhit.FB_UID]: "System",
				[rhit.FB_CHAT]:  "Chat Start",
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now()
			})
		}).catch(function (error) {
			console.log("Error adding documents: ", error);
		});
		
	}

	getCampaignAt(index) {
		const docSnapShot = this._documentSnapshots[index];
		const camp = new rhit.Campaign(
			docSnapShot.id, 
			docSnapShot.get(rhit.FB_NAME),
			docSnapShot.get(rhit.FB_CREATOR)
		);
		return camp;
	}

	 addPlayer(username) {
		
	}

	 updateToken(oldDIV, newDIV) {
		//console.log(`${oldDIV} --> ${newDIV}`);
		let query =  this._ref.where(rhit.FB_DIV_ID, "==", oldDIV).get();
		if (query.empty) {
			console.log("ERROR: Could not find Token")
		} 
	}

	 deleteToken() {
		let query = this._ref.where(rhit.FB_DIV_ID, "==", "starter").get();
		if (query.empty) {
			console.log("ERROR: Could not find Token")
		}
	}

	beginListening(changeListender) {
		this._unsubscribe = this._ref
			.onSnapshot((querySnapshot) => {
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


rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("is SignedIn = ",rhit.fbAuthManager.isSigndIn);
	});
	rhit.fbCampaignManager = new rhit.FbCampaignManager(); 

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
	if(document.querySelector("#campaignPage")) {
		
		new rhit.CampaignPageController();
		
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
