import React from "react";
import { FiLogIn, FiAlignJustify } from "react-icons/fi";
import { Link } from "react-router-dom";

import "./styles.css";

import logo from "../../assets/logo.svg";

const Home = () => {
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Eco app" className="src" />
                </header>

                <main>
                    <h1>Your waste collection marketplace.</h1>
                    <p>We help people to find collect points in an efficient way.</p>

                    <Link to="/register">
                        <span>
                            <FiLogIn />
                        </span>
                        <strong>Register a collect point</strong>
                    </Link>

                    <Link to="/places">
                        <span>
                            <FiAlignJustify />
                        </span>
                        <strong>List of all collect points</strong>
                    </Link>
                </main>
            </div>
        </div>
    )
}

export default Home;