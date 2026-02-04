
import { auth } from "./your-firebase-config-file.js"; // Adjust the path!
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";

// Grab DOM elements
// Fix: Cast document elements to HTMLInputElement to satisfy TypeScript that they possess a 'value' property
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const loginBtn = document.getElementById('login-btn') as HTMLElement;
const signupBtn = document.getElementById('signup-btn') as HTMLElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLElement;

// --- ACTIONS ---

// Sign Up
signupBtn.onclick = async () => {
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    alert("Account Created!");
  } catch (err) {
    alert((err as Error).message);
  }
};

// Login
loginBtn.onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (err) {
    alert("Login failed: " + (err as Error).message);
  }
};

// Logout
logoutBtn.onclick = () => signOut(auth);

// --- THE OBSERVER (The "Brain") ---
onAuthStateChanged(auth, (user) => {
  const loginSection = document.getElementById('login-section');
  const dashboard = document.getElementById('dashboard');
  const userDisplay = document.getElementById('user-display');

  if (user) {
    // User is logged in
    if (loginSection) loginSection.style.display = "none";
    if (dashboard) dashboard.style.display = "block";
    if (userDisplay) userDisplay.innerText = "Logged in as: " + user.email;
  } else {
    // User is logged out
    if (loginSection) loginSection.style.display = "block";
    if (dashboard) dashboard.style.display = "none";
  }
});
