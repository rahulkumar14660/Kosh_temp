import React from "react";
import styles from "./LandingPage.module.css";
import illustration from "../../assets/image.png";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
function LandingPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate()
  return (
    <div className={styles.landingPageContainer}>
      <header className={styles.header}>
        <div className={styles.logoCreative}>
          <div className={styles.logoCircle}></div>
          <span className={styles.logoText}>Kosh</span>
        </div>
        <div className={styles.decorativeGeometry}>
          <svg className={styles.hexagon} viewBox="0 0 100 100">
            <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" />
          </svg>
          <svg className={styles.circle} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" />
          </svg>
          <div className={styles.wave}></div>
        </div>
        <button className={styles.getStartedButton} onClick={() => { isAuthenticated ? navigate("/home") : navigate("/login") }}>Login</button>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.textSection}>
          <h1 className={styles.heading}>
            Unified Enterprise Resource Platform
          </h1>
          <p className={styles.description}>
          Manage your business effortlessly with Kosh’s all-in-one solution. Now featuring Library Management, Asset Management, Employee Lifecycle Management, and Audit Trails — everything you need to track knowledge, physical assets, people, and actions in one secure, scalable platform. Simple. Powerful. Transparent.
          </p>
          <button className={styles.readMoreButton} onClick={() => { isAuthenticated ? navigate("/home") : navigate("/login") }}>Get Started</button>
        </div>
        <div className={styles.illustrationSection}>
          <img src={illustration} alt="Online Library Illustration" className={styles.illustrationImage} />
          <div className={styles.triangle1}></div>
          <div className={styles.triangle2}></div>
          <div className={styles.line1}></div>
          <div className={styles.line2}></div>
          <div className={styles.circle1}></div>
        </div>
      </main>
    </div>
  );
}
export default LandingPage;
