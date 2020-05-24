# Phoneme 🔊
a redesigned version of the [IHS Voice website](ihsvoice.com) using React and Firebase!
use as a template for your own news sites.
created by [mobiusdonut](https://github.com/mobiusdonut). released under the [MIT License](https://opensource.org/licenses/MIT).
## Setup
Clone this repository, and download + extract the files.
Create and set up a [Firebase](firebase.google.com/) project with Authentication, Cloud Firestore, Storage, and Hosting.
Using the Firebase CLI, run `firebase login` and `firebase init` to initialize a new project in the directory. Select the new project when asked.
Copy and paste the Firebase SDK snippet into `/src/firebase.js`. It should look like this (sensitive info replaced with ########).
```
const firebaseConfig = {
  apiKey: "########",
  authDomain: "ihsvoice-f70bd.firebaseapp.com",
  databaseURL: "https://ihsvoice-f70bd.firebaseio.com",
  projectId: "ihsvoice-f70bd",
  storageBucket: "ihsvoice-f70bd.appspot.com",
  messagingSenderId: "########",
  appId: "########",
  measurementId: "########"
};
```
### Firebase
In Cloud Firestore, create the following collections:
```
firestore
└───articles
└───drafts
└───homepage-grid
└───users
```
In Storage, create the following folders:
```
storage
└───article-photos
└───staff-profiles
```
In the users collection, add a document with the following info:
```
└───id (i set this to first initial + last name)
│   │   bio (a short description about you)
│   │   email (this is what you'll use to log in)
│   │   id (again)
│   │   image (a link to a photo of you hosted in the staff-profiles folder of storage)
│   │   name (kimi no na wa)
│   │   position (set this to Editor if you're admin, Staff-Writer otherwise)
│   │   years (in the format 19-20, 20-21, etc.)
```
For both Cloud Firestore and Storage, set read permissions to true, and write permissions to with authentication.
Go to Authentication and add a user using the email you provided. If you want to let more people publish articles, do the same thing but with different names, emails, etc.
### React
Modify the code in `src/App.js` and `src/index.css` however you want. If you're using this for your own site, remove the references to Irvington High and the IHS Voice (unless you want to give us free publicity).
Run `npm install` to install Suneditor, React Router, and React Helmet.
Run `npm build` to build the project, and `firebase deploy` to deploy it.
Happy posting~
