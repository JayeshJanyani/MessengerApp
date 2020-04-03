import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

var firebaseConfig = {
    apiKey: "AIzaSyB-vASEsx9OLBipCDcn8DI0nZ1FAboG1kg",
    authDomain: "react-slack-clone-66b33.firebaseapp.com",
    databaseURL: "https://react-slack-clone-66b33.firebaseio.com",
    projectId: "react-slack-clone-66b33",
    storageBucket: "react-slack-clone-66b33.appspot.com",
    messagingSenderId: "1800357471",
    appId: "1:1800357471:web:910e5e34e14058ae0bbdea",
    measurementId: "G-R3LSX52QK4"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase