import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(userRef);

        let userData;
        if (docSnap.exists()) {
          userData = docSnap.data();
        } else {
          userData = {
            displayName: user.displayName || "User",
            email: user.email || "No email",
            photoURL: user.photoURL || "https://via.placeholder.com/150",
          };
          await setDoc(userRef, userData); // Save data to Firestore if it doesn't exist
        }

        setUserData(userData);
        setIsLoggedIn(true);
        if (location.pathname === "/") {
          navigate("/home", { state: { userData } });
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const SignUpUsingGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, displayName, email, photoURL } = result.user;

      const userRef = doc(db, "Users", uid);
      const docSnap = await getDoc(userRef);

      let userData;
      if (!docSnap.exists()) {
        userData = { displayName, email, photoURL };
        await setDoc(userRef, userData);
      } else {
        userData = docSnap.data();
      }

      setUserData(userData);
      setIsLoggedIn(true);
      navigate("/home", { state: { userData } });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const Logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      setIsLoggedIn(false);
      navigate("/"); // Navigate back to Login page after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      const userRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(userRef);

      let userData;
      if (docSnap.exists()) {
        userData = docSnap.data();
      } else {
        userData = {
          displayName: user.displayName || "User",
          email: user.email || "No email",
          photoURL: user.photoURL || "https://via.placeholder.com/150",
        };
        await setDoc(userRef, userData); // Save data to Firestore if it doesn't exist
      }

      setUserData(userData);
      setIsLoggedIn(true);
      navigate("/home", { state: { userData } });
    } catch (error) {
      console.error("Login Error:", error.message);
    }
  };

  const handleRegister = () => {
    navigate("/register"); // Navigate to the Register page if needed
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-5 shadow-lg" style={{ maxWidth: "600px", width: "100%" }}>
        {!isLoggedIn ? (
          !isRegistering ? (
            <>
              <div>
                <h3 className="text-center mb-3">Login</h3>
              </div>
              <div className="form-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button onClick={SignUpUsingGoogle} className="btn btn-danger w-100 mb-3">
                <i className="bi bi-google"></i> Sign in with Google
              </button>
              <button onClick={handleLogin} className="btn btn-primary w-100 mb-3">
                Login
              </button>
              <button onClick={handleRegister} className="btn btn-outline-primary w-100">
                Register
              </button>
            </>
          ) : (
            // Register form here if needed
            <p>Register page</p>
          )
        ) : (
          <div className="text-center">
            <img
              src={userData.photoURL || "https://via.placeholder.com/150"}
              alt="profile"
              className="rounded-circle img-thumbnail mb-3"
              style={{ width: "100px", height: "100px" }}
            />
            <h5>{userData.displayName}</h5>
            <p className="text-muted">{userData.email}</p>
            <button className="btn btn-outline-danger" onClick={Logout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}  

export default Login;
