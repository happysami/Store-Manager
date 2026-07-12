firebase.auth().onAuthStateChanged((user) => {
    const loginSection = document.getElementById('loginSection');
    const mainAppSection = document.getElementById('mainAppSection');

    if (user) {
        loginSection.style.display = 'none';
        mainAppSection.style.display = 'block';
    } else {
        loginSection.style.display = 'flex';
        mainAppSection.style.display = 'none';
    }
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(err => alert("Login Failed: " + err.message));
});

function logoutUser() {
    firebase.auth().signOut();
}
